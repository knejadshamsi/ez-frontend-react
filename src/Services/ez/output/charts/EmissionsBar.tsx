import { Spin, Alert, Button } from 'antd';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import {
  useEZOutputEmissionsStore,
  useEZOutputChartConfigStore
} from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import outputStyles from '../Output.module.less';
import './locales';

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' as const }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f0f0f0' }
    },
    x: {
      grid: { display: false }
    }
  }
};

/**
 * Emissions Bar Chart - pollutant comparison (baseline vs post-policy)
 * SSE Message: data_chart_bar_emissions
 */
export const EmissionsBar = () => {
  const { t } = useTranslation('ez-output-charts');
  const barChartData = useEZOutputEmissionsStore((state) => state.emissionsBarChartData);
  const barChartState = useEZOutputEmissionsStore((state) => state.emissionsBarChartState);
  const barChartError = useEZOutputEmissionsStore((state) => state.emissionsBarChartError);
  const chartConfig = useEZOutputChartConfigStore((state) => state.emissionsBarChartConfig);
  const requestId = useEZSessionStore((state) => state.requestId);

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
      <div className={outputStyles.emissionsChartContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="default" />
      </div>
    );
  }

  const chartData = {
    labels: chartConfig.pollutantLabels,
    datasets: [
      {
        label: t('emissionsBar.legend.baseline'),
        data: barChartData.baselineEmissions,
        backgroundColor: chartConfig.baselineBarColor,
        borderWidth: 0
      },
      {
        label: t('emissionsBar.legend.postPolicy'),
        data: barChartData.postPolicyEmissions,
        backgroundColor: chartConfig.postPolicyBarColor,
        borderWidth: 0
      }
    ]
  };

  return (
    <>
      <span className={outputStyles.chartDescription}>
        {t('emissionsBar.description')}
      </span>
      <div className={outputStyles.emissionsChartContainer}>
        <Bar data={chartData} options={barChartOptions} />
      </div>
    </>
  );
};
