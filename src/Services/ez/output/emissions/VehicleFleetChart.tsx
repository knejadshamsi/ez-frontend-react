import { Row, Col, Spin } from 'antd';
import { Pie } from 'react-chartjs-2';
import {
  useEZOutputEmissionsStore,
  useEZOutputChartConfigStore
} from '~stores/output';
import outputStyles from '../Output.module.less';

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  }
};

/**
 * Emissions Vehicle Fleet Chart - vehicle type contribution to emissions
 * SSE Message: data_chart_pie_emissions
 */
export const VehicleFleetChart = () => {
  const pieChartsData = useEZOutputEmissionsStore((state) => state.emissionsPieChartsData);
  const chartConfig = useEZOutputChartConfigStore((state) => state.vehicleEmissionsChartConfig);

  if (!pieChartsData) {
    return (
      <div className={outputStyles.vehicleEmissionsContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Spin size="default" />
      </div>
    );
  }

  const vehicleEmissionsBaseline = {
    labels: chartConfig.vehicleTypeLabels,
    datasets: [{
      data: pieChartsData.vehicleShareBaseline,
      backgroundColor: chartConfig.vehicleTypeColors,
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const vehicleEmissionsPostPolicy = {
    labels: chartConfig.vehicleTypeLabels,
    datasets: [{
      data: pieChartsData.vehicleSharePostPolicy,
      backgroundColor: chartConfig.vehicleTypeColors,
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  return (
    <>
      <span className={outputStyles.chartDescription}>
        Vehicle type contribution to total emissions, showing the shift in fleet composition between baseline and post-policy scenarios.
      </span>
      <div className={outputStyles.vehicleEmissionsContainer}>
        <div className={outputStyles.legendContainer}>
          <div className={outputStyles.legendItem}>
            <div className={`${outputStyles.legendColorBox} ${outputStyles.electricVehicleColor}`}></div>
            <span className={outputStyles.legendText}>Electric Vehicles</span>
          </div>
          <div className={outputStyles.legendItem}>
            <div className={`${outputStyles.legendColorBox} ${outputStyles.standardVehicleColor}`}></div>
            <span className={outputStyles.legendText}>Standard Vehicles</span>
          </div>
          <div className={outputStyles.legendItem}>
            <div className={`${outputStyles.legendColorBox} ${outputStyles.heavyVehicleColor}`}></div>
            <span className={outputStyles.legendText}>Heavy Vehicles</span>
          </div>
        </div>
        <Row gutter={24}>
          <Col span={12}>
            <div className={outputStyles.pieChartContainer}>
              <Pie data={vehicleEmissionsBaseline} options={pieChartOptions} />
            </div>
            <div className={outputStyles.chartLabel}>
              <span className={outputStyles.chartLabelText}>Baseline</span>
            </div>
          </Col>
          <Col span={12}>
            <div className={outputStyles.pieChartContainer}>
              <Pie data={vehicleEmissionsPostPolicy} options={pieChartOptions} />
            </div>
            <div className={outputStyles.chartLabel}>
              <span className={outputStyles.chartLabelText}>Post-Policy</span>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};
