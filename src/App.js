import './App.css';
import { Layout, Menu, Button } from "antd";
import DeckGL from '@deck.gl/react'
import {Map, Source, Layer} from 'react-map-gl'
import LayersMenu from './Interface/LayersMenu'

// Functions
const Test = ()=> {
  console.log("test")
}

// Defines
const { Header, Content, Sider } = Layout;
const menuItems = [
  {key:'layers', label: 'Layers'},
  {key:'services', label: 'Services',  children: 
    [{ label: 'Building Info', key: 'bldg-info'},
      { label: 'IDF Generator', key: 'IDF-Generator'}, 
      { label: 'Single-Building Retrofit', key: 'Single-Building-Retrofit'}, 
      { label: 'Multi-Building Retrofit', key: 'Multi-Building-Retrofit'}, 
      { label: 'ZELE Impact analysis', key: 'ZELE',  onClick:Test} ]},
  {key:'workbench', label: 'Workbench'}
]
const apiAccess = process.env.REACT_APP_ACCESS_TOKEN
// Styles
const leyoutStyle = { height: '100vh', overflow: 'hidden'}
const headerStyle = { height:'64px', backgroundColor: 'white', display: 'flex', justyContent: "center", alignItems:"center"}
const menuStyle = {flexGrow: '1', border: 'none', userSelect: 'none'}
const buttonStyle = { margin: '0 20px 0 0',}
const LayersMenuStyle = { paddingInline: "1rem", paddingTop:"1rem"}
const deckglStyle = { width: '100%', height: '100vh', position: 'relative'}


function App() {
  return (
  <Layout   style={leyoutStyle}>
  <Header style={headerStyle}>
    <Menu mode="horizontal" items={menuItems} style={menuStyle} />
    <Button style={buttonStyle}>En</Button>
  </Header>
  <Layout>
    <Sider style={LayersMenuStyle} theme="light"><LayersMenu /></Sider>
    <Content>
      <DeckGL style={deckglStyle} controller initialViewState={{longitude: -73.561036 ,latitude: 45.5126846,zoom: 15, pitch: 40, }}>
        <Map 
          mapboxAccessToken={apiAccess}
          style={{width: '100%', height: '100vh'}}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          minZoom={14}
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
  </Layout>
</Layout>
  );
}

export default App;
