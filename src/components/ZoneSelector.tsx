import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { PolygonLayer } from '@deck.gl/layers';
import { point } from '@turf/helpers';
import distance from '@turf/distance';
import { Coordinate } from '../types';
import { MTL_AREA } from '../Services/ez/utils/polygonValidation';

interface ZoneSelectorProps {
  isActive: boolean;
  onZoneComplete: (polygon: Coordinate[]) => void;
  showInteractionLayer?: boolean;
  interactionLayerColor?: [number, number, number, number];
  drawingFillColor?: [number, number, number, number];
  drawingLineColor?: [number, number, number, number];
}

function useZoneSelector({
  isActive,
  onZoneComplete,
  showInteractionLayer = false,
  interactionLayerColor = [0, 0, 0, 1],
  drawingFillColor = [255, 0, 0, 50],
  drawingLineColor = [255, 0, 0, 200],
}: ZoneSelectorProps) {
  const [selectedArea, setSelectedArea] = useState<Coordinate[]>([]);
  const [firstPoint, setFirstPoint] = useState<Coordinate | null>(null);

  const selectedAreaRef = useRef(selectedArea);
  const firstPointRef = useRef(firstPoint);
  const onZoneCompleteRef = useRef(onZoneComplete);

  useEffect(() => {
    selectedAreaRef.current = selectedArea;
  }, [selectedArea]);

  useEffect(() => {
    firstPointRef.current = firstPoint;
  }, [firstPoint]);

  useEffect(() => {
    onZoneCompleteRef.current = onZoneComplete;
  }, [onZoneComplete]);

  const handleLayerClick = useCallback((event: any) => {
    if (!isActive || !event || !event.coordinate) {
      return;
    }

    const coordinate: Coordinate = event.coordinate;
    const currentFirstPoint = firstPointRef.current;
    const currentSelectedArea = selectedAreaRef.current;
    const clickThreshold = 0.0001;

    const canClose = currentFirstPoint && currentSelectedArea.length >= 4;
    const isNearFirstPoint = canClose && distance(point(coordinate), point(currentFirstPoint), { units: 'degrees' }) < clickThreshold;

    if (isNearFirstPoint) {
      const finalPolygon = [...currentSelectedArea.slice(0, -1), currentFirstPoint];
      try {
        onZoneCompleteRef.current(finalPolygon);
      } catch (error) {
        // Handle error
      }

      setSelectedArea([]);
      setFirstPoint(null);
    } else if (!currentFirstPoint) {
      setFirstPoint(coordinate);
      setSelectedArea([coordinate, coordinate]);
    } else {
      const basePoints = currentSelectedArea.slice(0, -1);
      setSelectedArea([...basePoints, coordinate, coordinate]);
    }
  }, [isActive]);

  const handleLayerHover = useCallback((event: any) => {
    if (!isActive || !firstPoint || !event || !event.coordinate) {
      return;
    }

    const coordinate: Coordinate = event.coordinate;
    setSelectedArea(prevArea => {
      if (prevArea.length < 2) return prevArea;
      return [...prevArea.slice(0, -1), coordinate];
    });
  }, [isActive, firstPoint]);

  const drawingLayer = useMemo(() => (
    isActive && selectedArea.length > 0 ? new PolygonLayer({
      id: 'zone-selector-drawing-layer',
      data: [{ contour: selectedArea }],
      getPolygon: (d: any) => d.contour,
      getFillColor: drawingFillColor,
      getLineColor: drawingLineColor,
      getLineWidthMinPixels: 2,
      stroked: true,
      filled: true,
      pickable: false,
    }) : null
  ), [isActive, selectedArea, drawingFillColor, drawingLineColor]);

  const interactionLayer = useMemo(() => {
    if (!isActive) {
      return null;
    }
    let alpha = showInteractionLayer ? (interactionLayerColor[3] < 5 ? 30 : interactionLayerColor[3]) : 1;
    const effectiveInteractionColor: [number, number, number, number] = [
      interactionLayerColor[0],
      interactionLayerColor[1],
      interactionLayerColor[2],
      alpha,
    ];

    return new PolygonLayer({
      id: 'zone-selector-interaction-layer',
      data: [MTL_AREA],
      getPolygon: (d: any) => d,
      pickable: true,
      getFillColor: effectiveInteractionColor,
      getLineColor: effectiveInteractionColor,
      autoHighlight: false,
      onClick: handleLayerClick,
      onHover: handleLayerHover,
    });
  }, [isActive, handleLayerClick, handleLayerHover, showInteractionLayer, interactionLayerColor]);

  const layers = useMemo(() => (
    [interactionLayer, drawingLayer].filter(Boolean)
  ), [interactionLayer, drawingLayer]);

  return layers;
}

export default useZoneSelector;