import { test, expect } from "@playwright/test"
import { AstoundTestRunner } from "../src/services/AstoundTestRunner"
import { AstoundBillingDataScraper } from "../src/services/AstoundBillingDataScraper"

test.describe("Astound Mock Tests", () => {
  const mockHtmlPath = "testdata/astound-data-usage-2024-11-10T05-56-21-584Z.html"

  test("scrape usage from local HTML file", async ({ page }) => {
    const runner = new AstoundTestRunner({ useMockData: true, mockHtmlPath })
    const { scrapedData } = await runner.run({ page })

    expect(scrapedData.usage).toBeDefined()
    expect(scrapedData.usage.total).toBeGreaterThan(0)
    expect(scrapedData.usage.current).toBeGreaterThanOrEqual(0)
    expect(typeof scrapedData.date).toBe("string")
    expect(scrapedData.units).toBe("GB")
  })

  test("handles missing data in HTML correctly", async ({ page }) => {
    const scraper = new AstoundBillingDataScraper(page)

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
    const scraper = new AstoundBillingDataScraper(page)

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
