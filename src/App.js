import { useState} from 'react';
import { Layout } from "antd";
import DeckGL from 'deck.gl';
import {Map, Source, Layer} from 'react-map-gl';
import HeaderContent from './Interface/HeaderContent';
import LayersMenu from './Interface/LayersMenu';
import Services from './Services';
import {useZeleStore, useZoneSelectionStore} from './Stores'
import './App.css';

import {HeatmapLayer} from '@deck.gl/aggregation-layers'
import {PolygonLayer} from '@deck.gl/layers';
import { point } from '@turf/helpers';
import distance from '@turf/distance';


// Definitions 
const { Header, Content, Sider } = Layout
const apiAccess = process.env.REACT_APP_ACCESS_TOKEN

// Styles
const leyoutStyle = { height: '100vh', overflow: 'hidden'}
const headerStyle = { height:'64px', backgroundColor: 'white', display: 'flex', justyContent: "center", alignItems:"center"}
const LayersMenuStyle = { paddingInline: "1rem", paddingTop:"1rem"}
const deckglStyle = { width: '100%', height: '100vh', position: 'relative'}

function App() {

  const zeleStore = useZeleStore((state)=> state.zele)
  const finalArea = useZoneSelectionStore((state)=> state.finalArea)
  const setFinalArea = useZoneSelectionStore((state)=> state.setFinalArea)

  const [selectedArea, setSelectedArea] = useState([])
  const [firstPoint, setFirstPoint] = useState(null)

  const ZoneSelection = (e,t)=>{
    const coordinate = e.coordinate
    if ( finalArea || !coordinate || (!firstPoint && t === "h")) return
    if (!firstPoint) {
      setSelectedArea([coordinate,coordinate])
      setFirstPoint(coordinate)
      return
    } 
    if (t === "h") {
      setSelectedArea([...selectedArea.slice(0,-1), coordinate])
    } else {
        if (distance(point(coordinate), point(firstPoint), { units: 'meters' }) < 20) {
          setFinalArea([...selectedArea.slice(0,-1),firstPoint])
          setSelectedArea([])
          setFirstPoint(null)
          return
        } else {
          setSelectedArea([...selectedArea.slice(0,-1),coordinate,coordinate])
      }
    }
  }

  const layers = [
    zeleStore==="ZONE_SELECTION"? new HeatmapLayer({id: 'HeatmapLayer',data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',aggregation: 'SUM',radiusPixels: 25, getPosition: (d) => d.COORDINATES,getWeight: (d) => d.SPACES,}): null,
    new PolygonLayer({id: 'selected-layer',data: [{ contour: selectedArea }], getPolygon: d => d.contour , getFillColor: [255, 0, 0, 100] }),
    finalArea && new PolygonLayer({id: 'final-selected-layer',data: [{ contour: finalArea }], getPolygon: d => d.contour , getFillColor: [255, 0, 0, 100] })
  ]

  return (
  <Layout  style={leyoutStyle}>
  <Header style={headerStyle}>
    <HeaderContent />
  </Header>
  <Layout>
    <Sider style={LayersMenuStyle} theme="light"><LayersMenu /></Sider>
    <Content>
      <DeckGL style={deckglStyle} layers={layers} controller initialViewState={{longitude: -73.561036 ,latitude: 45.5126846,zoom: 15, pitch: 40, }} onClick={(e)=>ZoneSelection(e,"c")} onHover={(e)=>ZoneSelection(e,"h")}>
        <Map 
          mapboxAccessToken={apiAccess}
          style={{width: '100%', height: '100vh'}}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          maxZoom={22}
          renderWorldCopies={false}
          antialias={true}
        >
        <Source id="composite" type="vector" url="mapbox://mapbox.mapbox-streets-v8"  minZoom={16} maxzoom={22}>
        <Layer id="3d-buildings" source="composite" source-layer="building" type="fill-extrusion"
          paint={{ 'fill-extrusion-color': '#aaa', 'fill-extrusion-height': ['max',['coalesce', ['get', 'height'], ['get', 'render_height'], 0], 10],
          'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
          'fill-extrusion-opacity': 0.3  }}
          minZoom={16} maxzoom={22}
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
