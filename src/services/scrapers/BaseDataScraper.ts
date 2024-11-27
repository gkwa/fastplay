import { Page } from "@playwright/test"
import { IBillingDataScraper } from "./IBillingDataScraper"
import fs from "fs/promises"
import path from "path"
import { Credentials } from "../../config/ConfigManager"
import { ScrapedData } from "../../models/ScrapedData"

export abstract class BaseDataScraper implements IBillingDataScraper {
  constructor(protected readonly page: Page) {}

  abstract login(credentials: Credentials): Promise<void>
  abstract scrape(): Promise<ScrapedData>

  async loadLocalHtml(filePath: string): Promise<void> {
    const absolutePath = path.resolve(process.cwd(), filePath)
    const content = await fs.readFile(absolutePath, "utf-8")
    await this.page.setContent(content)
  }

  protected abstract parseDate(content: string): string
  protected abstract parseUnits(content: string): string
}
