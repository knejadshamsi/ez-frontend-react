import { useEffect, useState } from 'react';
import { Layout } from "antd";
import DeckGL from 'deck.gl';
import { Map, Source, Layer } from 'react-map-gl';
import HeaderContent from './Interface/HeaderContent';
import LayersMenu from './Interface/LayersMenu';
import Services from './Services';
import { useZeleStore,useServiceStore, useZoneSelectionStore, useResultStore } from './Stores';
import './App.css';

import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import { PolygonLayer, PathLayer } from '@deck.gl/layers';
import { ScatterplotLayer } from '@deck.gl/layers'
import { point, polygon } from '@turf/helpers';
import distance from '@turf/distance';
import bbox from '@turf/bbox'
import axios from 'axios';

// Definitions 
const { Header, Content, Sider } = Layout
const apiAccess = process.env.REACT_APP_ACCESS_TOKEN

// Styles
const leyoutStyle = { height: '100vh', overflow: 'hidden' }
const headerStyle = { height:'64px', backgroundColor: 'white', display: 'flex', justyContent: "center", alignItems:"center" }
const LayersMenuStyle = { paddingInline: "1rem", paddingTop:"1rem" }
const deckglStyle = { width: '100%', height: '100vh', position: 'relative' }

function App() {

  const zeleStore = useZeleStore((state)=> state.zele)
  const finalArea = useZoneSelectionStore((state)=> state.finalArea)
  const setFinalArea = useZoneSelectionStore((state)=> state.setFinalArea)
  const activeService = useServiceStore((state)=> state.activeService)
  const tab = useResultStore((state)=> state.tab)
  const setTab = useResultStore((state)=> state.setTab)

  const [selectedArea, setSelectedArea] = useState([])
  const [firstPoint, setFirstPoint] = useState(null)

  const ZoneSelection = (e,t)=>{
    const coordinate = e.coordinate
    if ( finalArea || !coordinate || (!firstPoint && t === "h") || zeleStore !== "ZONE_SELECTION") return
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

  // Temporary local data gen functions
  const MathRandom = (min, max) => Math.random() * (max - min) + min
  const [hmData, setHMData] = useState([])

  const hmFactory = () => {
      const newArea = []
      const [minLng, minLat, maxLng, maxLat] = bbox(polygon([finalArea])) 
      while (newArea.length < 300) {
        const lng = MathRandom(minLng, maxLng)
        const lat = MathRandom(minLat, maxLat)
        newArea.push({position:[lng, lat], weight: MathRandom(1,10),})
      }
      setHMData(newArea)
  }



  const [llData, setLLData] = useState([])

  const llFactory = async () => {
    //const [minLng, minLat, maxLng, maxLat] = bbox(polygon([finalArea])) 
    //const data = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/street.json?bbox=${minLng},${minLat},${maxLng},${maxLat}&access_token=${apiAccess}`)
    let output = []
    const coords = finalArea.map(point => `${point[1]} ${ point[0] }`).join(' ')
    const request = `[out:json];(way["highway"](poly:"${coords}"););out geom;`
    const encodedrequest = encodeURIComponent(request)
    const data = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodedrequest}`)
    if (data.status !== 200) return
    const newData = data.data.elements
    newData.forEach(parentArray => {
      parentArray = parentArray.geometry
      if (!Array.isArray(parentArray) || parentArray.length < 1) return;
      let newparray = [];
      parentArray.forEach(child => {
        if(typeof child !== 'object') return
        child = [child.lon, child.lat]
        newparray.push(child);
      });
      output.push({"inbound": 72633,"outbound": 74735,path: newparray});
    });
    setLLData(output);
    console.log(output)
  }

  useEffect(()=>{
    if(zeleStore !== "WAITING_FOR_RESULT") return
    hmFactory()
    llFactory()
  },[zeleStore])

  useEffect(()=>{
    if(activeService !== "ZELE") {
      setHMData([])
      setLLData([])
    }
  },[activeService])

  const scTest = [[-73.57840140299794,45.50247757205444],[-73.57987765143768,45.50163751267878],[-73.57962105410682,45.501961063255564]]

  const processTest = scTest

  // Layers
  const layers = [
    zeleStore==="ZONE_SELECTION"? new PolygonLayer({id: 'selected-layer',data: [{ contour: selectedArea }], getPolygon: d => d.contour , getFillColor: [255, 0, 0, 100] }): null,
    finalArea && new PolygonLayer({id: 'final-selected-layer',data: [{ contour: finalArea }], getPolygon: d => d.contour , getFillColor: [255, 0, 0, 100] }),
    tab === "1" ? new HeatmapLayer({id: 'HeatmapLayer',data: hmData, aggregation: 'SUM',radiusPixels: 25, getPosition: (d) => d.position, getWeight: (d) => d.weight,}): null,
    tab === "2" ? new PathLayer({id: 'PathLayer', data: llData, getWidth: 10, getColor: (d) => [Math.sqrt(d.inbound + d.outbound), 140, 0], getPath: (d) => d.path }): null,
    tab === "3" ? new ScatterplotLayer({id: 'zele-point-layer',data: processTest ,stroked: false, getPosition: (d) => d, getRadius: (d) => d = 3, getFillColor: [255, 140, 0],}): null,
  ]

  return (
  <Layout  style={leyoutStyle}>
  <Header style={headerStyle}>
    <HeaderContent />
    <button onClick={()=> {setTab("3");console.log("fired")}}>PRESS</button>
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
