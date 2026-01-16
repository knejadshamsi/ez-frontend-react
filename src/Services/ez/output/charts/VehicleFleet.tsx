import { Row, Col, Spin, Alert, Button } from 'antd';
import { Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import {
  useEZOutputEmissionsStore,
  useEZOutputChartConfigStore
} from '~stores/output';
import { useEZSessionStore } from '~stores/session';
import { retryComponentData } from '~ez/api';
import outputStyles from '../Output.module.less';
import './locales';

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
export const VehicleFleet = () => {
  const { t } = useTranslation('ez-output-charts');
  const pieChartsData = useEZOutputEmissionsStore((state) => state.emissionsPieChartsData);
  const pieChartsState = useEZOutputEmissionsStore((state) => state.emissionsPieChartsState);
  const pieChartsError = useEZOutputEmissionsStore((state) => state.emissionsPieChartsError);
  const chartConfig = useEZOutputChartConfigStore((state) => state.vehicleEmissionsChartConfig);
  const requestId = useEZSessionStore((state) => state.requestId);

  const handleRetry = async () => {
    if (requestId) {
      await retryComponentData(requestId, 'chart_pie_emissions');
    }
  };

  if (pieChartsError) {
    return (
      <Alert
        message={t('vehicleFleet.error')}
        description={pieChartsError}
        type="error"
        showIcon
        className={outputStyles.sectionErrorAlert}
        action={
          <Button size="small" danger onClick={handleRetry}>
            {t('vehicleFleet.retry')}
          </Button>
        }
      />
    );
  }

  if (pieChartsState === 'inactive' || pieChartsState === 'loading' || !pieChartsData) {
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
        {t('vehicleFleet.description')}
      </span>
      <div className={outputStyles.vehicleEmissionsContainer}>
        <div className={outputStyles.legendContainer}>
          {chartConfig.vehicleTypeLabels.map((label, index) => (
            <div key={chartConfig.vehicleTypeIds[index]} className={outputStyles.legendItem}>
              <div
                className={outputStyles.legendColorBox}
                style={{ backgroundColor: chartConfig.vehicleTypeColors[index] }}
              ></div>
              <span className={outputStyles.legendText}>{label}</span>
            </div>
          ))}
        </div>
        <Row gutter={24}>
          <Col span={12}>
            <div className={outputStyles.pieChartContainer}>
              <Pie data={vehicleEmissionsBaseline} options={pieChartOptions} />
            </div>
            <div className={outputStyles.chartLabel}>
              <span className={outputStyles.chartLabelText}>{t('vehicleFleet.labels.baseline')}</span>
            </div>
          </Col>
          <Col span={12}>
            <div className={outputStyles.pieChartContainer}>
              <Pie data={vehicleEmissionsPostPolicy} options={pieChartOptions} />
            </div>
            <div className={outputStyles.chartLabel}>
              <span className={outputStyles.chartLabelText}>{t('vehicleFleet.labels.postPolicy')}</span>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};
