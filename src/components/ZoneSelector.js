import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { PolygonLayer } from '@deck.gl/layers';
import { point } from '@turf/helpers';
import distance from '@turf/distance';

const mtlAreaCoordinates = [
  [-73.61197208186829, 45.41263857780996],
  [-73.52288866657636, 45.460662325514306],
  [-73.54276354237754, 45.52113298596623],
  [-73.49833116562328, 45.58727093205829],
  [-73.48051362666197, 45.65133852134059],
  [-73.48746263932175, 45.6803086372245],
  [-73.47404385625444, 45.70374168629593],
  [-73.49944369563231, 45.69888850379368],
  [-73.5138209632041, 45.701398823201345],
  [-73.54473208848428, 45.67478370290971],
  [-73.6190146376082, 45.63977978412598],
  [-73.64082016009277, 45.61430864477978],
  [-73.64574663581253, 45.59983053862982],
  [-73.66782369637252, 45.57333109890186],
  [-73.67397851325528, 45.55928038695987],
  [-73.68187273490963, 45.55150414931842],
  [-73.70609060134132, 45.545694691369846],
  [-73.73539288172076, 45.529949916543444],
  [-73.76498414196323, 45.51162949431537],
  [-73.81497202590612, 45.51687179529219],
  [-73.84607368634126, 45.517948201616974],
  [-73.85895763384994, 45.50467075449677],
  [-73.85862079862109, 45.49510905306582],
  [-73.90468980997117, 45.46423059431703],
  [-73.92637470205938, 45.47526334590961],
  [-73.97888615643005, 45.46095017063175],
  [-73.97973654435545, 45.419779546162886],
  [-73.95635087641645, 45.402466983784336],
  [-73.91191810733349, 45.40216844479252],
  [-73.78627329140986, 45.43529664210331],
  [-73.63795532007236, 45.412836680990864],
  [-73.61197208186829, 45.41263857780996],
];

/**
 * Custom hook to manage interactive zone selection state and logic using Deck.gl layers.
 *
 * @param {object} props - The hook props.
 * @param {boolean} props.isActive - Whether the zone selection mode is active.
 * @param {function} props.onZoneComplete - Callback function when a zone is completed. Receives the polygon coordinates.
 * @param {boolean} [props.showInteractionLayer=false] - Whether to make the interaction layer visible for debugging.
 * @param {number[]} [props.interactionLayerColor=[0, 0, 0, 1]] - RGBA color for the interaction layer. Alpha is overridden if showInteractionLayer is false.
 * @param {number[]} [props.drawingFillColor=[255, 0, 0, 50]] - RGBA color for the fill of the polygon being drawn.
 * @param {number[]} [props.drawingLineColor=[255, 0, 0, 200]] - RGBA color for the line of the polygon being drawn.
 * @returns {import('@deck.gl/core').Layer[]} An array of Deck.gl layers to render.
 */
function useZoneSelector({
  isActive,
  onZoneComplete,
  showInteractionLayer = false,
  interactionLayerColor = [0, 0, 0, 1],
  drawingFillColor = [255, 0, 0, 50],
  drawingLineColor = [255, 0, 0, 200],
}) {
  const [selectedArea, setSelectedArea] = useState([]);
  const [firstPoint, setFirstPoint] = useState(null);

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


  const handleLayerClick = useCallback((event) => {
    if (!isActive || !event || !event.coordinate) {
      return;
    }

    const coordinate = event.coordinate;
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
  }, [isActive, onZoneCompleteRef, setSelectedArea, setFirstPoint]);

  const handleLayerHover = useCallback((event) => {
    if (!isActive || !firstPoint || !event || !event.coordinate) {
      return;
    }

    const coordinate = event.coordinate;
    setSelectedArea(prevArea => {
      if (prevArea.length < 2) return prevArea;
      return [...prevArea.slice(0, -1), coordinate];
    });

  }, [isActive, firstPoint]);

  const drawingLayer = useMemo(() => (
    isActive && selectedArea.length > 0 ? new PolygonLayer({
      id: 'zone-selector-drawing-layer',
      data: [{ contour: selectedArea }],
      getPolygon: d => d.contour,
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
    const effectiveInteractionColor = [
      interactionLayerColor[0],
      interactionLayerColor[1],
      interactionLayerColor[2],
      alpha,
    ];

    return new PolygonLayer({
      id: 'zone-selector-interaction-layer',
      data: [mtlAreaCoordinates],
      getPolygon: d => d,
      pickable: true,
      getFillColor: effectiveInteractionColor,
      getLineColor: effectiveInteractionColor,
      autoHighlight: false,
      onClick: handleLayerClick,
      onHover: handleLayerHover,
    });
  }, [
    isActive,
    handleLayerClick,
    handleLayerHover,
    showInteractionLayer,
    interactionLayerColor,
  ]);

  const layers = useMemo(() => (
    [interactionLayer, drawingLayer].filter(Boolean)
  ), [interactionLayer, drawingLayer]);

  return layers;
}

export default useZoneSelector;
