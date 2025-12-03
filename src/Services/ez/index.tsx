import { Drawer } from 'antd';

import { useServiceStore } from '~globalStores';
import { useEZServiceStore } from '~store';

import { WelcomeView } from '~components/WelcomeView';
import { ParameterSelectionView } from './input/ParameterSelectionView';
import { OutputView } from './output';
import { Progress } from './progress';

import styles from '~styles/index.module.less';

const EzService = () => {

  const activeService = useServiceStore((state) => state.activeService);
  const ezState = useEZServiceStore((state) => state.state);

  return (
    <>
      <Drawer
        open={activeService === 'EZ' && !['EMISSION_ZONE_SELECTION', 'SIMULATION_AREA_SELECTION', 'WAITING_FOR_RESULT'].includes(ezState)}
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
    </>
  );
};

export { EzService };
