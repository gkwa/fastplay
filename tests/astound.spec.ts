import { test, expect } from "@playwright/test"
import { ConfigManager } from "../src/config/ConfigManager"
import { DataScraper } from "../src/services/DataScraper"
import { FileManager } from "../src/services/FileManager"
import { UsageRecord } from "../src/models/UsageData"

test.describe("Astound", () => {
  test("login and scrape usage", async ({ page }) => {
    const config = new ConfigManager("../.env")
    const credentials = config.getCredentials()
    const dataDir = config.getDataDirectory()

    const fileManager = new FileManager(dataDir)
    await fileManager.initialize()

    const scraper = new DataScraper(page)
    await scraper.login(credentials.username, credentials.password)

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
  })
})
