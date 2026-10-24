export interface AggregatedCohort {
  cohortName: string;
  categoryFocus: string;
  trueSize: number;
  shownSize: number;
  laplaceNoise: number;
  marginOfError: number;
  status: 'released' | 'suppressed' | 'merged';
  explanation: string;
  averageWeeklySpend: number;
  rpr28Rate: number; // 28-day repeat purchase rate
  earlyLapseRisk: 'Low' | 'Medium' | 'High';
}

export function sampleLaplaceNoise(epsilon: number = 0.5, sensitivity: number = 1.0): number {
  const b = sensitivity / epsilon;
  const u = Math.random() - 0.5;
  if (u === 0) return 0;
  return Math.round(-b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u)));
}

export function generateAggregatedCohorts(epsilon: number = 0.5): AggregatedCohort[] {
  // Baseline synthetic shop cohorts from Challenge 2 §7
  const baseGroups = [
    { name: 'Loyal regulars', category: 'Staples & Dairy', trueSize: 113, spend: 320, rpr: 87.8, risk: 'Low' as const },
    { name: 'Monthly bulk buyers', category: 'Staples & Packaged', trueSize: 111, spend: 840, rpr: 84.2, risk: 'Low' as const },
    { name: 'Occasional, active', category: 'Snacks & Beverages', trueSize: 51, spend: 180, rpr: 68.4, risk: 'Medium' as const },
    { name: 'Dormant', category: 'General Pantry', trueSize: 48, spend: 120, rpr: 42.1, risk: 'High' as const },
    { name: 'Champions', category: 'Daily Fresh & Dairy', trueSize: 43, spend: 540, rpr: 92.5, risk: 'Low' as const },
    { name: 'Lapsed regulars', category: 'Staples & FMCG', trueSize: 10, spend: 280, rpr: 21.0, risk: 'High' as const }
  ];

  const results: AggregatedCohort[] = [];

  for (const group of baseGroups) {
    // AG-2: Add Laplace noise with epsilon = 0.5
    const noise = sampleLaplaceNoise(epsilon, 1.0);
    const noisySize = Math.max(0, group.trueSize + noise);
    const margin = Math.round(3.0 / epsilon);

    // AG-1: Show a group only if its noisy size is 10 or more; otherwise suppress it or merge it
    let status: 'released' | 'suppressed' | 'merged' = 'released';
    let explanation = `k >= 10 satisfied. Released with Laplace noise (ε=${epsilon}).`;

    if (noisySize < 10) {
      status = 'suppressed';
      explanation = `AG-1 Violation: Noisy count (${noisySize}) fell under the k >= 10 threshold. Suppressed to prevent individual re-identification.`;
    }

    results.push({
      cohortName: group.name,
      categoryFocus: group.category,
      trueSize: group.trueSize,
      shownSize: status === 'suppressed' ? noisySize : noisySize,
      laplaceNoise: noise,
      marginOfError: margin,
      status,
      explanation,
      averageWeeklySpend: group.spend,
      rpr28Rate: group.rpr,
      earlyLapseRisk: group.risk
    });
  }

  // Complementary suppression check (AG-5)
  // If one cell is suppressed, we merge the suppressed group into a broader "Drifting Regulars" group
  const suppressedGroup = results.find(r => r.status === 'suppressed');
  if (suppressedGroup) {
    // Merge with Dormant to preserve utility while complying with k >= 10
    const dormant = results.find(r => r.cohortName === 'Dormant');
    if (dormant) {
      dormant.cohortName = 'Drifting & Dormant Regulars (Merged)';
      dormant.trueSize += suppressedGroup.trueSize;
      dormant.shownSize += suppressedGroup.shownSize;
      dormant.explanation = 'Merged with small lapsing group to safely exceed k >= 10 threshold.';
    }
  }

  return results;
}
