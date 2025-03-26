// src/utils/utils.ts

export const getCTR = (position: number, ctrModel: Record<number, number>): number => {
  const roundedPosition = Math.ceil(position);
  return roundedPosition <= 10 ? ctrModel[roundedPosition] || 0.01 : 0.01;
};

export const getSeasonalityMultiplier = (month: number, category: string): number => {
  const seasonality: Record<string, Record<number, number>> = {
    "BBQ & Outdoor Cooking": { 1: 0.8, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.3, 7: 1.3, 8: 1.2, 9: 1.1, 10: 1.0, 11: 0.9, 12: 0.8 },
    "Christmas & Seasonal": { 1: 0.8, 2: 0.7, 3: 0.6, 4: 0.5, 5: 0.5, 6: 0.6, 7: 0.7, 8: 0.8, 9: 0.9, 10: 1.0, 11: 1.2, 12: 1.5 },
    "Fashion & Apparel": { 1: 1.0, 2: 1.1, 3: 1.0, 4: 0.9, 5: 1.0, 6: 1.1, 7: 1.0, 8: 1.0, 9: 1.1, 10: 1.2, 11: 1.3, 12: 1.2 }
  };
  return seasonality[category]?.[month] || 1.0;
};

export const CTR_MODELS: Record<string, Record<number, number>> = {
  "Default": { 1: 0.317, 2: 0.247, 3: 0.187, 4: 0.133, 5: 0.095, 6: 0.068, 7: 0.049, 8: 0.035, 9: 0.025, 10: 0.018 },
  "E-commerce": { 1: 0.25, 2: 0.20, 3: 0.15, 4: 0.10, 5: 0.08, 6: 0.06, 7: 0.04, 8: 0.03, 9: 0.02, 10: 0.015 },
  "Informational": { 1: 0.40, 2: 0.30, 3: 0.22, 4: 0.15, 5: 0.10, 6: 0.07, 7: 0.05, 8: 0.04, 9: 0.03, 10: 0.02 }
};
