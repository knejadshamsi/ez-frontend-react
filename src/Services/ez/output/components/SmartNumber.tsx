import { useTranslation } from 'react-i18next';
import type { SmartNumberProps, UnitScale } from './types';
import styles from './SmartNumber.module.less';

// Base units match backend: mass=grams, distance=kilometers, area=km²
// Ladder walks top-down: first threshold matched wins
// divisor < 1 means multiply (scaling down to smaller unit)

const SCALE_LADDERS_EN: Record<string, UnitScale[]> = {
  area: [
    { threshold: 1, divisor: 1, unit: 'km\u00B2' },
    { threshold: 0.01, divisor: 0.01, unit: 'hectares' },
    { threshold: 0, divisor: 0.000_001, unit: 'm\u00B2' },
  ],
  distance: [
    { threshold: 1_000, divisor: 1_000, unit: 'megameters' },
    { threshold: 1, divisor: 1, unit: 'kilometers' },
    { threshold: 0, divisor: 0.001, unit: 'meters' },
  ],
  mass: [
    { threshold: 1_000_000_000, divisor: 1_000_000_000, unit: 'kilotonnes' },
    { threshold: 1_000_000, divisor: 1_000_000, unit: 'tonnes' },
    { threshold: 1_000, divisor: 1_000, unit: 'kilograms' },
    { threshold: 0, divisor: 1, unit: 'grams' },
  ],
  time: [
    { threshold: 0, divisor: 1, unit: 'minutes' },
  ],
  concentration: [
    { threshold: 0, divisor: 1, unit: '\u00B5g/m\u00B3' },
  ],
  percent: [
    { threshold: 0, divisor: 1, unit: '%' },
  ],
  currency: [
    { threshold: 0, divisor: 1, unit: '$' },
  ],
  count: [
    { threshold: 0, divisor: 1, unit: '' },
  ],
  percentagePoints: [
    { threshold: 0, divisor: 1, unit: 'percentage points' },
  ],
};

const SCALE_LADDERS_FR: Record<string, UnitScale[]> = {
  area: [
    { threshold: 1, divisor: 1, unit: 'km\u00B2' },
    { threshold: 0.01, divisor: 0.01, unit: 'hectares' },
    { threshold: 0, divisor: 0.000_001, unit: 'm\u00B2' },
  ],
  distance: [
    { threshold: 1_000, divisor: 1_000, unit: 'megametres' },
    { threshold: 1, divisor: 1, unit: 'kilometres' },
    { threshold: 0, divisor: 0.001, unit: 'metres' },
  ],
  mass: [
    { threshold: 1_000_000_000, divisor: 1_000_000_000, unit: 'kilotonnes' },
    { threshold: 1_000_000, divisor: 1_000_000, unit: 'tonnes' },
    { threshold: 1_000, divisor: 1_000, unit: 'kilogrammes' },
    { threshold: 0, divisor: 1, unit: 'grammes' },
  ],
  time: [
    { threshold: 0, divisor: 1, unit: 'minutes' },
  ],
  concentration: [
    { threshold: 0, divisor: 1, unit: '\u00B5g/m\u00B3' },
  ],
  percent: [
    { threshold: 0, divisor: 1, unit: '%' },
  ],
  currency: [
    { threshold: 0, divisor: 1, unit: '$' },
  ],
  count: [
    { threshold: 0, divisor: 1, unit: '' },
  ],
  percentagePoints: [
    { threshold: 0, divisor: 1, unit: 'points de pourcentage' },
  ],
};

function resolveScale(value: number, unitType: string, isFr: boolean, forceUnit?: string): { scaled: number; unit: string } {
  const ladders = isFr ? SCALE_LADDERS_FR : SCALE_LADDERS_EN;
  const ladder = ladders[unitType];
  if (!ladder) return { scaled: value, unit: '' };

  if (forceUnit) {
    const match = ladder.find((s) => s.unit === forceUnit);
    if (match) return { scaled: value / match.divisor, unit: match.unit };
  }

  const abs = Math.abs(value);
  for (const step of ladder) {
    if (abs >= step.threshold) {
      return { scaled: value / step.divisor, unit: step.unit };
    }
  }

  const last = ladder[ladder.length - 1];
  return { scaled: value / last.divisor, unit: last.unit };
}

export const SmartNumber = ({
  value,
  unitType,
  decimals = 3,
  forceUnit,
  showUnit = true,
}: SmartNumberProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? 'fr-CA' : 'en-US';
  const isFr = i18n.language === 'fr';

  const { scaled, unit } = resolveScale(value, unitType, isFr, forceUnit);
  const formatted = scaled.toLocaleString(locale, { maximumFractionDigits: decimals });

  // Currency: symbol placement differs by locale
  if (unitType === 'currency' && showUnit) {
    return (
      <span className={styles.smartNumber}>
        {isFr ? (
          <>{formatted}<span className={styles.unit}>$</span></>
        ) : (
          <><span className={styles.unit}>$</span>{formatted}</>
        )}
      </span>
    );
  }

  // Percent: no space between number and symbol
  if (unitType === 'percent' && showUnit) {
    return (
      <span className={styles.smartNumber}>
        {formatted}{isFr ? ' %' : '%'}
      </span>
    );
  }

  return (
    <span className={styles.smartNumber}>
      {formatted}
      {showUnit && unit && <span className={styles.unit}>{unit}</span>}
    </span>
  );
};
