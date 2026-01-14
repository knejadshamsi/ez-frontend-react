import { Space, Button, Input, Typography, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { useEZSessionStore } from '~stores/session'
import { useEZServiceStore } from '~store'
import { loadScenario } from '~ez/api'
import previousScenarios from './previousScenarios.json'
import './locales'
import styles from './WelcomeView.module.less'

const { Text } = Typography

export const WelcomeView = () => {
  const { t } = useTranslation('ez-welcome');
  const [messageApi, contextHolder] = message.useMessage();

  const requestId = useEZSessionStore((state) => state.requestId)
  const setRequestId = useEZSessionStore((state) => state.setRequestId)
  const setState = useEZServiceStore((state) => state.setState)

  const handleScenarioLoadError = (errorMessage: string) => {
    messageApi.error(errorMessage || t('errors.loadFailed'));
    setState('WELCOME');
  };

  // CLICK HANDLING

  const handleViewScenario = async (scenarioRequestId: string) => {
    if (!scenarioRequestId || scenarioRequestId.trim() === '') {
      messageApi.error(t('errors.invalidId'));
      return;
    }

    setRequestId(scenarioRequestId);
    await loadScenario(scenarioRequestId, setState, handleScenarioLoadError);
  }

  const handleCreateScenario = () => {
    setState('PARAMETER_SELECTION')
  }

  const handleViewPreviousScenario = async () => {
    if (!requestId || requestId.trim() === '') {
      messageApi.error(t('errors.enterValidId'));
      return;
    }

    await loadScenario(requestId, setState, handleScenarioLoadError);
  }


  return (
    <div className={styles.container}>
      {contextHolder}
      <div className={styles.welcomeText}>
        <br />
        {t('welcome.title')}
        <strong>{t('welcome.titleBold')}</strong>
        {t('welcome.titleEnd')}
        <br />
        <br />
        {t('welcome.subtitle')}
      </div>

      <div className={styles.scenarioListContainer}>
        <Text className={styles.scenarioListTitle}>{t('previousScenarios.title')}</Text>
        <div className={styles.scenarioList}>
          {previousScenarios.map((scenario) => (
            <div key={scenario.requestId} className={styles.scenarioItem}>
              <div className={styles.scenarioItemTitle}>
                {t(`scenarios.${scenario.requestId}.name`)}
              </div>
              <div className={styles.scenarioItemDescription}>
                {t(`scenarios.${scenario.requestId}.description`)}
              </div>
              <div className={styles.scenarioItemButton}>
                <Button type="primary" onClick={() => handleViewScenario(scenario.requestId)}>
                  {t('previousScenarios.viewButton')}
                </Button>
              </div>
            </div>
          ))}
          <div className={styles.bottomSpacer}></div>
        </div>
      </div>

      <div className={styles.bottomControls}>
        <Space direction="vertical" className={styles.fullWidth}>
          <Space.Compact className={styles.fullWidth}>
            <Input
              placeholder={t('input.placeholder')}
              style={{ flex: 1 }}
              value={requestId || ''}
              onChange={(e) => setRequestId(e.target.value)}
              onPressEnter={() => {
                if (requestId && requestId.trim() !== '') {
                  handleViewPreviousScenario()
                }
              }}
            />
            <Button
              type="primary"
              disabled={!requestId || requestId.trim() === ''}
              onClick={handleViewPreviousScenario}
            >
              {t('buttons.viewPrevious')}
            </Button>
          </Space.Compact>
          <Button
            type="link"
            className={styles.linkButton}
            onClick={handleCreateScenario}
          >
            {t('buttons.createNew')}
          </Button>
        </Space>
      </div>
    </div>
  )
}
