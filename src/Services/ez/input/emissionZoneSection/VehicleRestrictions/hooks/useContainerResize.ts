import { useState, useEffect, useCallback } from 'react';
import { UseContainerResizeParams, ContainerSize } from '../types';

const MIN_WIDTH = 400;
const DEFAULT_WIDTH = 650;
const MAX_WIDTH = 650;

export const useContainerResize = ({
  containerRef,
  totalHeight,
  vehicleCount,
  zoneId
}: UseContainerResizeParams) => {
  const [containerSize, setContainerSize] = useState<ContainerSize>({
    width: DEFAULT_WIDTH,
    height: totalHeight
  });

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      const validWidth = width > MIN_WIDTH ? width : DEFAULT_WIDTH;
      setContainerSize({
        width: Math.min(validWidth, MAX_WIDTH),
        height: totalHeight
      });
    }
  }, [totalHeight, containerRef]);

  // Resize handling
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [vehicleCount, zoneId, totalHeight, handleResize]);

  return {
    containerSize,
    handleResize
  };
};
