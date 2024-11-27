import { UsageData } from "./UsageData"

export interface ScrapedData {
  text: string
  html: string
  date: string
  usage: UsageData
  units: string
}
