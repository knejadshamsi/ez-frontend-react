import { Spin } from 'antd';
import { useEZOutputOverviewStore } from '~stores/output';
import outputStyles from './Output.module.less';

/**
 * Overview component - displays simulation summary statistics
 * SSE Message: data_text_overview
 */
export const Overview = () => {
  const overviewData = useEZOutputOverviewStore((state) => state.overviewData);

  if (!overviewData) {
    return (
      <div className={outputStyles.contentWrapper} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Spin size="large" tip="Loading overview data..." />
      </div>
    );
  }

  return (
    <>
      <h1 className={outputStyles.title}>Output</h1>
      <p className={outputStyles.description}>
        The simulation included{' '}
        <span className={outputStyles.highlightedNumber}>
          {overviewData.totalPersonCount.toLocaleString()}
        </span>{' '}
        people and analyzed{' '}
        <span className={outputStyles.highlightedNumber}>
          {overviewData.totalLegCount.toLocaleString()}
        </span>{' '}
        legs over a 24-hour period, covering an area of{' '}
        <span className={outputStyles.highlightedNumber}>
          {overviewData.totalAreaCoverageKm2}
        </span>{' '}
        km² with a network of{' '}
        <span className={outputStyles.highlightedNumber}>
          {overviewData.totalNetworkNodes.toLocaleString()}
        </span>{' '}
        nodes and{' '}
        <span className={outputStyles.highlightedNumber}>
          {overviewData.totalNetworkLinks.toLocaleString()}
        </span>{' '}
        links, analyzing a total of{' '}
        <span className={outputStyles.highlightedNumber}>
          {overviewData.totalKilometersTraveled.toLocaleString()}
        </span>{' '}
        km traveled.
      </p>
    </>
  );
};
