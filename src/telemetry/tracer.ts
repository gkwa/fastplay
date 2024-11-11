import { trace, Context, context } from "@opentelemetry/api"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node"
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base"

export class TracingService {
  private static instance: TracingService
  private provider: NodeTracerProvider

  private constructor() {
    this.provider = new NodeTracerProvider()
    this.provider.addSpanProcessor(new SimpleSpanProcessor())
    this.provider.register()
  }

  public static getInstance(): TracingService {
    if (!TracingService.instance) {
      TracingService.instance = new TracingService()
    }
    return TracingService.instance
  }

  public getTracer(name: string) {
    return trace.getTracer(name)
  }

  public async traceAsync<T>(
    name: string,
    operation: string,
    fn: (context: Context) => Promise<T>,
  ): Promise<T> {
    const tracer = this.getTracer(name)
    return await tracer.startActiveSpan(operation, async (span) => {
      try {
        const result = await fn(trace.setSpan(context.active(), span))
        span.end()
        return result
      } catch (error) {
        span.recordException(error as Error)
        span.setStatus({ code: 2 })
        span.end()
        throw error
      }
    })
  }
}
