export type UnitType =
  | 'area'
  | 'distance'
  | 'mass'
  | 'time'
  | 'concentration'
  | 'percent'
  | 'currency'
  | 'count'
  | 'percentagePoints';

export interface SmartNumberProps {
  value: number;
  unitType: UnitType;
  decimals?: number;
  forceUnit?: string;
  showUnit?: boolean;
}

export type TrendDirection = 'increase' | 'decrease' | 'stable';
export type TrendMagnitude = 'stable' | 'slight' | 'moderate' | 'dramatic';

export interface TrendProps {
  direction: TrendDirection;
  magnitude: TrendMagnitude;
}

export interface SentenceProps {
  children: React.ReactNode;
}

export interface UnitScale {
  threshold: number;
  divisor: number;
  unit: string;
}
