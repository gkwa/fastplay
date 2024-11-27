import { Credentials } from "../../config/ConfigManager"
import { ScrapedData } from "../../models/ScrapedData"

export interface IBillingDataScraper {
  login(credentials: Credentials): Promise<void>
  scrape(): Promise<ScrapedData>
  loadLocalHtml(path: string): Promise<void>
}
