import { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useEZSessionStore } from '~stores/session';
import { confirmExit, cancelExit } from '../exitHandler';
import { resetAllEZStores } from '~stores/reset';
import { useServiceStore } from '~globalStores';

export default function ExitModal() {
  const [modal, modalContextHolder] = Modal.useModal();
  const setActiveService = useServiceStore((state) => state.setActiveService);
  const isResettingRef = useRef(false);

  const exitState = useEZSessionStore((state) => state.exitState);
  const exitWarning = useEZSessionStore((state) => state.exitWarning);

  useEffect(() => {
    if (exitState === 'await_confirmation' && exitWarning) {
      modal.confirm({
        title: exitWarning.title,
        icon: <ExclamationCircleOutlined />,
        content: exitWarning.message,
        okText: 'Exit Anyway',
        okType: 'danger',
        cancelText: 'Stay in EZ',
        closable: false,
        maskClosable: false,
        keyboard: false,
        onCancel: () => {
          cancelExit();
        },
        onOk: () => {
          confirmExit();
        },
      });
    } else if (exitState === 'resetting' && !isResettingRef.current) {
      isResettingRef.current = true;

      resetAllEZStores();

      const sessionStore = useEZSessionStore.getState();
      sessionStore.setExitState('idle');
      sessionStore.setExitWarning(null);

      setActiveService('REST');

      isResettingRef.current = false;
    }
  }, [exitState, exitWarning, modal, setActiveService]);

  return <>{modalContextHolder}</>;
}
