import { Button, Divider, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { showEZModal } from '~ez/components/EZModal';
import { useTranslation } from 'react-i18next';
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
import { resetAllEZOutputStores } from '~stores/output';
import { useScenarioSnapshotStore } from '~stores/scenario';
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
  Title,
  Tooltip,
  Legend
);

export const OutputView = () => {
  const { t } = useTranslation('ez-output');
  useDemoDataLoader();

  const [modal, contextHolder] = Modal.useModal();
  const setState = useEZServiceStore((state) => state.setState);
  const zones = useAPIPayloadStore((state) => state.payload.zones);
  const resetApiPayload = useAPIPayloadStore((state) => state.reset);
  const resetSession = useEZSessionStore((state) => state.reset);
  const setRequestId = useEZSessionStore((state) => state.setRequestId);

  const handleEditParameters = () => {
    const instance = showEZModal(modal, {
      title: t('editParametersModal.title'),
      content: t('editParametersModal.content'),
      actions: [
        { label: t('editParametersModal.cancel'), onClick: () => instance.destroy() },
        {
          label: t('editParametersModal.reset'),
          danger: true,
          ghost: true,
          onClick: () => {
            resetApiPayload();
            resetSession();
            resetAllEZOutputStores();
            useScenarioSnapshotStore.getState().reset();
            setRequestId('');
            setState('PARAMETER_SELECTION');
            instance.destroy();
          },
        },
        {
          label: t('editParametersModal.keepInputs'),
          type: 'primary',
          onClick: () => {
            setState('PARAMETER_SELECTION');
            instance.destroy();
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
            <ArrowLeftOutlined style={{fontSize: '12px'}} />
            {t('backToParameters')}
          </Button>
        </div>
      )}
      <Overview />

      <Divider orientation="left">
        <span className={outputStyles.sectionTitle}>{t('sections.emissions')}</span>
      </Divider>

      <Emissions.Paragraph1 />
      <Emissions.BarChart />
      <Emissions.Map />
      <Emissions.Paragraph2 />
      <Emissions.VehicleFleetChart />

      <Divider orientation="left">
        <span className={outputStyles.sectionTitle}>{t('sections.peopleResponse')}</span>
      </Divider>

      <PeopleResponse.Paragraph1 />
      <PeopleResponse.ResponseBreakdown />
      <PeopleResponse.Map />
      <PeopleResponse.Paragraph2 />
      <PeopleResponse.TimeImpact />

      <Divider orientation="left">
        <span className={outputStyles.sectionTitle}>{t('sections.legPerformance')}</span>
      </Divider>

      <TripLegs.Map />
      <TripLegs.Table />
    </div>
  );
};
