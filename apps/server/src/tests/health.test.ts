import { describe, expect, it } from 'vitest';
import { buildHealthPayload } from '../app';

describe('GET /health', () => {
  it('returns 200 with correct shape', () => {
    const payload = buildHealthPayload();
    expect(payload).toMatchObject({
      status: 'ok',
      uptime: expect.any(Number),
      version: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  it('timestamp is a valid ISO string', () => {
    const payload = buildHealthPayload();
    expect(new Date(payload.timestamp).toISOString()).toBe(payload.timestamp);
  });

  it('timestamp is present in health payload', () => {
    const payload = buildHealthPayload();
    expect(payload.timestamp.length).toBeGreaterThan(0);
  });
});
