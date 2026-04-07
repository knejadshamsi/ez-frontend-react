import { useRef, useEffect } from 'react';
import { Spin, Alert, Button } from 'antd';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { useEZOutputEmissionsStore } from '~stores/output';
import { useEZSessionStore, useEZOutputFiltersStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import type { EZEmissionsLineChartData } from '~stores/output/types';
import type { PollutantType } from '~stores/session/types';
import outputStyles from '../Output.module.less';
import './locales';

const BASELINE_COLOR = '#c8c4c2';
const POLICY_COLOR = '#3a7cbd';

const sumArraysToKg = (...arrays: number[][]) => {
  const len = arrays[0]?.length ?? 0;
  const result = new Array(len).fill(0);
  for (const arr of arrays) {
    for (let i = 0; i < len; i++) {
      result[i] += arr[i] ?? 0;
    }
  }
  for (let i = 0; i < len; i++) {
    result[i] /= 1000;
  }
  return result;
};

const getDataForPollutant = (data: EZEmissionsLineChartData, pollutant: PollutantType) => {
  switch (pollutant) {
    case 'CO2': return { baseline: data.co2Baseline, policy: data.co2Policy };
    case 'NOx': return { baseline: data.noxBaseline, policy: data.noxPolicy };
    case 'PM2.5': return { baseline: data.pm25Baseline, policy: data.pm25Policy };
    case 'PM10': return { baseline: data.pm10Baseline, policy: data.pm10Policy };
    case 'All': return {
      baseline: sumArraysToKg(data.co2Baseline, data.noxBaseline, data.pm25Baseline, data.pm10Baseline),
      policy: sumArraysToKg(data.co2Policy, data.noxPolicy, data.pm25Policy, data.pm10Policy),
    };
  }
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top' as const },
    datalabels: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f0f0f0' },
      ticks: {
        font: { size: 11 },
        maxTicksLimit: 6,
        callback: (value: number | string) => {
          const num = Number(value);
          return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
        },
      },
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 } },
    },
  },
};

/**
 * Emissions Line Chart - time-binned pollutant data
 * SSE Message: data_chart_line_emissions
 * Controlled by shared pollutant toggle in session store
 */
export const EmissionsLineChart = () => {
  const { t } = useTranslation('ez-output-charts');
  const lineChartData = useEZOutputEmissionsStore((state) => state.emissionsLineChartData);
  const lineChartState = useEZOutputEmissionsStore((state) => state.emissionsLineChartState);
  const lineChartError = useEZOutputEmissionsStore((state) => state.emissionsLineChartError);
  const requestId = useEZSessionStore((state) => state.requestId);
  const selectedPollutant = useEZOutputFiltersStore((s) => s.selectedPollutantType);

  // Fix react-chartjs-2 race condition: chart doesn't render on initial mount
  // because container dimensions aren't finalized yet. Trigger resize after paint.
  const chartRef = useRef<any>(null);
  useEffect(() => {
    if (!lineChartData) return;
    const frame = requestAnimationFrame(() => {
      chartRef.current?.resize();
    });
    return () => cancelAnimationFrame(frame);
  }, [lineChartData]);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'chart_line_emissions');
    }
  };

  if (lineChartError) {
    return (
      <Alert
        message={t('emissionsLine.error')}
        description={lineChartError}
        type="error"
        showIcon
        className={outputStyles.sectionErrorAlert}
        action={
          <Button size="small" danger onClick={handleRetry}>
            {t('emissionsLine.retry')}
          </Button>
        }
      />
    );
  }

  if (lineChartState === 'inactive' || lineChartState === 'loading' || !lineChartData) {
    return (
      <div className={`${outputStyles.lineChartContainer} ${outputStyles.chartSpinnerOverlay}`}>
        <Spin size="default" />
      </div>
    );
  }

  const { baseline, policy } = getDataForPollutant(lineChartData, selectedPollutant);

  return (
    <>
      <span className={outputStyles.chartDescription}>
        {t('emissionsLine.description')}
      </span>
      <div className={outputStyles.lineChartContainer}>
        <Line
          ref={chartRef}
          data={{
            labels: lineChartData.timeBins,
            datasets: [
              {
                label: t('emissionsLine.legend.baseline'),
                data: baseline,
                borderColor: BASELINE_COLOR,
                backgroundColor: BASELINE_COLOR,
                borderDash: [5, 5],
                pointRadius: 2,
                tension: 0.3,
              },
              {
                label: t('emissionsLine.legend.policy'),
                data: policy,
                borderColor: POLICY_COLOR,
                backgroundColor: POLICY_COLOR,
                pointRadius: 2,
                tension: 0.3,
              },
            ],
          }}
          options={chartOptions}
        />
      </div>
    </>
  );
};
