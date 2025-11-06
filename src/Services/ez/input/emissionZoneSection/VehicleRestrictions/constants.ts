// Grid dimensions
export const HEADER_HEIGHT = 35;
export const ROW_HEIGHT = 50;
export const VEHICLE_COLUMN_WIDTH = 120;
export const TIME_COLUMNS = 48; // 30-min intervals for 24h

// Block dimensions
export const BLOCK_HEIGHT_RATIO = 0.7; // Block takes 70% of row height

// Interaction zones
export const RESIZE_ZONE_RATIO = 0.25;  // 25% left/right for resize
export const DRAG_ZONE_RATIO = 0.5;     // 50% center for drag

// Default values
export const DEFAULT_BLOCK_SPAN = 2;    // 1 hour default
export const DEFAULT_PENALTY = 25;
export const DEFAULT_INTERVAL = 1800;   // 30 minutes in seconds

// Display thresholds
export const ICON_ONLY_THRESHOLD = 4;   // Blocks ≤4 columns show icon only
export const FULL_LABEL_THRESHOLD = 160; // Width in pixels for full labels
