import { useEffect, useState } from 'react';
import { Typography, Button, message } from 'antd';
import { QuestionCircleOutlined, SyncOutlined, CloseOutlined } from '@ant-design/icons';
import { useEZServiceStore } from '~store';
import { checkBackendHealth, getBackendUrl } from '~ez/api';
import { handleExit } from '~ez/exitHandler';
import styles from './header.module.less';

const { Title } = Typography;

export default function EzHeader() {
  const [messageApi, contextHolder] = message.useMessage();
  const [retrying, setRetrying] = useState(false);

  const ezState = useEZServiceStore((state) => state.state);
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive);

  const handleExitClick = () => {
    console.log('[EZ Header] Exit button clicked');
    handleExit();
  };

  const [stepTitle, setStepTitle] = useState('Welcome');

  useEffect(() => {
    switch (ezState) {
      case 'WELCOME':
        setStepTitle('Welcome');
        break;
      case 'PARAMETER_SELECTION':
        setStepTitle('Parameter Selection');
        break;
      case 'DRAW_EM_ZONE':
        setStepTitle('Draw Emission Zone');
        break;
      case 'EDIT_EM_ZONE':
        setStepTitle('Edit Emission Zone');
        break;
      case 'REDRAW_EM_ZONE':
        setStepTitle('Redraw Emission Zone');
        break;
      case 'DRAW_SIM_AREA':
        setStepTitle('Draw Simulation Area');
        break;
      case 'EDIT_SIM_AREA':
        setStepTitle('Edit Simulation Area');
        break;
      case 'AWAIT_RESULTS':
        setStepTitle('Processing');
        break;
      case 'RESULT_VIEW':
        setStepTitle('View Results');
        break;
      default:
        break;
    }
  }, [ezState]);

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
        messageApi.success('Connected to live backend');
      } else {
        messageApi.error('Failed to connect to backend');
      }
    } catch (error) {
      setRetrying(false);
      const errorMessage = error instanceof Error ? error.message : 'Backend configuration error';
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
              <span>DEMO MODE</span>
            </div>
            <Button
              type="text"
              size="small"
              icon={<SyncOutlined spin={retrying} />}
              onClick={handleRetryConnection}
              loading={retrying}
              title="Retry connection to live backend"
              className={styles.retryButton}
            />
          </div>
        )}
      </div>
      <div className={styles.stepTitleContainer}>
        <span className={styles.stepTitle}>{stepTitle}</span>
      </div>
      <Button title="Help" className={styles.headerButton}>
        Help
        <QuestionCircleOutlined className={styles.buttonIcon} />
      </Button>
      <Button
        title="Exit"
        className={styles.headerButton}
        onClick={handleExitClick}
      >
        Exit
        <CloseOutlined className={styles.buttonIcon} />
      </Button>
    </div>
  );
}
