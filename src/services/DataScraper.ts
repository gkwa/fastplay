import { type Page } from "@playwright/test"
import { UsageData } from "../models/UsageData"
import { UsageParser } from "./UsageParser"

export interface ScrapedData {
  text: string
  html: string
  date: string
  usage: UsageData
  units: string
}

export class DataScraper {
  constructor(private readonly page: Page) {}

  async login(username: string, password: string): Promise<void> {
    await this.page.goto("https://my.astound.com/data_usage")
    await this.page.locator("#username").fill(username)
    await this.page.locator("#password").fill(password)
    await this.page.getByRole("button", { name: "LOG IN" }).click()
    await this.page.waitForURL("**/data_usage")
  }

  async scrape(): Promise<ScrapedData> {
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
  }
}
