/**
 * Tracing shim — minimal OpenTelemetry-compatible API surface.
 *
 * Why a shim instead of `@opentelemetry/sdk-trace-web`:
 *  - The full OTel browser SDK adds ~80 KB gzipped to the bundle for
 *    behaviour we don't yet need (OTLP exporter, batch processor,
 *    instrumentation libraries). The shim ships zero new dependencies.
 *  - The shape mirrors the OTel `Tracer.startSpan(name)` API so the
 *    callsites don't change when we later swap the implementation in.
 *  - For now spans are sampled at 1% by default, recorded to the
 *    in-memory ring buffer, and printed to console.debug — enough to
 *    see them during development. Production export wires through
 *    `setExporter()` once a backend is chosen.
 *
 * Span lifecycle:
 *   const span = tracer.startSpan('persona.create');
 *   span.setAttribute('persona.id', id);
 *   try {
 *     // ... work ...
 *   } finally {
 *     span.end();
 *   }
 *
 * For async work, prefer `tracer.withSpan(name, fn)` which auto-ends
 * on resolution / rejection and records the error on the span.
 */

const NS = 'chrono-synth-web';

export type SpanStatusCode = 'OK' | 'ERROR' | 'UNSET';

export interface SpanContext {
  traceId: string;
  spanId: string;
  /** Parent span id; undefined for root spans */
  parentSpanId: string | undefined;
}

export interface ReadableSpan {
  name: string;
  ctx: SpanContext;
  startTime: number;
  endTime: number | null;
  attributes: Record<string, string | number | boolean | null>;
  events: Array<{ name: string; ts: number; attributes?: Record<string, unknown> }>;
  status: { code: SpanStatusCode; message?: string };
}

export interface Span {
  setAttribute(key: string, value: string | number | boolean | null): void;
  addEvent(name: string, attributes?: Record<string, unknown>): void;
  setStatus(code: SpanStatusCode, message?: string): void;
  recordException(err: unknown): void;
  end(): void;
}

export interface SpanExporter {
  export(spans: ReadableSpan[]): void;
}

const RING_BUFFER_MAX = 200;

class InMemoryExporter implements SpanExporter {
  private buffer: ReadableSpan[] = [];
  export(spans: ReadableSpan[]): void {
    for (const s of spans) {
      this.buffer.push(s);
      if (this.buffer.length > RING_BUFFER_MAX) {
        this.buffer.shift();
      }
      if (typeof console !== 'undefined' && import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug(`[${NS}.trace]`, s.name, {
          duration: s.endTime !== null ? s.endTime - s.startTime : null,
          attrs: s.attributes,
          status: s.status,
        });
      }
    }
  }
  snapshot(): ReadableSpan[] {
    return [...this.buffer];
  }
  clear(): void {
    this.buffer = [];
  }
}

let activeExporter: SpanExporter & { snapshot?: () => ReadableSpan[]; clear?: () => void } =
  new InMemoryExporter();
let sampleRate = 0.01; // 1% by default

function genId(bytes: number): string {
  /* Hex string of `bytes` bytes (i.e. 2*bytes chars). Uses crypto when
   * available, falls back to Math.random for SSR / tests. */
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function newTraceId(): string {
  return genId(16); // 32-hex-char trace id (W3C TraceContext)
}

function newSpanId(): string {
  return genId(8); // 16-hex-char span id
}

let currentSpanCtx: SpanContext | null = null;

class SpanImpl implements Span {
  readonly readable: ReadableSpan;
  private ended = false;

  constructor(name: string, ctx: SpanContext) {
    this.readable = {
      name,
      ctx,
      startTime: Date.now(),
      endTime: null,
      attributes: {},
      events: [],
      status: { code: 'UNSET' },
    };
  }

  setAttribute(key: string, value: string | number | boolean | null): void {
    if (this.ended) return;
    this.readable.attributes[key] = value;
  }

  addEvent(name: string, attributes?: Record<string, unknown>): void {
    if (this.ended) return;
    this.readable.events.push({ name, ts: Date.now(), attributes });
  }

  setStatus(code: SpanStatusCode, message?: string): void {
    if (this.ended) return;
    this.readable.status = { code, message };
  }

  recordException(err: unknown): void {
    if (this.ended) return;
    const message = err instanceof Error ? err.message : String(err);
    this.addEvent('exception', {
      'exception.type': err instanceof Error ? err.constructor.name : 'unknown',
      'exception.message': message,
    });
    this.setStatus('ERROR', message);
  }

  end(): void {
    if (this.ended) return;
    this.ended = true;
    this.readable.endTime = Date.now();
    activeExporter.export([this.readable]);
  }
}

class NoopSpan implements Span {
  setAttribute(): void { /* noop */ }
  addEvent(): void { /* noop */ }
  setStatus(): void { /* noop */ }
  recordException(): void { /* noop */ }
  end(): void { /* noop */ }
}

const NOOP = new NoopSpan();

function shouldSample(): boolean {
  return Math.random() < sampleRate;
}

class Tracer {
  startSpan(name: string): Span {
    if (!shouldSample()) return NOOP;
    const parentSpanId = currentSpanCtx?.spanId;
    const traceId = currentSpanCtx?.traceId ?? newTraceId();
    const ctx: SpanContext = { traceId, spanId: newSpanId(), parentSpanId };
    return new SpanImpl(name, ctx);
  }

  /**
   * Wrap an async function with a span. Auto-ends, auto-records exceptions.
   * `currentSpanCtx` is set during the callback so child spans nest correctly.
   */
  async withSpan<T>(name: string, fn: (span: Span) => Promise<T> | T): Promise<T> {
    const span = this.startSpan(name);
    const previousCtx = currentSpanCtx;
    currentSpanCtx = (span as SpanImpl).readable?.ctx ?? null;
    try {
      const result = await fn(span);
      span.setStatus('OK');
      return result;
    } catch (err) {
      span.recordException(err);
      throw err;
    } finally {
      currentSpanCtx = previousCtx;
      span.end();
    }
  }
}

export const tracer = new Tracer();

/** Replace the exporter (e.g., to wire OTLP at production bootstrap). */
export function setExporter(exporter: SpanExporter): void {
  activeExporter = exporter;
}

/** Adjust sampling — 0 to 1 inclusive. */
export function setSampleRate(rate: number): void {
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
    throw new RangeError('sample rate must be in [0, 1]');
  }
  sampleRate = rate;
}

/** Test hook — read all buffered spans (only when using InMemoryExporter). */
export function _getBufferedSpans(): ReadableSpan[] {
  if ('snapshot' in activeExporter && typeof activeExporter.snapshot === 'function') {
    return activeExporter.snapshot();
  }
  return [];
}

/** Test hook — reset state. */
export function _resetTracingForTest(): void {
  if ('clear' in activeExporter && typeof activeExporter.clear === 'function') {
    activeExporter.clear();
  }
  currentSpanCtx = null;
  sampleRate = 0.01;
  activeExporter = new InMemoryExporter();
}
