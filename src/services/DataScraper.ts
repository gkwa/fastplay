import { type Page } from "@playwright/test"
import { UsageData } from "../models/UsageData"
import { UsageParser } from "./UsageParser"
import { TracingService } from "../telemetry/tracer"
import { SpanStatusCode, type Span, context, trace } from "@opentelemetry/api"

export interface ScrapedData {
  text: string
  html: string
  date: string
  usage: UsageData
  units: string
}

export class DataScraper {
  private readonly tracer = TracingService.getInstance()

  constructor(private readonly page: Page) {}

  private async createChildSpan(parentSpan: Span, name: string): Promise<Span> {
    const tracer = this.tracer.getTracer()
    const ctx = trace.setSpan(context.active(), parentSpan)
    return tracer.startSpan(name, undefined, ctx)
  }

  async login(username: string, password: string): Promise<void> {
    return this.tracer.traceAsync("DataScraper", "login", async (context) => {
      try {
        const { span } = context

        const navigateSpan = await this.createChildSpan(span!, "navigate")
        await this.page.goto("https://my.astound.com/data_usage")
        navigateSpan.end()

        const credentialsSpan = await this.createChildSpan(span!, "fill-credentials")
        const usernameField = await this.page.locator("#username")
        await usernameField.fill(username)
        const passwordField = await this.page.locator("#password")
        await passwordField.fill(password)
        credentialsSpan.end()

        const submitSpan = await this.createChildSpan(span!, "submit-login")
        const loginButton = await this.page.getByRole("button", { name: "LOG IN" })
        await loginButton.click()
        submitSpan.end()

        const waitSpan = await this.createChildSpan(span!, "wait-redirect")
        await this.page.waitForURL("**/data_usage", {
          timeout: 30000,
          waitUntil: "networkidle",
        })
        waitSpan.end()

        const finalUrl = this.page.url()
        if (!finalUrl.includes("data_usage")) {
          throw new Error("Login redirect failed - unexpected destination")
        }
      } catch (error) {
        if (error instanceof Error && error.name === "TimeoutError") {
          const currentUrl = this.page.url()
          context.span?.setStatus({ code: SpanStatusCode.ERROR })
        }
        throw error
      }
    })
  }

  async scrape(): Promise<ScrapedData> {
    return this.tracer.traceAsync("DataScraper", "scrape", async (context) => {
      const text = await this.page.evaluate(() => document.body.innerText)
      const html = await this.page.content()

      const dateMatch = text.match(/as of (\d{4}-\d{2}-\d{2})/)
      if (!dateMatch) throw new Error("Could not parse date")

      const unitsMatch = text.match(/Total allotment\s+\d+\.?\d*\s*(\w+)/)
      if (!unitsMatch) throw new Error("Could not parse units")

      return {
        text,
        html,
        date: dateMatch[1],
        usage: await new UsageParser().parse(text),
        units: unitsMatch[1],
      }
    })
  }
}
