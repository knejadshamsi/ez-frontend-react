import { useState } from 'react';
import { Layout } from "antd";
import DeckGL from 'deck.gl';
import {Map, Source, Layer} from 'react-map-gl';
import HeaderContent from './Interface/HeaderContent';
import LayersMenu from './Interface/LayersMenu';
import Services from './Services';
import {useZeleStore, usePolyStore} from './Stores'
import './App.css';

//import {EditableGeoJsonLayer,DrawLineStringMode,DrawPolygonMode, ViewMode} from '@deck.gl-community/editable-layers';
import {HeatmapLayer} from '@deck.gl/aggregation-layers'


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
  const setZeleState = useZeleStore((state)=> state.setZeleState)
  const poly = usePolyStore((state)=> state.poly)
  const setPolyState = usePolyStore((state)=> state.setPolyState)

  // method 1 Can be toggled by this but toggle off does not work
  // method 2 works perfectly
  const layers = [
    //new EditableGeoJsonLayer({id: 'editable-leyer', data:poly, mode:zeleStore==="ZONE_SELECTION"? DrawPolygonMode:  ViewMode, selectedFeatureIndexes:[], onEdit: ({updatedData})=> {setPolyState(updatedData); }}),
    //zeleStore==="ZONE_SELECTION"? new HeatmapLayer({id: 'HeatmapLayer',data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',aggregation: 'SUM',radiusPixels: 25, getPosition: (d) => d.COORDINATES,getWeight: (d) => d.SPACES,}): null
  ]

  return (
  <Layout  style={leyoutStyle}>
  <Header style={headerStyle}>
    <HeaderContent />
  </Header>
  <Layout>
    <Sider style={LayersMenuStyle} theme="light"><LayersMenu /></Sider>
    <Content>
      <DeckGL style={deckglStyle} layers={layers} controller initialViewState={{longitude: -73.561036 ,latitude: 45.5126846,zoom: 15, pitch: 40, }} >
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
