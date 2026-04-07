import { useEffect } from 'react';
import { Drawer, message, Modal, notification } from 'antd';

import { useServiceStore } from '~globalStores';
import { useEZServiceStore } from '~store';
import { isProcessState } from './stores/types';
import { useBackendAliveWatcher } from './useRetry';
import { useHealthCheckPolling } from './useHealthCheckPolling';

import { WelcomeView } from './welcome';
import { ParameterSelectionView } from './input/ParameterSelectionView';
import { OutputView } from './output';
import { Progress } from './progress';
import { DrawingControls } from './input/drawingControls';
import styles from './index.module.less';

const EzService = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [notificationApi, notificationContextHolder] = notification.useNotification();

  const activeService = useServiceStore((state) => state.activeService);
  const ezState = useEZServiceStore((state) => state.state);

  useBackendAliveWatcher(messageApi, modal, notificationApi);
  useHealthCheckPolling();

  // Prevent accidental page reload during active simulation
  useEffect(() => {
    if (!isProcessState(ezState)) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [ezState]);

  return (
    <>
      {contextHolder}
      {modalContextHolder}
      {notificationContextHolder}
      <Drawer
        open={activeService === 'EZ' && !['DRAW_EMISSION_ZONE', 'EDIT_EMISSION_ZONE', 'REDRAW_EMISSION_ZONE', 'DRAW_SIMULATION_AREA', 'EDIT_SIMULATION_AREA'].includes(ezState) && !isProcessState(ezState)}
        mask={false}
        width={730}
        placement="right"
        getContainer={false}
        closable={false}
        classNames={{
          wrapper: styles.drawerWrapper,
          content: ezState === 'VIEW_RESULTS' ? styles.drawerContentWithGradient : styles.drawerContent,
          body: styles.drawerBody
        }}
      >
        {{
          WELCOME: <WelcomeView messageApi={messageApi} notificationApi={notificationApi} modal={modal} />,
          SELECT_PARAMETERS: <ParameterSelectionView />,
          VIEW_PARAMETERS: <ParameterSelectionView />,
          VIEW_RESULTS: <OutputView />,
        }[ezState]}
      </Drawer>
      {isProcessState(ezState) && <Progress />}
      <DrawingControls />
    </>
  );
};

export { EzService };
