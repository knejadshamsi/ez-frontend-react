import { useEffect, useState } from 'react';
import { Typography, message } from 'antd';
import { SyncOutlined, CloseOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import '~ez/locales';
import { useEZServiceStore } from '~store';
import { checkBackendHealth, getBackendUrl } from '~ez/api';
import { handleExit } from '~ez/exitHandler';
import styles from './header.module.less';

const { Title } = Typography;

export default function EzHeader() {
  const { t, i18n } = useTranslation('ez-root');
  const [messageApi, contextHolder] = message.useMessage();
  const [retrying, setRetrying] = useState(false);

  const ezState = useEZServiceStore((state) => state.state);
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleExitClick = () => {
    console.log('[EZ Header] Exit button clicked');
    handleExit();
  };

  const [stepTitle, setStepTitle] = useState(t('stepTitles.welcome'));

  useEffect(() => {
    switch (ezState) {
      case 'WELCOME':
        setStepTitle(t('stepTitles.welcome'));
        break;
      case 'PARAMETER_SELECTION':
        setStepTitle(t('stepTitles.parameterSelection'));
        break;
      case 'DRAW_EM_ZONE':
        setStepTitle(t('stepTitles.drawEmissionZone'));
        break;
      case 'EDIT_EM_ZONE':
        setStepTitle(t('stepTitles.editEmissionZone'));
        break;
      case 'REDRAW_EM_ZONE':
        setStepTitle(t('stepTitles.redrawEmissionZone'));
        break;
      case 'DRAW_SIM_AREA':
        setStepTitle(t('stepTitles.drawSimulationArea'));
        break;
      case 'EDIT_SIM_AREA':
        setStepTitle(t('stepTitles.editSimulationArea'));
        break;
      case 'AWAIT_RESULTS':
        setStepTitle(t('stepTitles.processing'));
        break;
      case 'RESULT_VIEW':
        setStepTitle(t('stepTitles.viewResults'));
        break;
      default:
        break;
    }
  }, [ezState, t]);

  const handleRetryConnection = async () => {
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
      <div className={styles.titleContainer}>
        <Title level={4} className={styles.title}>
          EZ Service
        </Title>
        {!isEzBackendAlive && (
          <div className={styles.demoModeWrapper}>
            <div className={styles.demoBadgeContainer}>
              <span>{t('demoMode.label')}</span>
            </div>
            <button
              onClick={handleRetryConnection}
              title={t('retryConnection.tooltip')}
              className={styles.retryButton}
              disabled={retrying}
            >
              <SyncOutlined spin={retrying} />
            </button>
          </div>
        )}
      </div>
      <div className={styles.stepTitleContainer}>
        <span className={styles.stepTitle}>{stepTitle}</span>
      </div>
      <button
        title={t('header.toggleLanguage')}
        className={styles.headerButton}
        onClick={toggleLanguage}
      >
        <GlobalOutlined />
        <span>{i18n.language === 'en' ? 'En' : 'Fr'}</span>
      </button>
      <button
        title={t('header.exit')}
        className={`${styles.headerButton} ${i18n.language === 'fr' ? styles.headerButtonFr : ''}`}
        onClick={handleExitClick}
      >
        <CloseOutlined />
        <span>{t('header.exit')}</span>
      </button>
    </div>
  );
}
