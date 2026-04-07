import { useState, type ReactElement } from 'react';
import { Button, Tooltip } from 'antd';
import { PushpinOutlined, PushpinFilled, LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useEZSessionStore } from '~stores/session';
import { useEZServiceStore } from '~store';
import { toggleScenarioPin } from '~ez/api';
import type { MessageInstance } from 'antd/es/message/interface';
import outputStyles from './Output.module.less';
import './locales';

interface PinScenarioButtonProps {
  requestId: string;
  messageApi: MessageInstance;
}

export const PinScenarioButton = ({
  requestId,
  messageApi,
}: PinScenarioButtonProps): ReactElement | null => {
  const { t } = useTranslation('ez-output');
  const [loading, setLoading] = useState(false);

  const pinned = useEZSessionStore((s) => s.pinned);
  const sessionIntent = useEZServiceStore((s) => s.sessionIntent);
  const connectionState = useEZServiceStore((s) => s.connectionState);

  const isAvailable = sessionIntent === 'RUN_NEW_SIMULATION'
    || sessionIntent === 'LOAD_PREVIOUS_SCENARIO';

  if (!isAvailable) return null;

  const isEnabled = connectionState === 'FULL_CONNECT' && !loading;

  const handleToggle = async () => {
    if (!isEnabled || !requestId) return;
    setLoading(true);
    try {
      const result = await toggleScenarioPin(requestId);
      useEZSessionStore.getState().setPinned(result);
    } catch {
      messageApi.error(t('pin.pinFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getTooltip = () => {
    if (!isEnabled) return t('pin.tooltipDisabled');
    return pinned ? t('pin.tooltipUnpin') : t('pin.tooltipPin');
  };

  const getIcon = () => {
    if (loading) return <LoadingOutlined spin />;
    return pinned ? <PushpinFilled /> : <PushpinOutlined />;
  };

  return (
    <Tooltip title={getTooltip()}>
      <Button
        type="default"
        size="small"
        ghost={true}
        icon={getIcon()}
        onClick={handleToggle}
        disabled={!isEnabled}
        className={pinned ? outputStyles.pinButtonActive : outputStyles.pinButton}
      />
    </Tooltip>
  );
};
