import { useState, useEffect, useCallback } from 'react';
import { checkOverlap } from '../vehicleUtils';
import { TimeBlock, TimeRange, ActiveBlock, DragData, UseBlockInteractionsParams } from '../types';
import { TIME_COLUMNS, DEFAULT_BLOCK_SPAN, DEFAULT_PENALTY, DEFAULT_INTERVAL } from '../constants';

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
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [showBlockEditor, setShowBlockEditor] = useState(false);
  const [blockEditorPosition, setBlockEditorPosition] = useState({ x: 0, y: 0 });
  const [activeBlock, setActiveBlock] = useState<ActiveBlock | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState<DragData | null>(null);

  // DOUBLE CLICK
  const handleBlockDoubleClick = useCallback((vehicleId: number, block: TimeBlock, rowIndex: number, event: React.MouseEvent) => {
    event.preventDefault();

    setSelectedVehicleId(vehicleId);
    setSelectedBlockId(block.id);

    const vehicle = vehicles.find(v => v.id === vehicleId);
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

  const handleGridDoubleClick = useCallback((event: React.MouseEvent, vehicleId: number) => {
    if (!svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - svgRect.left;

    if (x <= vehicleColumnWidth) return;

    const columnIndex = Math.floor((x - vehicleColumnWidth) / timeColumnWidth);
    if (columnIndex < 0 || columnIndex >= TIME_COLUMNS) return;

    setSelectedVehicleId(vehicleId);

    const vehicle = vehicles.find(v => v.id === vehicleId);
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
      v.id === vehicleId
        ? { ...v, blocks: [...v.blocks, newBlock] }
        : v
    );

    setVehicles(updatedVehicles);
    syncVehiclesToPolicy(updatedVehicles);
  }, [vehicles, setVehicles, syncVehiclesToPolicy, svgRef, timeColumnWidth, vehicleColumnWidth]);

  // MOUSE DOWN (start drag/resize)
  const handleBlockMouseDown = useCallback((
    event: React.MouseEvent,
    vehicleId: number,
    blockId: number,
    dragType: 'move' | 'resize',
    edge?: 'start' | 'end'
  ) => {
    event.stopPropagation();
    event.preventDefault();

    setSelectedVehicleId(vehicleId);
    setSelectedBlockId(blockId);

    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const block = vehicle.blocks.find(b => b.id === blockId);
    if (!block) return;

    const initialX = event.clientX;

    setIsDragging(true);

    if (dragType === 'move') {
      setDragData({
        type: 'move',
        vehicleId,
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
        vehicleId,
        blockId,
        initialX,
        initialValue: edge === 'start' ? block.start : block.end
      });
    }
  }, [vehicles]);

  // MOUSE MOVE (during drag/resize)
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !dragData) return;

    const columnDelta = Math.round((event.clientX - dragData.initialX) / timeColumnWidth);

    const vehicle = vehicles.find(v => v.id === dragData.vehicleId);
    if (!vehicle?.blocks) return;

    let newStart: number, newEnd: number;
    if (dragData.type === 'move') {
      newStart = dragData.initialStart! + columnDelta;
      newEnd = dragData.initialEnd! + columnDelta;

      if (newStart < 0) {
        newStart = 0;
        newEnd = dragData.width!;
      }
      if (newEnd > TIME_COLUMNS) {
        newEnd = TIME_COLUMNS;
        newStart = TIME_COLUMNS - dragData.width!;
      }
    } else {
      const block = vehicle.blocks.find(b => b.id === dragData.blockId);
      if (!block) return;

      newStart = block.start;
      newEnd = block.end;
      if (dragData.edge === 'start') {
        newStart = Math.max(0, Math.min(block.end - 1, dragData.initialValue! + columnDelta));
      } else {
        newEnd = Math.max(block.start + 1, Math.min(TIME_COLUMNS, dragData.initialValue! + columnDelta));
      }
    }

    const hasOverlap = vehicle.blocks.some(otherBlock =>
      otherBlock.id !== dragData.blockId && checkOverlap({ start: newStart, end: newEnd }, otherBlock)
    );

    if (!hasOverlap) {
      setVehicles(vehicles.map(v => {
        if (v.id !== dragData.vehicleId) return v;
        return {
          ...v,
          blocks: v.blocks.map(b => {
            if (b.id !== dragData.blockId) return b;
            return { ...b, start: newStart, end: newEnd };
          })
        };
      }));
    }
  }, [isDragging, dragData, vehicles, timeColumnWidth, setVehicles]);

  // MOUSE UP (to end dragging)
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragData(null);
      syncVehiclesToPolicy(vehicles);
    }
  }, [isDragging, vehicles, syncVehiclesToPolicy]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const updateActiveBlock = useCallback((vehicleId: number, blockId: number) => {
    if (activeBlock && activeBlock.vehicle.id === vehicleId && activeBlock.block.id === blockId) {
      const updatedVehicle = vehicles.find(v => v.id === vehicleId);
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
    selectedVehicleId,
    setSelectedVehicleId,
    selectedBlockId,
    setSelectedBlockId,
    showBlockEditor,
    setShowBlockEditor,
    blockEditorPosition,
    activeBlock,
    setActiveBlock,
    isDragging,
    handleBlockDoubleClick,
    handleGridDoubleClick,
    handleBlockMouseDown,
    updateActiveBlock
  };
};
