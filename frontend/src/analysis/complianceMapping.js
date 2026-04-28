function riskFromGap(gap) {
  if (gap >= 25) return 'High'
  if (gap >= 12) return 'Medium'
  return 'Low'
}

export function buildComplianceRows({ selectedRegion, score, biasFlags, maxGap, hasProxyHighRisk, sensitiveColumns }) {
  return [
    ['EU AI Act', 'EU', score < 60 || biasFlags >= 5 ? 'High' : 'Medium', 'Fairness Metrics, Report', `Fairness score is ${score}/100 with ${biasFlags} flagged subgroup gaps. Add mitigation notes and post-deployment monitoring evidence.`],
    ['GDPR Art. 22', 'EU', score < 65 ? 'Medium' : 'Low', 'Model Behavior', 'Automated decision explanations should identify the top drivers and provide an appeal path for affected users.'],
    ['ECOA', 'USA', hasProxyHighRisk ? 'High' : riskFromGap(maxGap * 100), 'Dataset Forensics, Counterfactual Sim', 'Potential credit-decision proxy behavior found. Consider removing granular geographic or identity-adjacent fields.'],
    ['Title VII', 'USA', sensitiveColumns.length ? riskFromGap(maxGap * 80) : 'Low', 'Fairness Metrics', 'If this system is used for employment, review subgroup outcome gaps and document threshold choices.'],
  ].filter(([, region]) => selectedRegion === 'Both' || region === selectedRegion)
}
