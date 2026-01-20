import { type ReactElement } from 'react';
import { Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { type OpacityState } from '~utils/opacityMapping';
import './locales';

interface InputLayerToggleButtonProps {
  layerType: 'zone' | 'area';
  opacityState: OpacityState;
  onCycle: () => void;
  className?: string;
  disabled?: boolean;
}

export const InputLayerToggleButton = ({
  layerType,
  opacityState,
  onCycle,
  className,
  disabled = false,
}: InputLayerToggleButtonProps): ReactElement => {
  const { t } = useTranslation('ez-output');

  const getOpacityLabel = (state: OpacityState): string => {
    switch (state) {
      case 'hidden':
        return t('layerToggle.opacityHidden');
      case 'low':
        return '5%';
      case 'medium':
        return '10%';
      case 'normal':
        return t('layerToggle.opacityNormal');
      default:
        return t('layerToggle.opacityHidden');
    }
  };

  const getButtonText = () => {
    const label = layerType === 'zone' ? t('layerToggle.zones') : t('layerToggle.areas');
    const opacityLabel = getOpacityLabel(opacityState);
    return `${label}: ${opacityLabel}`;
  };

  const getTooltipText = () => {
    return layerType === 'zone' ? t('layerToggle.tooltipZone') : t('layerToggle.tooltipArea');
  };

  return (
    <Tooltip title={getTooltipText()}>
      <Button
        type="default"
        size="small"
        ghost={true}
        onClick={onCycle}
        disabled={disabled}
        className={className}
        aria-label={getTooltipText()}
      >
        {getButtonText()}
      </Button>
    </Tooltip>
  );
};
