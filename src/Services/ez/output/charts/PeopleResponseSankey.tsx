import { useMemo } from 'react';
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

const SVG_WIDTH = 600;
const SVG_HEIGHT = 300;
const NODE_WIDTH = 20;
const NODE_PADDING = 8;
const LABEL_OFFSET = 28;
const HEADER_HEIGHT = 24;

/**
 * People Response Sankey - inline SVG alluvial diagram
 * SSE Message: data_chart_sankey_people_response
 */
export const PeopleResponseSankey = () => {
  const { t, i18n } = useTranslation('ez-output-charts');
  const sankeyData = useEZOutputPeopleResponseStore((state) => state.peopleResponseSankeyData);
  const sankeyState = useEZOutputPeopleResponseStore((state) => state.peopleResponseSankeyState);
  const sankeyError = useEZOutputPeopleResponseStore((state) => state.peopleResponseSankeyError);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'chart_sankey_people_response');
    }
  };

  const isFr = i18n.language === 'fr';
  const modeLabels = isFr ? MODE_LABELS_FR : MODE_LABELS_EN;

  const diagram = useMemo(() => {
    if (!sankeyData) return null;

    const { nodes, flows } = sankeyData;
    const totalCount = flows.reduce((sum, f) => sum + f.count, 0);
    if (totalCount === 0) return null;

    // Calculate node heights based on flow totals
    const leftTotals: Record<string, number> = {};
    const rightTotals: Record<string, number> = {};
    for (const node of nodes) {
      leftTotals[node] = 0;
      rightTotals[node] = 0;
    }
    for (const flow of flows) {
      leftTotals[flow.from] += flow.count;
      rightTotals[flow.to] += flow.count;
    }

    const leftTotal = Object.values(leftTotals).reduce((a, b) => a + b, 0);
    const rightTotal = Object.values(rightTotals).reduce((a, b) => a + b, 0);

    const diagramTop = HEADER_HEIGHT;
    const usableHeight = SVG_HEIGHT - diagramTop - (nodes.length - 1) * NODE_PADDING;

    // Position nodes
    const leftX = LABEL_OFFSET + NODE_WIDTH;
    const rightX = SVG_WIDTH - LABEL_OFFSET - NODE_WIDTH;

    const computeNodePositions = (totals: Record<string, number>) => {
      const sideTotal = Math.max(Object.values(totals).reduce((a, b) => a + b, 0), 1);
      const positions: Record<string, { y: number; height: number }> = {};
      let y = diagramTop;
      for (const node of nodes) {
        const height = Math.max(4, (totals[node] / sideTotal) * usableHeight);
        positions[node] = { y, height };
        y += height + NODE_PADDING;
      }
      return positions;
    };

    const leftPositions = computeNodePositions(leftTotals);
    const rightPositions = computeNodePositions(rightTotals);

    // Track offsets for stacking flows within nodes
    const leftOffsets: Record<string, number> = {};
    const rightOffsets: Record<string, number> = {};
    for (const node of nodes) {
      leftOffsets[node] = 0;
      rightOffsets[node] = 0;
    }

    const flowPaths = flows.map((flow, i) => {
      const flowHeight = Math.max(2, (flow.count / Math.max(leftTotal, 1)) * usableHeight);

      const fromPos = leftPositions[flow.from];
      const toPos = rightPositions[flow.to];
      const fromY = fromPos.y + leftOffsets[flow.from];
      const toY = toPos.y + rightOffsets[flow.to];

      leftOffsets[flow.from] += flowHeight;
      rightOffsets[flow.to] += flowHeight;

      const midX = (leftX + NODE_WIDTH + rightX) / 2;

      const path = `M ${leftX + NODE_WIDTH} ${fromY}
        C ${midX} ${fromY}, ${midX} ${toY}, ${rightX} ${toY}
        L ${rightX} ${toY + flowHeight}
        C ${midX} ${toY + flowHeight}, ${midX} ${fromY + flowHeight}, ${leftX + NODE_WIDTH} ${fromY + flowHeight}
        Z`;

      const color = MODE_COLORS[flow.from] || '#999';

      return (
        <path
          key={`flow-${i}`}
          d={path}
          fill={color}
          fillOpacity={flow.from === flow.to ? 0.15 : 0.4}
          stroke={color}
          strokeWidth={0.5}
          strokeOpacity={0.3}
        >
          <title>{`${modeLabels[flow.from]} -> ${modeLabels[flow.to]}: ${flow.count}`}</title>
        </path>
      );
    });

    const nodeRects = nodes.flatMap(node => {
      const leftPos = leftPositions[node];
      const rightPos = rightPositions[node];
      const color = MODE_COLORS[node] || '#999';
      const leftPct = leftTotal > 0 ? ((leftTotals[node] / leftTotal) * 100).toFixed(0) : '0';
      const rightPct = rightTotal > 0 ? ((rightTotals[node] / rightTotal) * 100).toFixed(0) : '0';

      return [
        <rect
          key={`left-${node}`}
          x={leftX}
          y={leftPos.y}
          width={NODE_WIDTH}
          height={leftPos.height}
          fill={color}
          rx={2}
        />,
        <text
          key={`left-label-${node}`}
          x={leftX - 6}
          y={leftPos.y + leftPos.height / 2}
          textAnchor="end"
          dominantBaseline="middle"
          className={outputStyles.sankeyLabel}
        >
          {`${modeLabels[node]} (${leftPct}%)`}
        </text>,
        <rect
          key={`right-${node}`}
          x={rightX}
          y={rightPos.y}
          width={NODE_WIDTH}
          height={rightPos.height}
          fill={color}
          rx={2}
        />,
        <text
          key={`right-label-${node}`}
          x={rightX + NODE_WIDTH + 6}
          y={rightPos.y + rightPos.height / 2}
          textAnchor="start"
          dominantBaseline="middle"
          className={outputStyles.sankeyLabel}
        >
          {`${modeLabels[node]} (${rightPct}%)`}
        </text>,
      ];
    });

    // Side headers
    const headers = [
      <text
        key="header-left"
        x={leftX + NODE_WIDTH / 2}
        y={10}
        textAnchor="middle"
        className={outputStyles.sankeyLabel}
        fontWeight={600}
        fontSize={13}
      >
        {t('peopleResponseSankey.headers.baseline')}
      </text>,
      <text
        key="header-right"
        x={rightX + NODE_WIDTH / 2}
        y={10}
        textAnchor="middle"
        className={outputStyles.sankeyLabel}
        fontWeight={600}
        fontSize={13}
      >
        {t('peopleResponseSankey.headers.postPolicy')}
      </text>,
    ];

    return { flowPaths, nodeRects, headers };
  }, [sankeyData, modeLabels, t]);

  if (sankeyError) {
    return (
      <Alert
        message={t('peopleResponseSankey.error')}
        description={sankeyError}
        type="error"
        showIcon
        className={outputStyles.sectionErrorAlert}
        action={
          <Button size="small" danger onClick={handleRetry}>
            {t('peopleResponseSankey.retry')}
          </Button>
        }
      />
    );
  }

  if (sankeyState === 'inactive' || sankeyState === 'loading' || !sankeyData) {
    return (
      <div className={`${outputStyles.sankeyContainer} ${outputStyles.chartSpinnerOverlay}`}>
        <Spin size="default" />
      </div>
    );
  }

  return (
    <>
      <span className={outputStyles.chartDescription}>
        {t('peopleResponseSankey.description')}
      </span>
      <div className={outputStyles.sankeyContainer}>
        {diagram ? (
          <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} width="100%" height="100%">
            {diagram.headers}
            {diagram.flowPaths}
            {diagram.nodeRects}
          </svg>
        ) : (
          <div className={outputStyles.chartSpinnerOverlay}>
            {t('peopleResponseSankey.noFlows')}
          </div>
        )}
      </div>
    </>
  );
};
