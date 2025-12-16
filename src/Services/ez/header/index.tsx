import { useEffect, useState } from 'react';
import { Typography, Button, Badge } from 'antd';
import { QuestionCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import { useServiceStore } from '~globalStores';
import { useEZSessionStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { resetAllEZOutputStores } from '~stores/output';
import styles from './header.module.less';

const { Title } = Typography;

export default function EzHeader() {
  const ezState = useEZServiceStore((state) => state.state);
  const setState = useEZServiceStore((state) => state.setState);
  const isEzBackendAlive = useEZServiceStore((state) => state.isEzBackendAlive);
  const resetService = useServiceStore((state) => state.resetService);

  const setScenarioTitle = useEZSessionStore((state) => state.setScenarioTitle);
  const setRequestId = useEZSessionStore((state) => state.setRequestId);

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

  const exitHandler = () => {
    setState('WELCOME');
    setScenarioTitle('New Scenario');
    setRequestId('');
    resetAllEZOutputStores();
    resetService();
  };

  return (
    <>
      <div className={styles.titleContainer}>
        <Title level={4} className={styles.title}>
          EZ Service
        </Title>
        {!isEzBackendAlive && (
          <Badge count="DEMO MODE" color="#fadb14" className={styles.demoBadge} />
        )}
      </div>
      <div className={styles.stepTitleContainer}>
        <span className={styles.stepTitle}>{stepTitle}</span>
      </div>
      <Button title="Help" className={styles.headerButton}>
        Help
        <QuestionCircleOutlined className={styles.buttonIcon} />
      </Button>
      <Button title="Exit" className={styles.headerButton} onClick={exitHandler}>
        Exit
        <LogoutOutlined className={styles.buttonIcon} />
      </Button>
    </>
  );
}
