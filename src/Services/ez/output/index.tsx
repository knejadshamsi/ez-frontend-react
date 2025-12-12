import { Divider, Button, Modal } from 'antd';
import { ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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
import { useAPIPayloadStore, useEZServiceStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import outputStyles from './Output.module.less';
import parameterStyles from '../input/ParameterSelectionView.module.less';
import { useDemoDataLoader } from './demo';
import { Overview } from './Overview';
import * as Emissions from './emissions';
import * as PeopleResponse from './peopleResponse';
import * as TripLegs from './tripLegs';

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

  const [modal, contextHolder] = Modal.useModal();
  const setState = useEZServiceStore((state) => state.setState);
  const zones = useAPIPayloadStore((state) => state.payload.zones);
  const resetApiPayload = useAPIPayloadStore((state) => state.reset);
  const resetSession = useEZSessionStore((state) => state.reset);

  const handleEditParameters = () => {
    const instance = modal.confirm({
      title: 'Edit Parameters',
      icon: <ExclamationCircleOutlined />,
      content: 'Do you want to keep the current inputs and modify them, or reset all inputs?',
      okText: 'Keep Inputs',
      cancelText: 'Cancel',
      onOk() {
        setState('PARAMETER_SELECTION');
      },
      footer: (_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <Button
            danger
            onClick={() => {
              resetApiPayload();
              resetSession();
              setState('PARAMETER_SELECTION');
              instance.destroy();
            }}
          >
            Reset All
          </Button>
          <OkBtn />
        </>
      ),
    });
  };

  const hasInputData = zones.length > 0;

  return (
    <div className={outputStyles.contentWrapper}>
      {contextHolder}
      {hasInputData && (
        <div className={parameterStyles.backButtonContainer}>
          <Button type="link" onClick={handleEditParameters} className={parameterStyles.backButton}>
            <ArrowLeftOutlined style={{fontSize: '12px'}} />
            Back to Parameter Selection
          </Button>
        </div>
      )}
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
      <PeopleResponse.ResponseBreakdown />
      <PeopleResponse.Map />
      <PeopleResponse.Paragraph2 />
      <PeopleResponse.TimeImpact />

      <Divider orientation="left">
        <span className={outputStyles.sectionTitle}>3. Leg Performance</span>
      </Divider>

      <TripLegs.Map />
      <TripLegs.Table />
    </div>
  );
};
