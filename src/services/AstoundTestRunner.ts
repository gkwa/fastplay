import { test, expect, Page } from "@playwright/test"
import { ConfigManager } from "../config/ConfigManager"
import { DataScraper } from "./DataScraper"
import { FileManager } from "./FileManager"
import { UsageRecord } from "../models/UsageData"

export interface AstoundTestConfig {
  useMockData?: boolean
  mockHtmlPath?: string
}

export class AstoundTestRunner {
  constructor(private readonly config: AstoundTestConfig) {}

  async run({ page }: { page: Page }) {
    const configManager = new ConfigManager("./.env")
    const dataDir = configManager.getDataDirectory()

    const fileManager = new FileManager(dataDir)
    await fileManager.initialize()

    const scraper = new DataScraper(page)

    if (this.config.useMockData) {
      if (!this.config.mockHtmlPath) {
        throw new Error("mockHtmlPath is required when useMockData is true")
      }
      await scraper.loadLocalHtml(this.config.mockHtmlPath)
    } else {
      const credentials = configManager.getCredentials()
      await scraper.login(credentials.username, credentials.password)
    }

    await expect(page.getByText("Data Usage For")).toBeVisible()

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const scrapedData = await scraper.scrape()

    await fileManager.saveScreenshot(page, timestamp)
    await fileManager.saveText(scrapedData.text, timestamp)
    await fileManager.saveHtml(scrapedData.html, timestamp)

    const record: UsageRecord = {
      date: scrapedData.date,
      amount: scrapedData.usage.current,
      amountUnits: scrapedData.units,
      total: scrapedData.usage.total,
      totalUnits: scrapedData.units,
      overage: scrapedData.usage.overage,
      overageUnits: scrapedData.units,
      scrapedAt: new Date().toISOString(),
    }

    await fileManager.saveUsageRecord(record, timestamp)

    return { scrapedData, record }
  }
}
