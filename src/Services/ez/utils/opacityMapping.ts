const OPACITY_LOW = 0.05;
const OPACITY_MEDIUM = 0.10;

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
      return Math.round(255 * OPACITY_LOW);
    case 'medium':
      return Math.round(255 * OPACITY_MEDIUM);
    case 'normal':
      return 80;
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
      return Math.round(255 * OPACITY_LOW);
    case 'medium':
      return Math.round(255 * OPACITY_MEDIUM);
    case 'normal':
      return normalOpacity;
  }
};
