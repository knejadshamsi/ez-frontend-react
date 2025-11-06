import { RefObject } from 'react';

export type VehicleTypeId = 'ev' | 'veh' | 'h_veh';

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
  id: number;
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
  onUpdate: (vehicleId: number, blockId: number, updates: Partial<TimeBlock>) => void;
  onDelete: (vehicleId: number, blockId: number) => void;
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
  selectedVehicleId: number | null;
  selectedBlockId: number | null;
  onVehicleClick: (vehicleId: number) => void;
  onGridDoubleClick: (event: React.MouseEvent, vehicleId: number) => void;
  onBlockMouseDown: (event: React.MouseEvent, vehicleId: number, blockId: number, dragType: 'move' | 'resize', edge?: 'start' | 'end') => void;
  onBlockDoubleClick: (vehicleId: number, block: TimeBlock, rowIndex: number, event: React.MouseEvent) => void;
}

export interface RestrictionBlockProps {
  block: TimeBlock;
  vehicleId: number;
  rowIndex: number;
  timeColumnWidth: number;
  isSelected: boolean;
  onMouseDown: (event: React.MouseEvent, vehicleId: number, blockId: number, dragType: 'move' | 'resize', edge?: 'start' | 'end') => void;
  onClick: (vehicleId: number, block: TimeBlock, rowIndex: number, event: React.MouseEvent) => void;
}

export interface UseSchedulerStateParams {
  zoneId: string;
}

export interface UseSchedulerStateReturn {
  vehicles: Vehicle[];
  updateBlock: (vehicleId: number, blockId: number, updates: any) => void;
  deleteBlock: (vehicleId: number, blockId: number) => void;
  addBlock: (vehicleId: number, newBlock: any) => void;
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
  vehicleId: number;
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
  ev: { label: 'Electric Vehicles', color: '#34d399' },
  veh: { label: 'Vehicles', color: '#fbbf24' },
  h_veh: { label: 'Heavy Vehicles', color: '#ef4444' },
};
