import { RefObject } from 'react';
import { VehicleTypeId, VEHICLE_TYPE_COLORS } from '~ez/stores/types';

export type { VehicleTypeId };

export interface VehicleTypeInfo {
  label: string;
  color: string;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface TimeBlock extends TimeRange {
  id: number;
  type: 'banned' | 'restricted';
  penalty?: number;
  interval?: number;
}

export interface Vehicle {
  type: VehicleTypeId;
  blocks: TimeBlock[];
}

export interface ActiveBlock {
  vehicle: Vehicle;
  block: TimeBlock;
  rowIndex: number;
}

export interface PolicySectionProps {
  zoneId: string;
}

export interface BlockEditorProps {
  activeBlock: ActiveBlock | null;
  onUpdate: (vehicleType: VehicleTypeId, blockId: number, updates: Partial<TimeBlock>) => void;
  onDelete: (vehicleType: VehicleTypeId, blockId: number) => void;
  onClose: () => void;
}

export interface TimeHeaderProps {
  containerWidth: number;
  timeColumnWidth: number;
  zoneColor: string;
}

export interface VehicleRowProps {
  vehicle: Vehicle;
  rowIndex: number;
  containerWidth: number;
  timeColumnWidth: number;
  zoneColor: string;
  selectedVehicleType: VehicleTypeId | null;
  selectedBlockId: number | null;
  onVehicleClick: (vehicleType: VehicleTypeId) => void;
  onGridDoubleClick: (event: React.MouseEvent, vehicleType: VehicleTypeId) => void;
  onBlockMouseDown: (event: React.MouseEvent, vehicleType: VehicleTypeId, blockId: number, dragType: 'move' | 'resize', edge?: 'start' | 'end') => void;
  onBlockDoubleClick: (vehicleType: VehicleTypeId, block: TimeBlock, rowIndex: number, event: React.MouseEvent) => void;
}

export interface RestrictionBlockProps {
  block: TimeBlock;
  vehicleType: VehicleTypeId;
  rowIndex: number;
  timeColumnWidth: number;
  isSelected: boolean;
  onMouseDown: (event: React.MouseEvent, vehicleType: VehicleTypeId, blockId: number, dragType: 'move' | 'resize', edge?: 'start' | 'end') => void;
  onClick: (vehicleType: VehicleTypeId, block: TimeBlock, rowIndex: number, event: React.MouseEvent) => void;
}

export interface UseSchedulerStateParams {
  zoneId: string;
}

export interface UseSchedulerStateReturn {
  vehicles: Vehicle[];
  updateBlock: (vehicleType: VehicleTypeId, blockId: number, updates: any) => void;
  deleteBlock: (vehicleType: VehicleTypeId, blockId: number) => void;
  addBlock: (vehicleType: VehicleTypeId, newBlock: any) => void;
  syncVehiclesToPolicy: (updatedVehicles: Vehicle[]) => void;
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
}

export interface UseBlockInteractionsParams {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  syncVehiclesToPolicy: (vehicles: Vehicle[]) => void;
  timeColumnWidth: number;
  svgRef: React.RefObject<SVGSVGElement>;
  vehicleColumnWidth: number;
  headerHeight: number;
  rowHeight: number;
}

export interface DragData {
  type: 'move' | 'resize';
  vehicleType: VehicleTypeId;
  blockId: number;
  initialX: number;
  initialStart?: number;
  initialEnd?: number;
  width?: number;
  edge?: 'start' | 'end';
  initialValue?: number;
}

export interface UseContainerResizeParams {
  containerRef: RefObject<HTMLDivElement>;
  totalHeight: number;
  vehicleCount: number;
  zoneId: string;
}

export interface ContainerSize {
  width: number;
  height: number;
}

export const VEHICLE_TYPES: Record<VehicleTypeId, VehicleTypeInfo> = {
  zeroEmission: { label: 'Zero Em.', color: VEHICLE_TYPE_COLORS.zeroEmission },
  nearZeroEmission: { label: 'Near-Zero Em.', color: VEHICLE_TYPE_COLORS.nearZeroEmission },
  lowEmission: { label: 'Low Em.', color: VEHICLE_TYPE_COLORS.lowEmission },
  midEmission: { label: 'Mid Em.', color: VEHICLE_TYPE_COLORS.midEmission },
  highEmission: { label: 'High Em.', color: VEHICLE_TYPE_COLORS.highEmission }
};

// Helper function to get localized vehicle type label
export const getVehicleTypeLabel = (vehicleType: VehicleTypeId, t: (key: string) => string): string => {
  const labelKeys: Record<VehicleTypeId, string> = {
    zeroEmission: 'vehicleRestrictions.vehicleTypes.zeroEmission',
    nearZeroEmission: 'vehicleRestrictions.vehicleTypes.nearZeroEmission',
    lowEmission: 'vehicleRestrictions.vehicleTypes.lowEmission',
    midEmission: 'vehicleRestrictions.vehicleTypes.midEmission',
    highEmission: 'vehicleRestrictions.vehicleTypes.highEmission',
  };
  return t(labelKeys[vehicleType]);
};
