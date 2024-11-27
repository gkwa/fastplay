import { Page } from "@playwright/test"
import { BaseDataScraper } from "./BaseDataScraper"
import { UsageParser } from "../UsageParser"
import { ScrapedData } from "../../models/ScrapedData"
import { Credentials } from "../../config/ConfigManager"

export class AstoundBillingDataScraper extends BaseDataScraper {
  private readonly usageParser: UsageParser

  constructor(page: Page) {
    super(page)
    this.usageParser = new UsageParser()
  }

  async login(credentials: Credentials): Promise<void> {
    await this.page.goto("https://my.astound.com/data_usage")
    await this.page.locator("#username").fill(credentials.username)
    await this.page.locator("#password").fill(credentials.password)
    await this.page.getByRole("button", { name: "LOG IN" }).click()
    await this.page.waitForURL("**/data_usage")
  }

  async scrape(): Promise<ScrapedData> {
    const text = await this.page.evaluate(() => document.body.innerText)
    const html = await this.page.content()

    const date = this.parseDate(text)
    const units = this.parseUnits(text)

    return {
      text,
      html,
      date,
      usage: await this.usageParser.parse(text),
      units,
    }
  }

  protected parseDate(content: string): string {
    const dateMatch = content.match(/as of (\d{4}-\d{2}-\d{2})/)
    if (!dateMatch) throw new Error("Could not parse date")
    return dateMatch[1]
  }

  protected parseUnits(content: string): string {
    const unitsMatch = content.match(/Total allotment\s+\d+\.?\d*\s*(\w+)/)
    if (!unitsMatch) throw new Error("Could not parse units")
    return unitsMatch[1]
  }
}
