import { useEffect, useState, useRef, useCallback } from 'react';
import { Layout } from "antd";
import { DeckGL } from '@deck.gl/react';
import { Map, Source, Layer } from 'react-map-gl/mapbox';
import HeaderContent from './Interface/HeaderContent';
import LayersMenu from './Interface/LayersMenu';
import Services from './Services';
import useZoneSelector from './components/ZoneSelector';
import { useZeleStore, useServiceStore, useZoneSelectionStore, useResultStore } from './Stores';
import './App.css';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { PolygonLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { polygon } from '@turf/helpers';
import bbox from '@turf/bbox';
import axios from 'axios';
import { Coordinate, HeatmapDataPoint, PathLayerData } from './types';

const { Header, Content, Sider } = Layout;
const apiAccess = process.env.REACT_APP_MAPBOX_TOKEN;

const layoutStyle = { height: '100vh', overflow: 'hidden' };
const headerStyle = { height: '64px', backgroundColor: 'white', display: 'flex', justifyContent: "center", alignItems: "center" };
const LayersMenuStyle = { paddingInline: "1rem", paddingTop: "1rem" };
const deckglStyle = { width: '100%', height: '100vh', position: 'relative' as const };

function App() {
  const zeleStore = useZeleStore((state) => state.zele);
  const finalArea = useZoneSelectionStore((state) => state.finalArea);
  const setFinalArea = useZoneSelectionStore((state) => state.setFinalArea);
  const activeService = useServiceStore((state) => state.activeService);
  const tab = useResultStore((state) => state.tab);

  const initialViewState = { longitude: -73.561036, latitude: 45.5126846, zoom: 15, pitch: 40 };
  const [viewState, setViewState] = useState(initialViewState);
  const deckRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  const handleZoneComplete = useCallback((completedPolygon: Coordinate[]) => {
    setFinalArea(completedPolygon);
  }, [setFinalArea]);

  const zoneSelectorLayers = useZoneSelector({
    isActive: zeleStore === "ZONE_SELECTION" && !finalArea,
    onZoneComplete: handleZoneComplete,
  });

  const MathRandom = (min: number, max: number) => Math.random() * (max - min) + min;
  const [hmData, setHMData] = useState<HeatmapDataPoint[]>([]);

  const hmFactory = () => {
    if (!finalArea) return;
    const newArea: HeatmapDataPoint[] = [];
    const [minLng, minLat, maxLng, maxLat] = bbox(polygon([finalArea]));
    while (newArea.length < 300) {
      const lng = MathRandom(minLng, maxLng);
      const lat = MathRandom(minLat, maxLat);
      newArea.push({ position: [lng, lat], weight: MathRandom(1, 10) });
    }
    setHMData(newArea);
  };

  const [llData, setLLData] = useState<PathLayerData[]>([]);

  const llFactory = async () => {
    if (!finalArea) return;
    let output: PathLayerData[] = [];
    const coords = finalArea.map(point => `${point[1]} ${point[0]}`).join(' ');
    const request = `[out:json];(way["highway"](poly:"${coords}"););out geom;`;
    const encodedrequest = encodeURIComponent(request);
    const data = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodedrequest}`);
    if (data.status !== 200) return;
    const newData = data.data.elements;
    newData.forEach((element: any) => {
      let parentArray = element.geometry;
      if (!Array.isArray(parentArray) || parentArray.length < 1) return;
      let newparray: Coordinate[] = [];
      parentArray.forEach((child: any) => {
        if (typeof child !== 'object') return;
        newparray.push([child.lon, child.lat]);
      });
      output.push({ inbound: 72633, outbound: 74735, path: newparray });
    });
    setLLData(output);
    console.log(output);
  };

  useEffect(() => {
    if (zeleStore !== "WAITING_FOR_RESULT") return;
    hmFactory();
    llFactory();
  }, [zeleStore]);

  useEffect(() => {
    if (activeService !== "ZELE") {
      setHMData([]);
      setLLData([]);
    }
  }, [activeService]);

  const scTest: Coordinate[] = [
    [-73.57840140299794, 45.50247757205444],
    [-73.57987765143768, 45.50163751267878],
    [-73.57962105410682, 45.501961063255564]
  ];

  const layers = [
    ...zoneSelectorLayers,
    finalArea && new PolygonLayer({
      id: 'final-selected-layer',
      data: [{ contour: finalArea }],
      getPolygon: (d: any) => d.contour,
      getFillColor: [0, 255, 0, 100],
      pickable: false
    }),
    tab === "1" ? new HeatmapLayer({
      id: 'HeatmapLayer',
      data: hmData,
      aggregation: 'SUM',
      radiusPixels: 25,
      getPosition: (d: HeatmapDataPoint) => d.position,
      getWeight: (d: HeatmapDataPoint) => d.weight,
      pickable: false
    }) : null,
    tab === "2" ? new PathLayer({
      id: 'PathLayer',
      data: llData,
      getWidth: 10,
      getColor: (d: PathLayerData) => [Math.sqrt(d.inbound + d.outbound), 140, 0],
      getPath: (d: PathLayerData) => d.path,
      pickable: false
    }) : null,
    tab === "3" ? new ScatterplotLayer({
      id: 'zele-point-layer',
      data: scTest,
      stroked: false,
      getPosition: (d: Coordinate) => d,
      getRadius: 3,
      getFillColor: [255, 140, 0],
      pickable: false
    }) : null,
  ].filter(Boolean);

  return (
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>
        <HeaderContent />
      </Header>
      <Layout>
        <Sider style={LayersMenuStyle} theme="light">
          <LayersMenu />
        </Sider>
        <Content>
          <DeckGL
            ref={deckRef}
            style={deckglStyle}
            layers={layers}
            controller
            initialViewState={initialViewState as any}
            viewState={viewState as any}
            onViewStateChange={(e: any) => setViewState(e.viewState)}
          >
            <Map
              ref={mapRef}
              mapboxAccessToken={apiAccess}
              style={{ width: '100%', height: '100vh' }}
              mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
              maxZoom={22}
              renderWorldCopies={false}
              antialias={true}
            >
              <Source id="composite" type="vector" url="mapbox://mapbox.mapbox-streets-v8" minzoom={16} maxzoom={22}>
                <Layer
                  id="3d-buildings"
                  source="composite"
                  source-layer="building"
                  type="fill-extrusion"
                  paint={{
                    'fill-extrusion-color': '#aaa',
                    'fill-extrusion-height': ['max', ['coalesce', ['get', 'height'], ['get', 'render_height'], 0], 10],
                    'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
                    'fill-extrusion-opacity': 0.3
                  }}
                  minzoom={16}
                  maxzoom={22}
                />
              </Source>
            </Map>
          </DeckGL>
        </Content>
        <Services />
      </Layout>
    </Layout>
  );
}

export default App;
