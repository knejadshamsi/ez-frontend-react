import { Spin } from 'antd';
import { Bar } from 'react-chartjs-2';
import {
  useEZOutputEmissionsStore,
  useEZOutputChartConfigStore
} from '~stores/output';
import outputStyles from '../Output.module.less';

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
 * SSE Message: data_emissions_bar_chart
 */
export const BarChart = () => {
  const barChartData = useEZOutputEmissionsStore((state) => state.emissionsBarChartData);
  const chartConfig = useEZOutputChartConfigStore((state) => state.emissionsBarChartConfig);

  if (!barChartData) {
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
        label: 'Baseline (tonnes/day)',
        data: barChartData.baselineEmissions,
        backgroundColor: chartConfig.baselineBarColor,
        borderWidth: 0
      },
      {
        label: 'Post-Policy (tonnes/day)',
        data: barChartData.postPolicyEmissions,
        backgroundColor: chartConfig.postPolicyBarColor,
        borderWidth: 0
      }
    ]
  };

  return (
    <>
      <span className={outputStyles.chartDescription}>
        Breakdown by pollutant type comparing baseline and post-policy emissions.
      </span>
      <div className={outputStyles.emissionsChartContainer}>
        <Bar data={chartData} options={barChartOptions} />
      </div>
    </>
  );
};
