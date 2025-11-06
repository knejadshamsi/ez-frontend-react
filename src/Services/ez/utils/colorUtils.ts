export const HIDDEN_COLOR = '#CCCCCC';

export const colorShader = (hex: string, multiplier: number): string | undefined => {
  if (!hex) return;

  hex = hex.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  let newR: number, newG: number, newB: number;

  if (multiplier < 1) {
    newR = Math.round(r * multiplier);
    newG = Math.round(g * multiplier);
    newB = Math.round(b * multiplier);
  } else if (multiplier > 1) {
    const factor = multiplier - 1;
    newR = Math.round(r + (255 - r) * factor);
    newG = Math.round(g + (255 - g) * factor);
    newB = Math.round(b + (255 - b) * factor);
  } else {
    newR = r;
    newG = g;
    newB = b;
  }

  newR = Math.max(0, Math.min(255, newR));
  newG = Math.max(0, Math.min(255, newG));
  newB = Math.max(0, Math.min(255, newB));

  const toHex = (n: number): string => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return '#' + toHex(newR) + toHex(newG) + toHex(newB);
};

export const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [255, 0, 0];
};
