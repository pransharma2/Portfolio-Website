export interface ImpactMetric {
  value: string;
  label: string;
  accent?: boolean;
}

export const impactMetrics: ImpactMetric[] = [
  { value: '$300K+', label: 'Annual Cost Savings', accent: true },
  { value: '400', label: 'SAP Tables Migrated' },
  { value: '$550', label: 'Saved per Object Build' },
  { value: '50+', label: 'Students per Workshop', accent: true },
  { value: '3', label: 'Data Factory Environments' },
  { value: '90%+', label: 'Workshop Satisfaction' },
];
