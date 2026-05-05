import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import {
  _getBufferedSpans,
  _resetTracingForTest,
  setSampleRate,
  tracer,
} from './tracing';

describe('tracing shim', () => {
  beforeEach(() => {
    _resetTracingForTest();
    setSampleRate(1.0); // always sample in tests
  });

  afterEach(() => {
    _resetTracingForTest();
  });

  it('starts a span and records duration on end', () => {
    const span = tracer.startSpan('test.span');
    span.setAttribute('foo', 'bar');
    span.end();

    const spans = _getBufferedSpans();
    expect(spans).toHaveLength(1);
    expect(spans[0]?.name).toBe('test.span');
    expect(spans[0]?.attributes.foo).toBe('bar');
    expect(spans[0]?.endTime).not.toBeNull();
    expect(spans[0]?.endTime).toBeGreaterThanOrEqual(spans[0]!.startTime);
  });

  it('records exceptions and sets ERROR status', () => {
    const span = tracer.startSpan('test.error');
    span.recordException(new Error('boom'));
    span.end();

    const spans = _getBufferedSpans();
    expect(spans[0]?.status.code).toBe('ERROR');
    expect(spans[0]?.status.message).toBe('boom');
    const exceptionEvent = spans[0]?.events.find((e) => e.name === 'exception');
    expect(exceptionEvent).toBeDefined();
    expect(exceptionEvent?.attributes?.['exception.message']).toBe('boom');
  });

  it('withSpan auto-ends on success and sets OK status', async () => {
    const result = await tracer.withSpan('test.with', () => 42);
    expect(result).toBe(42);

    const spans = _getBufferedSpans();
    expect(spans).toHaveLength(1);
    expect(spans[0]?.status.code).toBe('OK');
    expect(spans[0]?.endTime).not.toBeNull();
  });

  it('withSpan records exceptions and re-throws', async () => {
    await expect(
      tracer.withSpan('test.with-error', () => {
        throw new Error('fail');
      }),
    ).rejects.toThrow('fail');

    const spans = _getBufferedSpans();
    expect(spans[0]?.status.code).toBe('ERROR');
  });

  it('respects sample rate — 0 produces no spans', () => {
    setSampleRate(0);
    const span = tracer.startSpan('test.no-sample');
    span.end();
    expect(_getBufferedSpans()).toHaveLength(0);
  });

  it('rejects invalid sample rate', () => {
    expect(() => setSampleRate(-0.1)).toThrow();
    expect(() => setSampleRate(1.1)).toThrow();
    expect(() => setSampleRate(NaN)).toThrow();
  });

  it('child spans share the trace id of their parent', async () => {
    let childTraceId: string | undefined;
    let parentTraceId: string | undefined;

    await tracer.withSpan('parent', async () => {
      const sample = _getBufferedSpans();
      // 父 span 还没 end，缓冲区里还没它；先记 trace id
      const childSpan = tracer.startSpan('child');
      // we have to dig: the in-memory span attaches its ctx via the readable
      // record once exported. Collect after end.
      childSpan.end();
      void sample;
    });

    const spans = _getBufferedSpans();
    const parent = spans.find((s) => s.name === 'parent');
    const child = spans.find((s) => s.name === 'child');
    expect(parent).toBeDefined();
    expect(child).toBeDefined();
    parentTraceId = parent?.ctx.traceId;
    childTraceId = child?.ctx.traceId;
    expect(childTraceId).toBe(parentTraceId);
    expect(child?.ctx.parentSpanId).toBe(parent?.ctx.spanId);
  });
});
