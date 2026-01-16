import { Divider, Button, Modal, Space } from 'antd';
import { ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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

  const handleEditParameters = () => {
    const instance = modal.confirm({
      title: t('editParametersModal.title'),
      icon: <ExclamationCircleOutlined />,
      content: t('editParametersModal.content'),
      okText: t('editParametersModal.keepInputs'),
      cancelText: t('editParametersModal.cancel'),
      onOk() {
        setState('PARAMETER_SELECTION');
      },
      footer: () => (
        <div className={outputStyles.modalFooter}>
          <Button size="small" onClick={() => instance.destroy()}>
            {t('editParametersModal.cancel')}
          </Button>
          <Space size={8}>
            <Button
              size="small"
              danger
              ghost
              onClick={() => {
                resetApiPayload();
                resetSession();
                setState('PARAMETER_SELECTION');
                instance.destroy();
              }}
            >
              {t('editParametersModal.reset')}
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                setState('PARAMETER_SELECTION');
                instance.destroy();
              }}
            >
              {t('editParametersModal.keepInputs')}
            </Button>
          </Space>
        </div>
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
