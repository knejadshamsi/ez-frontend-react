import { useEffect, useState } from 'react';
import { Typography, message, Modal, Popover } from 'antd';
import { SyncOutlined, CloseOutlined, GlobalOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import '~ez/locales';
import { useEZServiceStore } from '~store';
import { useEZSessionStore } from '~stores/session';
import { useBatchStore } from '~stores/batch';
import { useServiceStore } from '~globalStores';
import { isProcessState } from '~ez/stores/types';
import { checkBackendHealth, getBackendUrl } from '~ez/api';
import { handleExit } from '~ez/exitHandler';
import { BatchPopover } from './BatchPopover';
import '~ez/components/locales';
import styles from './header.module.less';

const { Title } = Typography;

export default function EzHeader() {
  const { t, i18n } = useTranslation('ez-root');
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [retrying, setRetrying] = useState(false);
  const ezState = useEZServiceStore((state) => state.state);
  const connectionState = useEZServiceStore((state) => state.connectionState);
  const sessionIntent = useEZServiceStore((state) => state.sessionIntent);
  const isExiting = useEZServiceStore((state) => state.isExiting);

  const batchSimulations = useBatchStore((s) => s.simulations);

  const setActiveService = useServiceStore((state) => state.setActiveService);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleExitClick = () => {
    handleExit(modal, messageApi, () => setActiveService('REST'));
  };

  const [stepTitle, setStepTitle] = useState(t('stepTitles.welcome'));

  useEffect(() => {
    switch (ezState) {
      case 'WELCOME':
        setStepTitle(t('stepTitles.welcome'));
        break;
      case 'SELECT_PARAMETERS':
        setStepTitle(t('stepTitles.parameterSelection'));
        break;
      case 'DRAW_EMISSION_ZONE':
        setStepTitle(t('stepTitles.drawEmissionZone'));
        break;
      case 'EDIT_EMISSION_ZONE':
        setStepTitle(t('stepTitles.editEmissionZone'));
        break;
      case 'REDRAW_EMISSION_ZONE':
        setStepTitle(t('stepTitles.redrawEmissionZone'));
        break;
      case 'DRAW_SIMULATION_AREA':
        setStepTitle(t('stepTitles.drawSimulationArea'));
        break;
      case 'EDIT_SIMULATION_AREA':
        setStepTitle(t('stepTitles.editSimulationArea'));
        break;
      case 'VIEW_RESULTS':
        setStepTitle(t('stepTitles.viewResults'));
        break;
      case 'VIEW_PARAMETERS':
        setStepTitle(t('stepTitles.parameterSelection'));
        break;
      default:
        if (isProcessState(ezState)) {
          setStepTitle(t('stepTitles.processing'));
        }
        break;
    }
  }, [ezState, t]);

  const handleRetryConnection = async () => {
    // If backend is already connected, just switch intent to live
    if (connectionState === 'FULL_CONNECT' && sessionIntent === 'LOAD_DEMO_SCENARIO') {
      const requestId = useEZSessionStore.getState().requestId;
      if (requestId && requestId.trim() !== '') {
        useEZServiceStore.getState().setSessionIntent('LOAD_PREVIOUS_SCENARIO');
      } else {
        useEZServiceStore.getState().setSessionIntent('RUN_NEW_SIMULATION');
      }
      messageApi.success(t('retryConnection.success'));
      return;
    }

    setRetrying(true);

    try {
      const backendUrl = getBackendUrl();

      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), 3000);
      });

      const healthCheckPromise = checkBackendHealth(`${backendUrl}/health`);

      const isAlive = await Promise.race([healthCheckPromise, timeoutPromise]);

      setRetrying(false);

      if (isAlive) {
        messageApi.success(t('retryConnection.success'));
      } else {
        messageApi.error(t('retryConnection.failed'));
      }
    } catch (error) {
      setRetrying(false);
      const errorMessage = error instanceof Error ? error.message : t('retryConnection.configError');
      messageApi.error(errorMessage);
    }
  };

  return (
    <div className={styles.headerContainer}>
      {contextHolder}
      {modalContextHolder}
      <div className={styles.titleContainer}>
        <Title level={4} className={styles.title}>
          EZ Service
        </Title>
        {sessionIntent === 'VIEW_SCENARIO_OFFLINE' ? (
          <div className={styles.demoModeWrapper}>
            <div className={styles.offlineBadgeContainer}>
              <span>{t('offlineMode.label')}</span>
            </div>
          </div>
        ) : sessionIntent === 'LOAD_DEMO_SCENARIO' && (
          <div className={styles.demoModeWrapper}>
            <div className={styles.demoBadgeContainer}>
              <span>{t('demoMode.label')}</span>
            </div>
            {(connectionState === 'FULL_DISCONNECT' || sessionIntent === 'LOAD_DEMO_SCENARIO') && (
              <button
                onClick={handleRetryConnection}
                title={t('retryConnection.tooltip')}
                aria-label={t('retryConnection.tooltip')}
                className={styles.retryButton}
                disabled={retrying}
              >
                <SyncOutlined spin={retrying} />
              </button>
            )}
          </div>
        )}
      </div>
      <div className={styles.stepTitleContainer}>
        <span className={styles.stepTitle}>{stepTitle}</span>
      </div>
      {batchSimulations.length >= 2 && (
        <Popover
          content={<BatchPopover messageApi={messageApi} modal={modal} />}
          title={t('batch.popoverTitle')}
          trigger="click"
          placement="bottomRight"
        >
          <button
            title={t('batch.headerTooltip')}
            aria-label={t('batch.headerTooltip')}
            className={styles.headerButton}
          >
            <UnorderedListOutlined />
            <span>{batchSimulations.length}</span>
          </button>
        </Popover>
      )}
      <button
        title={t('header.toggleLanguage')}
        aria-label={t('header.toggleLanguage')}
        className={styles.headerButton}
        onClick={toggleLanguage}
      >
        <GlobalOutlined />
        <span>{i18n.language === 'en' ? 'En' : 'Fr'}</span>
      </button>
      <button
        title={t('header.exit')}
        aria-label={t('header.exit')}
        className={`${styles.headerButton} ${i18n.language === 'fr' ? styles.headerButtonFr : ''}`}
        onClick={handleExitClick}
        disabled={isExiting}
      >
        <CloseOutlined />
        <span>{t('header.exit')}</span>
      </button>
    </div>
  );
}
