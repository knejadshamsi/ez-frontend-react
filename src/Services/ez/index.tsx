import { Drawer } from 'antd';

import { useServiceStore } from '~globalStores';
import { useEZServiceStore } from '~store';

import { WelcomeView } from '~components/WelcomeView';

import styles from '~styles/index.module.less';

const EzService = () => {

  //===> Stores <===
  const activeService = useServiceStore((state) => state.activeService);
  const ezState = useEZServiceStore((state) => state.state);

  return (
    <Drawer
      open={activeService === 'EZ' && !['EMISSION_ZONE_SELECTION', 'SIMULATION_AREA_SELECTION', 'WAITING_FOR_RESULT'].includes(ezState)}
      mask={false}
      width={730}
      placement="right"
      getContainer={false}
      closable={false}
      classNames={{
        wrapper: styles.drawerWrapper,
        content: `${styles.drawerContent} ${ezState === 'RESULT_VIEW' ? styles.outputGradient : ''}`,
        body: styles.drawerBody
      }}
    >
      {{
        WELCOME: <WelcomeView />,
      }[ezState]}
    </Drawer>
  );
};

export { EzService };
