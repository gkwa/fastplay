import { UsageData } from "../models/UsageData"
import { TracingService } from "../telemetry/tracer"

export class UsageParser {
  private readonly tracer = TracingService.getInstance()

  async parse(content: string): Promise<UsageData> {
    return this.tracer.traceAsync("UsageParser", "parse", async () => {
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
    })
  }
}
