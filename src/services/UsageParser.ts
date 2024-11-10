import { UsageData } from "../models/UsageData"

export class UsageParser {
  parse(content: string): UsageData {
    const totalMatch = content.match(/Total allotment\s+(\d+\.?\d*)\s*(\w+)/)
    const currentMatch = content.match(/Current usage\s+(\d+\.?\d*)\s*(\w+)/)
    const overageMatch = content.match(/Current overage\s+(\d+\.?\d*)\s*(\w+)/)

    if (!totalMatch || !currentMatch || !overageMatch) {
      throw new Error("Could not parse data usage values")
    }

    return {
      total: parseFloat(totalMatch[1]),
      current: parseFloat(currentMatch[1]),
      overage: parseFloat(overageMatch[1]),
    }
  }
}
