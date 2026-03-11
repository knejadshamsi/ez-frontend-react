import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TrendProps } from './types';

const EN_SLIGHT = ['slightly', 'marginally', 'modestly', 'somewhat', 'minimally'] as const;
const EN_DRAMATIC = ['dramatically', 'significantly', 'substantially', 'considerably', 'markedly', 'sharply', 'greatly', 'massively', 'largely'] as const;

const FR_SLIGHT = ['legerement', 'marginalement', 'modestement', 'quelque peu', 'faiblement'] as const;
const FR_DRAMATIC = ['considerablement', 'substantiellement', 'fortement', 'nettement', 'largement', 'massivement', 'grandement'] as const;

const EN_VERBS = {
  increase: 'increased',
  decrease: 'decreased',
  stable: 'remained stable',
} as const;

const FR_VERBS = {
  increase: 'ont augmente',
  decrease: 'ont diminue',
  stable: 'sont demeurees stables',
} as const;

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const Trend = ({ direction, magnitude }: TrendProps) => {
  const { i18n } = useTranslation();
  const isFr = i18n.language === 'fr';

  const text = useMemo(() => {
    const verb = isFr ? FR_VERBS[direction] : EN_VERBS[direction];

    if (magnitude === 'stable' || magnitude === 'moderate') return verb;

    if (isFr) {
      const adverb = magnitude === 'slight' ? pickRandom(FR_SLIGHT) : pickRandom(FR_DRAMATIC);
      return `${verb} ${adverb}`;
    }

    const adverb = magnitude === 'slight' ? pickRandom(EN_SLIGHT) : pickRandom(EN_DRAMATIC);
    return `${adverb} ${verb}`;
  }, [direction, magnitude, isFr]);

  return <span>{text}</span>;
};
