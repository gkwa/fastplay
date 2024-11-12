import { test, expect } from "@playwright/test"
import { ConfigManager } from "../src/config/ConfigManager"
import { DataScraper } from "../src/services/DataScraper"
import { FileManager } from "../src/services/FileManager"
import { UsageRecord } from "../src/models/UsageData"
import path from "path"

test.describe("Astound Mock Tests", () => {
  const mockHtmlPath = "testdata/astound-data-usage-2024-11-10T05-56-21-584Z.html"

  test("scrape usage from local HTML file", async ({ page }) => {
    const config = new ConfigManager("./.env")
    const dataDir = config.getDataDirectory()

    const fileManager = new FileManager(dataDir)
    await fileManager.initialize()

    const scraper = new DataScraper(page)
    await scraper.loadLocalHtml(mockHtmlPath)

    await expect(page.getByText("Data Usage For")).toBeVisible()

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const scrapedData = await scraper.scrape()

    expect(scrapedData.usage).toBeDefined()
    expect(scrapedData.usage.total).toBeGreaterThan(0)
    expect(scrapedData.usage.current).toBeGreaterThanOrEqual(0)
    expect(typeof scrapedData.date).toBe("string")
    expect(scrapedData.units).toBe("GB")

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

  test("handles missing data in HTML correctly", async ({ page }) => {
    const scraper = new DataScraper(page)

    await page.setContent(`
     <html>
       <body>
         <div>Data Usage For Some Account</div>
       </body>
     </html>
   `)

    await expect(async () => await scraper.scrape()).rejects.toThrow("Could not parse")
  })

  test("parses different date formats correctly", async ({ page }) => {
    const scraper = new DataScraper(page)

    const dateFormats = [
      { html: "as of 2024-11-10", expected: "2024-11-10" },
      { html: "as of 2024-01-01", expected: "2024-01-01" },
    ]

    for (const format of dateFormats) {
      await page.setContent(`
       <html>
         <body>
           <div>Data Usage For Some Account</div>
           <div>${format.html}</div>
           <div>Total allotment 1500 GB</div>
           <div>Current usage 750 GB</div>
           <div>Current overage 0 GB</div>
         </body>
       </html>
     `)

      const data = await scraper.scrape()
      expect(data.date).toBe(format.expected)
    }
  })
})
