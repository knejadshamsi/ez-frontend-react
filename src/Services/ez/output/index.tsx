import { Divider } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import outputStyles from './Output.module.less';
import { useDemoDataLoader } from './demo';
import { Overview } from './Overview';
import * as Emissions from './emissions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ====> OUTPUT CONTENT <====

export const OutputView = () => {
  // Load demo data when in demo mode (backend not available)
  useDemoDataLoader();

  return (
    <div className={outputStyles.contentWrapper}>
      <Overview />

      <Divider orientation="left">
        <span className={outputStyles.sectionTitle}>1. Emissions and Comparisons</span>
      </Divider>

      <Emissions.Paragraph1 />
      <Emissions.BarChart />
    </div>
  );
};
