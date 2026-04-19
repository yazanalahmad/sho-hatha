import { describe, expect, it } from 'vitest';
import i18n from '../i18n';

describe('i18n', () => {
  it('updates html lang and dir when language changes', async () => {
    await i18n.changeLanguage('ar');
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');

    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});
