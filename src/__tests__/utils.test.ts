// src/__tests__/utils.test.ts

import { getCTR, getSeasonalityMultiplier, CTR_MODELS } from '../utils/utils';

describe('getCTR', () => {
  const defaultCTR = CTR_MODELS["Default"];

  test('should return correct CTR for position 1', () => {
    expect(getCTR(1, defaultCTR)).toBe(0.317);
  });

  test('should return correct CTR for position 7.5 (rounds to 8)', () => {
    expect(getCTR(7.5, defaultCTR)).toBe(0.035);
  });

  test('should return 0.01 for position > 10', () => {
    expect(getCTR(11, defaultCTR)).toBe(0.01);
  });
});

describe('getSeasonalityMultiplier', () => {
  test('should return correct multiplier for BBQ & Outdoor Cooking in January', () => {
    expect(getSeasonalityMultiplier(1, "BBQ & Outdoor Cooking")).toBe(0.8);
  });

  test('should return 1.0 for unknown category', () => {
    expect(getSeasonalityMultiplier(1, "Unknown")).toBe(1.0);
  });
});
