import { useMemo, useState, useId } from 'react';
import { Spin, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useEZOutputPeopleResponseStore } from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import outputStyles from '../Output.module.less';
import './locales';

const MODE_COLORS: Record<string, string> = {
  car: '#4096ff',
  bus: '#fa8c16',
  subway: '#722ed1',
  walk: '#52c41a',
  bike: '#13c2c2',
};

const MODE_LABELS_EN: Record<string, string> = {
  car: 'Car', bus: 'Bus', subway: 'Subway', walk: 'Walking', bike: 'Cycling',
};

const MODE_LABELS_FR: Record<string, string> = {
  car: 'Voiture', bus: 'Bus', subway: 'Metro', walk: 'Marche', bike: 'Velo',
};

interface TreemapItem {
  label: string;
  value: number;
  fromMode: string;
  toMode: string;
  count: number;
}

interface TreemapRect {
  x: number;
  y: number;
  w: number;
  h: number;
  item: TreemapItem;
}

// Squarified treemap layout
const layoutTreemap = (items: TreemapItem[], x: number, y: number, w: number, h: number): TreemapRect[] => {
  if (items.length === 0) return [];
  if (items.length === 1) {
    return [{ x, y, w, h, item: items[0] }];
  }

  const total = items.reduce((sum, it) => sum + it.value, 0);
  if (total === 0) return [];

  const sorted = [...items].sort((a, b) => b.value - a.value);
  const rects: TreemapRect[] = [];
  let remaining = [...sorted];
  let cx = x, cy = y, cw = w, ch = h;

  while (remaining.length > 0) {
    const isHorizontal = cw >= ch;
    const side = isHorizontal ? ch : cw;
    const remainingTotal = remaining.reduce((sum, it) => sum + it.value, 0);

    let bestRow: TreemapItem[] = [];
    let bestRatio = Infinity;

    for (let i = 1; i <= remaining.length; i++) {
      const row = remaining.slice(0, i);
      const rowTotal = row.reduce((sum, it) => sum + it.value, 0);
      const rowWidth = (rowTotal / remainingTotal) * (isHorizontal ? cw : ch);

      let worstRatio = 0;
      for (const item of row) {
        const itemHeight = (item.value / rowTotal) * side;
        const ratio = Math.max(rowWidth / itemHeight, itemHeight / rowWidth);
        worstRatio = Math.max(worstRatio, ratio);
      }

      if (worstRatio <= bestRatio) {
        bestRatio = worstRatio;
        bestRow = row;
      } else {
        break;
      }
    }

    const rowTotal = bestRow.reduce((sum, it) => sum + it.value, 0);
    const rowSize = (rowTotal / remainingTotal) * (isHorizontal ? cw : ch);

    let offset = 0;
    for (const item of bestRow) {
      const itemSize = (item.value / rowTotal) * side;
      if (isHorizontal) {
        rects.push({ x: cx, y: cy + offset, w: rowSize, h: itemSize, item });
      } else {
        rects.push({ x: cx + offset, y: cy, w: itemSize, h: rowSize, item });
      }
      offset += itemSize;
    }

    if (isHorizontal) {
      cx += rowSize;
      cw -= rowSize;
    } else {
      cy += rowSize;
      ch -= rowSize;
    }

    remaining = remaining.slice(bestRow.length);
  }

  return rects;
};

const SVG_WIDTH = 600;
const SVG_HEIGHT = 280;
const PADDING = 2;

/**
 * People Response Treemap - transition pairs as proportional blocks summing to 100%
 * Data derived from sankey flow data
 * Each block uses a gradient from source mode color to destination mode color
 */
export const PeopleResponseBar = () => {
  const { t, i18n } = useTranslation('ez-output-charts');
  const sankeyData = useEZOutputPeopleResponseStore((state) => state.peopleResponseSankeyData);
  const barState = useEZOutputPeopleResponseStore((state) => state.peopleResponseBarState);
  const barError = useEZOutputPeopleResponseStore((state) => state.peopleResponseBarError);
  const requestId = useEZSessionStore((state) => state.requestId);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const gradientIdPrefix = useId();

  const isFr = i18n.language === 'fr';
  const modeLabels = isFr ? MODE_LABELS_FR : MODE_LABELS_EN;

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'chart_bar_people_response');
    }
  };

  const treemapData = useMemo(() => {
    if (!sankeyData) return null;

    const { flows } = sankeyData;
    const total = flows.reduce((sum, f) => sum + f.count, 0);
    if (total === 0) return null;

    const transitions = flows.filter(f => f.from !== f.to && f.count > 0);
    const transitionTotal = transitions.reduce((sum, f) => sum + f.count, 0);
    if (transitionTotal === 0) return null;

    const items: TreemapItem[] = transitions
      .map(f => ({
        label: `${modeLabels[f.from] || f.from} -> ${modeLabels[f.to] || f.to}`,
        value: (f.count / transitionTotal) * 100,
        fromMode: f.from,
        toMode: f.to,
        count: f.count,
      }))
      .sort((a, b) => b.value - a.value);

    return layoutTreemap(items, 0, 0, SVG_WIDTH, SVG_HEIGHT);
  }, [sankeyData, modeLabels]);


  if (barError) {
    return (
      <Alert
        message={t('peopleResponseBar.error')}
        description={barError}
        type="error"
        showIcon
        className={outputStyles.sectionErrorAlert}
        action={
          <Button size="small" danger onClick={handleRetry}>
            {t('peopleResponseBar.retry')}
          </Button>
        }
      />
    );
  }

  if (barState === 'inactive' || barState === 'loading' || !sankeyData || !treemapData) {
    return (
      <div className={`${outputStyles.peopleResponseBarContainer} ${outputStyles.chartSpinnerOverlay}`}>
        <Spin size="default" />
      </div>
    );
  }

  return (
    <>
      <span className={outputStyles.chartDescription}>
        {t('peopleResponseBar.description')}
      </span>
      <div className={outputStyles.peopleResponseBarContainer}>
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} width="100%" height="100%">
          <defs>
            {treemapData.map((rect, i) => {
              const fromColor = MODE_COLORS[rect.item.fromMode] || '#999';
              const toColor = MODE_COLORS[rect.item.toMode] || '#999';
              if (fromColor === toColor) return null;
              return (
                <linearGradient key={i} id={`${gradientIdPrefix}-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={fromColor} />
                  <stop offset="100%" stopColor={toColor} />
                </linearGradient>
              );
            })}
          </defs>
          {treemapData.map((rect, i) => {
            const innerX = rect.x + PADDING;
            const innerY = rect.y + PADDING;
            const innerW = Math.max(0, rect.w - PADDING * 2);
            const innerH = Math.max(0, rect.h - PADDING * 2);
            const isHovered = hoveredIndex === i;
            const pct = rect.item.value.toFixed(1);

            const fromColor = MODE_COLORS[rect.item.fromMode] || '#999';
            const toColor = MODE_COLORS[rect.item.toMode] || '#999';
            const isSameMode = fromColor === toColor;
            const fill = isSameMode ? fromColor : `url(#${gradientIdPrefix}-grad-${i})`;

            // Always show percentage, show label if space allows
            const showLabel = innerW > 50 && innerH > 30;
            const showPctOnly = !showLabel && (innerW > 24 && innerH > 14);
            const fontSize = innerW > 80 ? 12 : 10;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <rect
                  x={innerX}
                  y={innerY}
                  width={innerW}
                  height={innerH}
                  fill={fill}
                  fillOpacity={isHovered ? 1 : 0.8}
                  rx={3}
                  stroke={isHovered ? '#333' : '#fff'}
                  strokeWidth={isHovered ? 2 : 1}
                />
                {showLabel && (
                  <>
                    <text
                      x={innerX + innerW / 2}
                      y={innerY + innerH / 2 - 7}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#fff"
                      fontSize={fontSize}
                      fontWeight={600}
                    >
                      {rect.item.label}
                    </text>
                    <text
                      x={innerX + innerW / 2}
                      y={innerY + innerH / 2 + 9}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgba(255,255,255,0.9)"
                      fontSize={fontSize}
                      fontWeight={500}
                    >
                      {pct}%
                    </text>
                  </>
                )}
                {showPctOnly && !showLabel && (
                  <text
                    x={innerX + innerW / 2}
                    y={innerY + innerH / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize={9}
                    fontWeight={600}
                  >
                    {pct}%
                  </text>
                )}
                <title>{`${rect.item.label}: ${pct}% (${rect.item.count})`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
};
