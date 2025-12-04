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
import * as PeopleResponse from './peopleResponse';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const OutputView = () => {
  useDemoDataLoader();

  return (
    <div className={outputStyles.contentWrapper}>
      <Overview />

      <Divider orientation="left">
        <span className={outputStyles.sectionTitle}>1. Emissions and Comparisons</span>
      </Divider>

      <Emissions.Paragraph1 />
      <Emissions.BarChart />
      <Emissions.Map />
      <Emissions.Paragraph2 />
      <Emissions.VehicleFleetChart />

      <Divider orientation="left">
        <span className={outputStyles.sectionTitle}>2. People Response</span>
      </Divider>

      <PeopleResponse.Paragraph1 />
      <PeopleResponse.ResponseBreakdownChart />
    </div>
  );
};
