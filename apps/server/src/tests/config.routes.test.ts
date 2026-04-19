import { describe, expect, it } from 'vitest';
import { getPublicConfig } from '../modules/config.service';

describe('GET /api/config', () => {
  it('returns all config keys with correct types', () => {
    const config = getPublicConfig();

    expect(typeof config.questionsPerGame).toBe('number');
    expect(typeof config.categoriesToDisplay).toBe('number');
    expect(typeof config.categoriesPerTeam).toBe('number');
  });
});
