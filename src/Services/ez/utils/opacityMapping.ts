export const OPACITY_STATES = {
  HIDDEN: 'hidden',
  LOW: 'low',
  MEDIUM: 'medium',
  NORMAL: 'normal',
} as const;

export type OpacityState = typeof OPACITY_STATES[keyof typeof OPACITY_STATES];

export const mapZoneOpacityToAlpha = (
  opacityState: OpacityState
): number | null => {
  switch (opacityState) {
    case 'hidden':
      return null;
    case 'low':
      return Math.round(255 * 0.05);
    case 'medium':
      return Math.round(255 * 0.10);
    case 'normal':
      return 80;
    default:
      return null;
  }
};

export const mapSimulationAreaOpacityToAlpha = (
  opacityState: OpacityState,
  normalOpacity: number = 51
): number | null => {
  switch (opacityState) {
    case 'hidden':
      return null;
    case 'low':
      return Math.round(255 * 0.05);
    case 'medium':
      return Math.round(255 * 0.10);
    case 'normal':
      return normalOpacity;
    default:
      return null;
  }
};

export const getOpacityLabel = (opacityState: OpacityState): string => {
  switch (opacityState) {
    case 'hidden':
      return 'Hidden';
    case 'low':
      return '5%';
    case 'medium':
      return '10%';
    case 'normal':
      return 'Normal';
    default:
      return 'Hidden';
  }
};
