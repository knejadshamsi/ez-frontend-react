import { Drawer, message } from 'antd';

import { useServiceStore } from '~globalStores';
import { useEZServiceStore } from '~store';
import { useBackendAliveWatcher } from './useRetry';

import { WelcomeView } from './welcome';
import { ParameterSelectionView } from './input/ParameterSelectionView';
import { OutputView } from './output';
import { Progress } from './progress';
import { DrawingControls } from './input/drawingControls';
import ExitModal from './components/ExitModal';

import styles from './index.module.less';

const EzService = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const activeService = useServiceStore((state) => state.activeService);
  const ezState = useEZServiceStore((state) => state.state);

  useBackendAliveWatcher(messageApi);

  return (
    <>
      {contextHolder}
      <Drawer
        open={activeService === 'EZ' && !['DRAW_EM_ZONE', 'EDIT_EM_ZONE', 'REDRAW_EM_ZONE', 'DRAW_SIM_AREA', 'EDIT_SIM_AREA', 'AWAIT_RESULTS'].includes(ezState)}
        mask={false}
        width={730}
        placement="right"
        getContainer={false}
        closable={false}
        classNames={{
          wrapper: styles.drawerWrapper,
          content: ezState === 'RESULT_VIEW' ? styles.drawerContentWithGradient : styles.drawerContent,
          body: styles.drawerBody
        }}
      >
        {{
          WELCOME: <WelcomeView />,
          PARAMETER_SELECTION: <ParameterSelectionView />,
          RESULT_VIEW: <OutputView />,
        }[ezState]}
      </Drawer>
      <Progress />
      <DrawingControls />
      <ExitModal />
    </>
  );
};

export { EzService };
