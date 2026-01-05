import { useState, useEffect, useCallback, useRef } from 'react';
import { checkOverlap } from '../vehicleUtils';
import { TimeBlock, TimeRange, ActiveBlock, DragData, UseBlockInteractionsParams, Vehicle } from '../types';
import { VehicleTypeId } from '~ez/stores/types';
import { TIME_COLUMNS, DEFAULT_BLOCK_SPAN, DEFAULT_PENALTY, DEFAULT_INTERVAL } from '../constants';

// Drag position calculation helpers
const calculateMovePosition = (
  dragData: DragData,
  columnDelta: number,
  timeColumns: number
): { start: number; end: number } => {
  let newStart = dragData.initialStart! + columnDelta;
  let newEnd = dragData.initialEnd! + columnDelta;

  if (newStart < 0) {
    newStart = 0;
    newEnd = dragData.width!;
  }

  if (newEnd > timeColumns) {
    newEnd = timeColumns;
    newStart = timeColumns - dragData.width!;
  }

  return { start: newStart, end: newEnd };
};

const calculateResizePosition = (
  block: TimeBlock,
  dragData: DragData,
  columnDelta: number,
  timeColumns: number
): { start: number; end: number } => {
  let newStart = block.start;
  let newEnd = block.end;

  if (dragData.edge === 'start') {
    newStart = Math.max(0, Math.min(block.end - 1, dragData.initialValue! + columnDelta));
  } else {
    newEnd = Math.max(block.start + 1, Math.min(timeColumns, dragData.initialValue! + columnDelta));
  }

  return { start: newStart, end: newEnd };
};

export const useBlockInteractions = ({
  vehicles,
  setVehicles,
  syncVehiclesToPolicy,
  timeColumnWidth,
  svgRef,
  vehicleColumnWidth,
  headerHeight,
  rowHeight
}: UseBlockInteractionsParams) => {
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleTypeId | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [showBlockEditor, setShowBlockEditor] = useState(false);
  const [blockEditorPosition, setBlockEditorPosition] = useState({ x: 0, y: 0 });
  const [activeBlock, setActiveBlock] = useState<ActiveBlock | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState<DragData | null>(null);
  const [overlapBlocked, setOverlapBlocked] = useState(false);

  // Refs for stable callbacks
  const syncPolicyRef = useRef(syncVehiclesToPolicy);
  const animationFrameRef = useRef<number | null>(null);
  const lastColumnDeltaRef = useRef<number | null>(null);

  useEffect(() => {
    syncPolicyRef.current = syncVehiclesToPolicy;
  }, [syncVehiclesToPolicy]);

  // DOUBLE CLICK
  const handleBlockDoubleClick = useCallback((vehicleType: VehicleTypeId, block: TimeBlock, rowIndex: number, event: React.MouseEvent) => {
    event.preventDefault();

    setSelectedVehicleType(vehicleType);
    setSelectedBlockId(block.id);

    const vehicle = vehicles.find(v => v.type === vehicleType);
    if (!vehicle) return;

    setActiveBlock({ vehicle, block, rowIndex });

    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const blockCenterX = svgRect.left + vehicleColumnWidth + ((block.start + block.end) * timeColumnWidth / 2);
      const blockBottomY = svgRect.top + headerHeight + ((rowIndex + 1) * rowHeight);

      setBlockEditorPosition({ x: blockCenterX, y: blockBottomY });
    }

    setShowBlockEditor(true);
  }, [vehicles, svgRef, timeColumnWidth, vehicleColumnWidth, headerHeight, rowHeight]);

  const handleGridDoubleClick = useCallback((event: React.MouseEvent, vehicleType: VehicleTypeId) => {
    if (!svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - svgRect.left;

    if (x <= vehicleColumnWidth) return;

    const columnIndex = Math.floor((x - vehicleColumnWidth) / timeColumnWidth);
    if (columnIndex < 0 || columnIndex >= TIME_COLUMNS) return;

    setSelectedVehicleType(vehicleType);

    const vehicle = vehicles.find(v => v.type === vehicleType);
    if (!vehicle) return;

    const start = columnIndex;
    const end = Math.min(columnIndex + DEFAULT_BLOCK_SPAN, TIME_COLUMNS);

    const hasOverlap = vehicle.blocks.some(block =>
      checkOverlap({ start, end } as TimeRange, block)
    );

    if (hasOverlap) return;

    const newBlockId = Math.max(...vehicle.blocks.map(b => b.id || 0), 0) + 1;

    const newBlock: TimeBlock = {
      id: newBlockId,
      start,
      end,
      type: 'restricted',
      penalty: DEFAULT_PENALTY,
      interval: DEFAULT_INTERVAL
    };

    const updatedVehicles = vehicles.map(v =>
      v.type === vehicleType
        ? { ...v, blocks: [...v.blocks, newBlock] }
        : v
    );

    setVehicles(updatedVehicles);
    syncVehiclesToPolicy(updatedVehicles);
  }, [vehicles, setVehicles, syncVehiclesToPolicy, svgRef, timeColumnWidth, vehicleColumnWidth]);

  // MOUSE DOWN (start drag/resize)
  const handleBlockMouseDown = useCallback((
    event: React.MouseEvent,
    vehicleType: VehicleTypeId,
    blockId: number,
    dragType: 'move' | 'resize',
    edge?: 'start' | 'end'
  ) => {
    event.stopPropagation();
    event.preventDefault();

    setSelectedVehicleType(vehicleType);
    setSelectedBlockId(blockId);

    const vehicle = vehicles.find(v => v.type === vehicleType);
    if (!vehicle) return;

    const block = vehicle.blocks.find(b => b.id === blockId);
    if (!block) return;

    const initialX = event.clientX;

    setIsDragging(true);

    if (dragType === 'move') {
      setDragData({
        type: 'move',
        vehicleType,
        blockId,
        initialX,
        initialStart: block.start,
        initialEnd: block.end,
        width: block.end - block.start
      });
    } else if (dragType === 'resize' && edge) {
      setDragData({
        type: 'resize',
        edge,
        vehicleType,
        blockId,
        initialX,
        initialValue: edge === 'start' ? block.start : block.end
      });
    }
  }, [vehicles]);

  // MOUSE MOVE (during drag/resize)
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !dragData) return;

    // Cancel any pending animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Throttle with requestAnimationFrame
    animationFrameRef.current = requestAnimationFrame(() => {
      const columnDelta = Math.round((event.clientX - dragData.initialX) / timeColumnWidth);

      // Skip if column hasn't changed
      if (lastColumnDeltaRef.current === columnDelta) return;
      lastColumnDeltaRef.current = columnDelta;

      setVehicles(prevVehicles => {
        const vehicle = prevVehicles.find(v => v.type === dragData.vehicleType);
        if (!vehicle?.blocks) return prevVehicles;

        // Calculate new position using helper functions
        let newStart: number, newEnd: number;
        if (dragData.type === 'move') {
          const position = calculateMovePosition(dragData, columnDelta, TIME_COLUMNS);
          newStart = position.start;
          newEnd = position.end;
        } else {
          const block = vehicle.blocks.find(b => b.id === dragData.blockId);
          if (!block) return prevVehicles;

          const position = calculateResizePosition(block, dragData, columnDelta, TIME_COLUMNS);
          newStart = position.start;
          newEnd = position.end;
        }

        // Check for overlap
        const hasOverlap = vehicle.blocks.some(otherBlock =>
          otherBlock.id !== dragData.blockId && checkOverlap({ start: newStart, end: newEnd }, otherBlock)
        );

        if (hasOverlap) {
          setOverlapBlocked(true);
          return prevVehicles;
        }

        setOverlapBlocked(false);
        return prevVehicles.map(v => {
          if (v.type !== dragData.vehicleType) return v;
          return {
            ...v,
            blocks: v.blocks.map(b => {
              if (b.id !== dragData.blockId) return b;
              return { ...b, start: newStart, end: newEnd };
            })
          };
        });
      });
    });
  }, [isDragging, dragData, timeColumnWidth, setVehicles]);

  // MOUSE UP (to end dragging)
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      // Cancel any pending animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      setIsDragging(false);
      setDragData(null);
      setOverlapBlocked(false);
      lastColumnDeltaRef.current = null;

      // Use ref to avoid dependency
      setVehicles(prevVehicles => {
        syncPolicyRef.current(prevVehicles);
        return prevVehicles;
      });
    }
  }, [isDragging, setVehicles]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // Clean up animation frame on unmount
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const updateActiveBlock = useCallback((vehicleType: VehicleTypeId, blockId: number) => {
    if (activeBlock && activeBlock.vehicle.type === vehicleType && activeBlock.block.id === blockId) {
      const updatedVehicle = vehicles.find(v => v.type === vehicleType);
      const updatedBlock = updatedVehicle?.blocks.find(b => b.id === blockId);

      if (updatedVehicle && updatedBlock) {
        setActiveBlock({
          ...activeBlock,
          vehicle: updatedVehicle,
          block: updatedBlock
        });
      }
    }
  }, [activeBlock, vehicles]);

  return {
    selectedVehicleType,
    setSelectedVehicleType,
    selectedBlockId,
    setSelectedBlockId,
    showBlockEditor,
    setShowBlockEditor,
    blockEditorPosition,
    activeBlock,
    setActiveBlock,
    isDragging,
    overlapBlocked,
    handleBlockDoubleClick,
    handleGridDoubleClick,
    handleBlockMouseDown,
    updateActiveBlock
  };
};
