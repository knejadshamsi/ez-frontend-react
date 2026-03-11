import { Spin, Alert, Button } from 'antd';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { useEZOutputEmissionsStore } from '~stores/output';
import { useEZSessionStore, useEZOutputFiltersStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import type { PollutantType } from '~stores/session/types';
import outputStyles from '../Output.module.less';
import './locales';

const BASELINE_COLOR = '#c8c4c2';

const POLLUTANT_COLORS: Record<string, string> = {
  CO2: '#980002',
  NOx: '#C05100',
  'PM2.5': '#CC0000',
  PM10: '#E67E22',
  All: '#5B2C6F',
};

const makeChartOptions = (suggestedMin: number) => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  barPercentage: 0.7,
  categoryPercentage: 0.5,
  plugins: {
    legend: { display: true, position: 'top' as const },
    datalabels: { display: false },
  },
  scales: {
    x: {
      beginAtZero: false,
      suggestedMin,
      grid: { color: '#f0f0f0' },
      ticks: {
        font: { size: 11 },
        maxTicksLimit: 6,
        callback: (value: number | string) => {
          return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
        },
      },
    },
    y: { grid: { display: false } },
  },
});

/**
 * Emissions Horizontal Bar - single chart for selected pollutant
 * SSE Message: data_chart_bar_emissions (same payload as paragraph1)
 * Controlled by shared pollutant toggle in session store
 */
export const EmissionsBar = () => {
  const { t } = useTranslation('ez-output-charts');
  const barChartData = useEZOutputEmissionsStore((state) => state.emissionsBarChartData);
  const barChartState = useEZOutputEmissionsStore((state) => state.emissionsBarChartState);
  const barChartError = useEZOutputEmissionsStore((state) => state.emissionsBarChartError);
  const requestId = useEZSessionStore((state) => state.requestId);
  const selectedPollutant = useEZOutputFiltersStore((s) => s.selectedPollutantType);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'chart_bar_emissions');
    }
  };

  if (barChartError) {
    return (
      <Alert
        message={t('emissionsBar.error')}
        description={barChartError}
        type="error"
        showIcon
        className={outputStyles.sectionErrorAlert}
        action={
          <Button size="small" danger onClick={handleRetry}>
            {t('emissionsBar.retry')}
          </Button>
        }
      />
    );
  }

  if (barChartState === 'inactive' || barChartState === 'loading' || !barChartData) {
    return (
      <div className={`${outputStyles.emissionsChartContainer} ${outputStyles.chartSpinnerOverlay}`}>
        <Spin size="default" />
      </div>
    );
  }

  const getPollutantValues = (pollutant: PollutantType) => {
    switch (pollutant) {
      case 'CO2': return { baseline: barChartData.privateCo2Baseline / 1000, policy: barChartData.privateCo2Policy / 1000, unit: 'kg' };
      case 'NOx': return { baseline: barChartData.privateNoxBaseline, policy: barChartData.privateNoxPolicy, unit: 'g' };
      case 'PM2.5': return { baseline: barChartData.privatePm25Baseline, policy: barChartData.privatePm25Policy, unit: 'g' };
      case 'PM10': return { baseline: barChartData.privatePm10Baseline, policy: barChartData.privatePm10Policy, unit: 'g' };
      case 'All': return {
        baseline: barChartData.privateCo2Baseline / 1000
          + barChartData.privateNoxBaseline / 1000
          + barChartData.privatePm25Baseline / 1000
          + barChartData.privatePm10Baseline / 1000,
        policy: barChartData.privateCo2Policy / 1000
          + barChartData.privateNoxPolicy / 1000
          + barChartData.privatePm25Policy / 1000
          + barChartData.privatePm10Policy / 1000,
        unit: 'kg',
      };
    }
  };

  const { baseline, policy, unit } = getPollutantValues(selectedPollutant);
  const min = Math.min(baseline, policy);
  const max = Math.max(baseline, policy);
  const range = max - min;
  const suggestedMin = Math.max(0, min - range * 0.5);

  return (
    <>
      <span className={outputStyles.chartDescription}>
        {t('emissionsBar.description')}
      </span>
      <div className={outputStyles.emissionsChartContainer}>
        <Bar
          data={{
            labels: [`${selectedPollutant === 'All' ? 'All' : selectedPollutant} (${unit})`],
            datasets: [
              {
                label: t('emissionsBar.legend.baseline'),
                data: [baseline],
                backgroundColor: BASELINE_COLOR,
                borderWidth: 0,
              },
              {
                label: t('emissionsBar.legend.postPolicy'),
                data: [policy],
                backgroundColor: POLLUTANT_COLORS[selectedPollutant],
                borderWidth: 0,
              },
            ],
          }}
          options={makeChartOptions(suggestedMin)}
        />
      </div>
    </>
  );
};
