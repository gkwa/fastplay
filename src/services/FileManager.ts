import fs from "fs/promises"
import path from "path"
import { UsageRecord } from "../models/UsageData"

export class FileManager {
  constructor(private readonly dataDir: string) {}

  private getFilePath(timestamp: string, extension: string): string {
    return path.join(this.dataDir, `astound-data-usage-${timestamp}.${extension}`)
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true })
  }

  async saveScreenshot(page: any, timestamp: string): Promise<void> {
    await page.screenshot({
      path: this.getFilePath(timestamp, "png"),
      fullPage: true,
    })
  }

  async saveText(content: string, timestamp: string): Promise<string> {
    const filePath = this.getFilePath(timestamp, "txt")
    await fs.writeFile(filePath, content)
    return filePath
  }

  async saveHtml(content: string, timestamp: string): Promise<void> {
    await fs.writeFile(this.getFilePath(timestamp, "html"), content)
  }

  async saveUsageRecord(record: UsageRecord, timestamp: string): Promise<void> {
    await fs.writeFile(this.getFilePath(timestamp, "json"), JSON.stringify(record, null, 2))
  }
}
