import { Spin } from 'antd';
import { Bar } from 'react-chartjs-2';
import {
  useEZOutputPeopleResponseStore,
  useEZOutputChartConfigStore
} from '~stores/output';
import outputStyles from '../Output.module.less';

/**
 * People Response Breakdown - stacked bar showing behavioral responses
 * SSE Message: data_chart_breakdown_people_response
 */
export const ResponseBreakdown = () => {
  const breakdownData = useEZOutputPeopleResponseStore((state) => state.peopleResponseBreakdownChartData);
  const chartConfig = useEZOutputChartConfigStore((state) => state.peopleResponseChartConfig);

  if (!breakdownData) {
    return (
      <div className={outputStyles.peopleResponseChartContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="default" />
      </div>
    );
  }

  const chartData = {
    labels: [chartConfig.categoryLabels[0]],
    datasets: chartConfig.categoryLabels.map((label, index) => ({
      label,
      data: [breakdownData.responsePercentages[index]],
      backgroundColor: chartConfig.categoryColors[index],
      borderWidth: 0
    }))
  };

  return (
    <>
      <span className={outputStyles.chartDescription}>
        Breakdown of behavioral responses across all affected trips.
      </span>
      <div className={outputStyles.peopleResponseChartContainer}>
        <Bar data={chartData} options={{
          indexAxis: 'y' as const,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom' as const,
              labels: {
                boxWidth: 12,
                padding: 8,
                font: { size: 11 }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.parsed.x}%`
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              beginAtZero: true,
              max: 100,
              grid: { display: false },
              ticks: {
                callback: (value) => `${value}%`
              }
            },
            y: {
              stacked: true,
              grid: { display: false },
              ticks: { display: false }
            }
          }
        }} />
      </div>
    </>
  );
};
