export interface UsageData {
  total: number
  current: number
  overage: number
}

export interface UsageRecord {
  date: string
  amount: number
  amountUnits: string
  total: number
  totalUnits: string
  overage: number
  overageUnits: string
  scrapedAt: string
}
