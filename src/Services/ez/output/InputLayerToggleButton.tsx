import { type ReactElement } from 'react';
import { Button, Tooltip } from 'antd';
import { getOpacityLabel, type OpacityState } from '~utils/opacityMapping';

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

  const getButtonText = () => {
    const label = layerType === 'zone' ? 'Zones' : 'Areas';
    const opacityLabel = getOpacityLabel(opacityState);
    return `${label}: ${opacityLabel}`;
  };

  const getTooltipText = () => {
    return `Cycle ${layerType} layer opacity`;
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
        aria-label={`Cycle ${layerType} layer opacity`}
      >
        {getButtonText()}
      </Button>
    </Tooltip>
  );
};
