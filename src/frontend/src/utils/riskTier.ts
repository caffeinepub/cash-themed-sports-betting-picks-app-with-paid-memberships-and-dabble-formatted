import type { Prediction } from '../backend';

export interface RiskTier {
  tier: number;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

/**
 * Derives a risk tier from a prediction's winning probability.
 * Lower probability = higher risk, higher reward potential.
 * Higher probability = lower risk, lower reward potential.
 * 
 * Tier 1 (Lowest Risk): 70%+ probability
 * Tier 2 (Low Risk): 60-69% probability
 * Tier 3 (Medium Risk): 50-59% probability
 * Tier 4 (High Risk): 40-49% probability
 * Tier 5 (Highest Risk): <40% probability
 */
export function getRiskTier(prediction: Prediction): RiskTier {
  const probability = prediction.winningProbability * 100;

  if (probability >= 70) {
    return {
      tier: 1,
      label: 'Tier 1 — Lowest Risk',
      description: 'High confidence, lower reward potential',
      color: 'text-cash-green',
      bgColor: 'bg-cash-green/10 border-cash-green/30',
    };
  } else if (probability >= 60) {
    return {
      tier: 2,
      label: 'Tier 2 — Low Risk',
      description: 'Good confidence, moderate reward',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10 border-blue-400/30',
    };
  } else if (probability >= 50) {
    return {
      tier: 3,
      label: 'Tier 3 — Medium Risk',
      description: 'Balanced risk and reward',
      color: 'text-cash-gold',
      bgColor: 'bg-cash-gold/10 border-cash-gold/30',
    };
  } else if (probability >= 40) {
    return {
      tier: 4,
      label: 'Tier 4 — High Risk',
      description: 'Lower confidence, higher reward potential',
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10 border-orange-400/30',
    };
  } else {
    return {
      tier: 5,
      label: 'Tier 5 — Highest Risk',
      description: 'Lowest confidence, highest reward potential',
      color: 'text-red-400',
      bgColor: 'bg-red-400/10 border-red-400/30',
    };
  }
}
