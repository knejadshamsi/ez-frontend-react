import { Spin, Alert, Button } from 'antd';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import {
  useEZOutputPeopleResponseStore,
  useEZOutputChartConfigStore
} from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import outputStyles from '../Output.module.less';
import './locales';

/**
 * People Response Time Impact - bar chart showing time deltas
 * SSE Message: data_chart_time_impact_people_response
 */
export const TimeImpact = () => {
  const { t } = useTranslation('ez-output-charts');
  const timeImpactData = useEZOutputPeopleResponseStore((state) => state.peopleResponseTimeImpactChartData);
  const timeImpactState = useEZOutputPeopleResponseStore((state) => state.peopleResponseTimeImpactChartState);
  const timeImpactError = useEZOutputPeopleResponseStore((state) => state.peopleResponseTimeImpactChartError);
  const chartConfig = useEZOutputChartConfigStore((state) => state.timeImpactChartConfig);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'chart_time_impact_people_response');
    }
  };

  if (timeImpactError) {
    return (
      <Alert
        message={t('timeImpact.error')}
        description={timeImpactError}
        type="error"
        showIcon
        className={outputStyles.sectionErrorAlert}
        action={
          <Button size="small" danger onClick={handleRetry}>
            {t('timeImpact.retry')}
          </Button>
        }
      />
    );
  }

  if (timeImpactState === 'inactive' || timeImpactState === 'loading' || !timeImpactData) {
    return (
      <div className={outputStyles.timeImpactChartContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="default" />
      </div>
    );
  }

  const chartData = {
    labels: chartConfig.categoryIds.map(categoryId => t(`timeImpact.categories.${categoryId}`)),
    datasets: [{
      label: t('timeImpact.datasetLabel'),
      data: timeImpactData.averageTimeDeltas,
      backgroundColor: chartConfig.categoryColors,
      borderWidth: 0
    }]
  };

  return (
    <>
      <span className={outputStyles.chartDescription}>
        {t('timeImpact.description')}
      </span>
      <div className={outputStyles.timeImpactChartContainer}>
        <Bar data={chartData} options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed.y;
                  return `${value > 0 ? '+' : ''}${value} min`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                font: { size: 10 },
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
              title: { display: true, text: t('timeImpact.yAxisTitle') },
              ticks: {
                callback: (value) => {
                  const num = Number(value);
                  return `${num > 0 ? '+' : ''}${num}`;
                }
              }
            }
          }
        }} />
      </div>
    </>
  );
};
