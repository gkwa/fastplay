import { test, expect, type Page } from "@playwright/test"
import dotenv from "dotenv"
import path from "path"
import fs from "fs/promises"

dotenv.config({ path: path.resolve(__dirname, "../.env") })

interface UsageData {
  total: number
  current: number
  overage: number
}

interface UsageRecord {
  date: string
  amount: number
  amountUnits: string
  total: number
  totalUnits: string
  overage: number
  overageUnits: string
  scrapedAt: string
}

async function parseDataUsage(filePath: string): Promise<UsageData> {
  const content = await fs.readFile(filePath, "utf-8")

  const totalMatch = content.match(/Total allotment\s+(\d+\.?\d*)\s*GB/)
  const currentMatch = content.match(/Current usage\s+(\d+\.?\d*)\s*GB/)
  const overageMatch = content.match(/Current overage\s+(\d+\.?\d*)\s*GB/)
  const dateMatch = content.match(/as of (\d{4}-\d{2}-\d{2})/)

  if (!totalMatch || !currentMatch || !overageMatch) {
    throw new Error("Could not parse data usage values")
  }

  return {
    total: parseFloat(totalMatch[1]),
    current: parseFloat(currentMatch[1]),
    overage: parseFloat(overageMatch[1]),
  }
}

test.describe("Astound", () => {
  test("login and scrape usage", async ({ page }) => {
    const username = process.env.ASTOUND_BROADBAND_LOGIN_USERNAME
    const password = process.env.ASTOUND_BROADBAND_LOGIN_PASSWORD

    if (!username || !password) {
      throw new Error("Missing required environment variables")
    }

    // Ensure data directory exists
    const dataDir = path.join(__dirname, "../data")
    await fs.mkdir(dataDir, { recursive: true })

    await page.goto("https://my.astound.com/data_usage")
    await page.locator("#username").fill(username)
    await page.locator("#password").fill(password)
    await page.getByRole("button", { name: "LOG IN" }).click()

    await page.waitForURL("**/data_usage")
    await expect(page.getByText("Data Usage For")).toBeVisible()

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")

    const dataFilePrefix = `astound-data-usage-${timestamp}`

    // Save full page screenshot
    await page.screenshot({
      path: path.join(dataDir, `${dataFilePrefix}.png`),
      fullPage: true,
    })

    // Save text content
    const text = await page.evaluate(() => document.body.innerText)
    const textPath = path.join(dataDir, `${dataFilePrefix}.txt`)
    await fs.writeFile(textPath, text)

    // Save HTML content
    const pageContent = await page.content()
    await fs.writeFile(path.join(dataDir, `${dataFilePrefix}.html`), pageContent)

    // Parse the date from the text content
    const dateMatch = text.match(/as of (\d{4}-\d{2}-\d{2})/)
    if (!dateMatch) {
      throw new Error("Could not parse date")
    }

    // Parse the saved text file
    const usage = await parseDataUsage(textPath)
    console.log("Usage data:", usage)

    // Create usage record
    const record: UsageRecord = {
      date: dateMatch[1],
      amount: usage.current,
      amountUnits: "GB",
      total: usage.total,
      totalUnits: "GB",
      overage: usage.overage,
      overageUnits: "GB",
      scrapedAt: new Date().toISOString(),
    }

    const jsonPath = path.join(dataDir, `${dataFilePrefix}.json`)
    await fs.writeFile(jsonPath, JSON.stringify(record, null, 2))
  })
})
