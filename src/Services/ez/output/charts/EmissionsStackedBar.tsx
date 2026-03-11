import { useState, useCallback } from 'react';
import { Spin, Alert, Button } from 'antd';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { useEZOutputEmissionsStore } from '~stores/output';
import { useEZSessionStore, useEZOutputFiltersStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import outputStyles from '../Output.module.less';
import './locales';

const VEHICLE_CATEGORIES = ['zeroEmission', 'nearZeroEmission', 'lowEmission', 'midEmission', 'highEmission'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  zeroEmission: '#4caf50',
  nearZeroEmission: '#8bc34a',
  lowEmission: '#ffeb3b',
  midEmission: '#ff9800',
  highEmission: '#b71c1c',
};

const DIMMED_OPACITY = 0.2;
const MUTED_BASELINE_OPACITY = 0.35;

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const POLLUTANT_TYPE_KEYS = ['co2ByType', 'noxByType', 'pm25ByType', 'pm10ByType'] as const;

const POLLUTANT_TO_TYPE_KEY: Record<string, string> = {
  CO2: 'co2ByType',
  NOx: 'noxByType',
  'PM2.5': 'pm25ByType',
  PM10: 'pm10ByType',
};

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '50%',
  plugins: {
    legend: {
      display: true,
      position: 'right' as const,
      labels: {
        generateLabels: (chart: any) => {
          const dataset = chart.data.datasets[0];
          if (!dataset) return [];
          return chart.data.labels.map((label: string, i: number) => ({
            text: label,
            fillStyle: dataset.backgroundColor[i],
            strokeStyle: '#fff',
            lineWidth: 1,
            hidden: false,
            index: i,
            datasetIndex: 0,
          }));
        },
      },
    },
    datalabels: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
          const value = context.parsed;
          const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
          return `${context.dataset.label}: ${value.toLocaleString()} (${pct}%)`;
        },
      },
    },
  },
};

/**
 * Nested Donut Chart - baseline (inner, muted) vs policy (outer, vivid)
 * SSE Message: data_chart_stacked_bar_emissions
 * Controlled by shared pollutant toggle in session store
 */
export const EmissionsStackedBar = () => {
  const { t } = useTranslation('ez-output-charts');
  const stackedBarData = useEZOutputEmissionsStore((state) => state.emissionsStackedBarData);
  const stackedBarState = useEZOutputEmissionsStore((state) => state.emissionsStackedBarState);
  const stackedBarError = useEZOutputEmissionsStore((state) => state.emissionsStackedBarError);
  const requestId = useEZSessionStore((state) => state.requestId);
  const selectedPollutant = useEZOutputFiltersStore((s) => s.selectedPollutantType);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'chart_stacked_bar_emissions');
    }
  };

  const handleClick = useCallback((_event: any, elements: any[]) => {
    if (elements.length === 0) {
      setHighlightedCategory(null);
      return;
    }
    const index = elements[0].index;
    const category = VEHICLE_CATEGORIES[index];
    setHighlightedCategory((prev) => (prev === category ? null : category));
  }, []);

  if (stackedBarError) {
    return (
      <Alert
        message={t('emissionsStackedBar.error')}
        description={stackedBarError}
        type="error"
        showIcon
        className={outputStyles.sectionErrorAlert}
        action={
          <Button size="small" danger onClick={handleRetry}>
            {t('emissionsStackedBar.retry')}
          </Button>
        }
      />
    );
  }

  if (stackedBarState === 'inactive' || stackedBarState === 'loading' || !stackedBarData) {
    return (
      <div className={`${outputStyles.stackedBarContainer} ${outputStyles.chartSpinnerOverlay}`}>
        <Spin size="default" />
      </div>
    );
  }

  const getByTypeValues = (scenario: 'baseline' | 'policy') => {
    const priv = stackedBarData[scenario].private as Record<string, Record<string, number>>;
    if (selectedPollutant === 'All') {
      return VEHICLE_CATEGORIES.map((cat) => {
        let sum = 0;
        for (const key of POLLUTANT_TYPE_KEYS) {
          sum += (priv[key]?.[cat] ?? 0);
        }
        return sum / 1000;
      });
    }
    const typeKey = POLLUTANT_TO_TYPE_KEY[selectedPollutant];
    const byType = priv[typeKey] || {};
    return VEHICLE_CATEGORIES.map((cat) => byType[cat] || 0);
  };

  const baselineValues = getByTypeValues('baseline');
  const policyValues = getByTypeValues('policy');
  const labels = VEHICLE_CATEGORIES.map((cat) => t(`emissionsStackedBar.vehicleTypes.${cat}`));

  const getBaselineColors = () => {
    return VEHICLE_CATEGORIES.map((cat) => {
      const color = CATEGORY_COLORS[cat];
      if (highlightedCategory && highlightedCategory !== cat) {
        return hexToRgba(color, DIMMED_OPACITY * MUTED_BASELINE_OPACITY);
      }
      return hexToRgba(color, MUTED_BASELINE_OPACITY);
    });
  };

  const getPolicyColors = () => {
    return VEHICLE_CATEGORIES.map((cat) => {
      const color = CATEGORY_COLORS[cat];
      if (highlightedCategory && highlightedCategory !== cat) {
        return hexToRgba(color, DIMMED_OPACITY);
      }
      return color;
    });
  };

  return (
    <>
      <span className={outputStyles.chartDescription}>
        {t('emissionsStackedBar.description')}
      </span>
      <div className={outputStyles.stackedBarContainer}>
        <Doughnut
          data={{
            labels,
            datasets: [
              {
                label: t('emissionsStackedBar.labels.policy'),
                data: policyValues,
                backgroundColor: getPolicyColors(),
                borderWidth: 1,
                borderColor: '#fff',
              },
              {
                label: t('emissionsStackedBar.labels.baseline'),
                data: baselineValues,
                backgroundColor: getBaselineColors(),
                borderWidth: 1,
                borderColor: '#fff',
              },
            ],
          }}
          options={{
            ...donutOptions,
            onClick: handleClick,
          }}
        />
      </div>
    </>
  );
};
