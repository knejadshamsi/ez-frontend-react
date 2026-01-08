import { Space, Button, Input, Typography, message } from 'antd'
import { useEZSessionStore } from '~stores/session'
import { useEZServiceStore } from '~store'
import { loadScenario } from '~ez/api'
import previousScenarios from './previousScenarios.json'
import styles from './WelcomeView.module.less'

const { Text } = Typography

export const WelcomeView = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const requestId = useEZSessionStore((state) => state.requestId)
  const setRequestId = useEZSessionStore((state) => state.setRequestId)
  const setState = useEZServiceStore((state) => state.setState)

  const handleScenarioLoadError = (errorMessage: string) => {
    messageApi.error(errorMessage || 'Failed to load scenario. Try again');
    setState('WELCOME');
  };

  // CLICK HANDLING

  const handleViewScenario = async (scenarioRequestId: string) => {
    if (!scenarioRequestId || scenarioRequestId.trim() === '') {
      messageApi.error('Invalid scenario ID');
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
      messageApi.error('Please enter a valid scenario ID');
      return;
    }

    await loadScenario(requestId, setState, handleScenarioLoadError);
  }


  return (
    <div className={styles.container}>
      {contextHolder}
      <div className={styles.welcomeText}>
        <br />
        Welcome to <strong>Emission Zone Impact analysis Tool</strong>.<br />
        <br />
        This tool is designed to help you (or any policymaker) view the impact of zero and low-emission zones on urban
        area and traffic flow, air quality, and CO2 emissions in Montreal.
      </div>

      <div className={styles.scenarioListContainer}>
        <Text className={styles.scenarioListTitle}>Previous Scenarios</Text>
        <div className={styles.scenarioList}>
          {previousScenarios.map((scenario) => (
            <div key={scenario.requestId} className={styles.scenarioItem}>
              <div className={styles.scenarioItemTitle}>
                {scenario.name}
              </div>
              <div className={styles.scenarioItemDescription}>
                {scenario.description}
              </div>
              <div className={styles.scenarioItemButton}>
                <Button type="primary" onClick={() => handleViewScenario(scenario.requestId)}>
                  View Scenario
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
              placeholder="Enter request Id"
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
              View Previous Scenario
            </Button>
          </Space.Compact>
          <Button
            type="link"
            className={styles.linkButton}
            onClick={handleCreateScenario}
          >
            Create your own scenario
          </Button>
        </Space>
      </div>
    </div>
  )
}
