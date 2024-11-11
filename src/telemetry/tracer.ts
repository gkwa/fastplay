import { trace, Context, context, Tracer, Span, SpanStatusCode } from "@opentelemetry/api"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node"
import { SimpleSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base"
import { Resource } from "@opentelemetry/resources"
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc"

export interface TracingContext extends Context {
  span?: Span
}

export class TracingService {
  private static instance: TracingService
  private provider: NodeTracerProvider
  private tracer: Tracer

  private constructor() {
    this.provider = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: "fastplay",
      }),
    })

    const otlpExporter = new OTLPTraceExporter({
      url: "http://localhost:4317",
    })

    // Add both console and OTLP exporters
    this.provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
    this.provider.addSpanProcessor(new SimpleSpanProcessor(otlpExporter))
    this.provider.register()

    this.tracer = trace.getTracer("fastplay")
  }

  public static getInstance(): TracingService {
    if (!TracingService.instance) {
      TracingService.instance = new TracingService()
    }
    return TracingService.instance
  }

  public getTracer(): Tracer {
    return this.tracer
  }

  public async traceAsync<T>(
    name: string,
    operation: string,
    fn: (context: TracingContext) => Promise<T>,
  ): Promise<T> {
    return await this.tracer.startActiveSpan(operation, async (span) => {
      try {
        const ctx = trace.setSpan(context.active(), span)
        const result = await fn({ ...ctx, span })
        span.end()
        return result
      } catch (error) {
        span.recordException(error as Error)
        span.setStatus({ code: SpanStatusCode.ERROR })
        span.end()
        throw error
      }
    })
  }
}
