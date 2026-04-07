import { Button, Divider, Modal, Radio } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { EZFeedbackModal } from '~ez/components/EZFeedbackModal';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useAPIPayloadStore, useEZServiceStore } from '~store';
import { useEZSessionStore, useEZOutputFiltersStore } from '~stores/session';
import { resetOutputState } from '~stores/reset';
import outputStyles from './Output.module.less';
import parameterStyles from '../input/ParameterSelectionView.module.less';
import { useDemoDataLoader } from './demo';
import { Overview } from './Overview';
import * as Emissions from './emissions';
import * as PeopleResponse from './peopleResponse';
import * as TripLegs from './tripLegs';
import './locales';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

export const OutputView = () => {
  const { t } = useTranslation('ez-output');
  useDemoDataLoader();

  const [modal, contextHolder] = Modal.useModal();
  const setState = useEZServiceStore((state) => state.setState);
  const sessionIntent = useEZServiceStore((state) => state.sessionIntent);
  const zones = useAPIPayloadStore((state) => state.payload.zones);
  const resetApiPayload = useAPIPayloadStore((state) => state.reset);
  const resetSession = useEZSessionStore((state) => state.reset);
  const setRequestId = useEZSessionStore((state) => state.setRequestId);

  const selectedPollutant = useEZOutputFiltersStore((s) => s.selectedPollutantType);
  const setSelectedPollutant = useEZOutputFiltersStore((s) => s.setSelectedPollutantType);

  const handleEditParameters = () => {
    if (sessionIntent === 'VIEW_SCENARIO_OFFLINE') {
      setState('VIEW_PARAMETERS');
      return;
    }

    EZFeedbackModal(modal, {
      title: t('editParametersModal.title'),
      content: t('editParametersModal.content'),
      actions: [
        { label: t('editParametersModal.cancel') },
        {
          label: t('editParametersModal.reset'),
          danger: true,
          onClick: () => {
            resetApiPayload();
            resetSession();
            resetOutputState();
            setRequestId('');
            setState('SELECT_PARAMETERS');
          },
        },
        {
          label: t('editParametersModal.keepInputs'),
          highlight: true,
          onClick: () => {
            setState('VIEW_PARAMETERS');
          },
        },
      ],
    });
  };

  const hasInputData = zones.length > 0;

  return (
    <div className={outputStyles.contentWrapper}>
      {contextHolder}
      {hasInputData && (
        <div className={parameterStyles.backButtonContainer}>
          <Button type="link" onClick={handleEditParameters} className={parameterStyles.backButton}>
            <ArrowLeftOutlined className={outputStyles.backArrowIcon} />
            {t('backToParameters')}
          </Button>
        </div>
      )}
      <Overview />

      <Divider orientation="left">
        <span className={outputStyles.sectionTitle}>{t('sections.emissions')}</span>
      </Divider>

      <Emissions.Paragraph1 />
      <Emissions.Paragraph2 />
      <Emissions.WarmColdIntensity />

      <div className={outputStyles.pollutantSelector}>
        <Radio.Group
          value={selectedPollutant}
          onChange={(e) => setSelectedPollutant(e.target.value)}
          size="small"
        >
          <Radio.Button value="All">{t('pollutantSelector.all')}</Radio.Button>
          <Radio.Button value="CO2">CO{'\u2082'}</Radio.Button>
          <Radio.Button value="NOx">NOx</Radio.Button>
          <Radio.Button value="PM2.5">PM2.5</Radio.Button>
          <Radio.Button value="PM10">PM10</Radio.Button>
        </Radio.Group>
      </div>

      <Emissions.BarChart />
      <Emissions.LineChart />
      <Emissions.StackedBar />
      <Emissions.Map />

      <Divider orientation="left">
        <span className={outputStyles.sectionTitle}>{t('sections.peopleResponse')}</span>
      </Divider>

      <PeopleResponse.Paragraph />
      <PeopleResponse.Sankey />
      <PeopleResponse.Bar />
      <PeopleResponse.Map />

      <Divider orientation="left">
        <span className={outputStyles.sectionTitle}>{t('sections.legPerformance')}</span>
      </Divider>

      <TripLegs.Paragraph />
      <TripLegs.Table />
      <TripLegs.Map />
    </div>
  );
};
