import { useState, useEffect } from 'react'
import { ZoneSelectionPoly } from './layers/zoneSelectionPoly'
import { ZeleHeatLayer } from './layers/zeleHeatLayer'
import { ZelePathLayer } from './layers/zelePathLayer'
import { ZeleHexagonLayer } from './layers/zeleHexagonLayer'
import { ZeleBuildingLayer } from './layers/zeleBuildingLayer'

const ZeleParentLayers = (props)=> {
  const [zonePolyLayer, setZonePolyLayer] = useState([])
  const [zeleHeatLayer, setZeleHeatLayer] = useState([])
  const [zelePathLayer, setZelePathLayer] = useState([])
  const [zeleHexagonLayer, setZeleHexagonLayer] = useState([])
  const [zeleBuildingLayer, setZeleBuildingLayer] = useState([])
  

  useEffect(() => {
    props.setter([...zonePolyLayer, ...zeleHeatLayer, ...zelePathLayer, ...zeleHexagonLayer, ...zeleBuildingLayer])
  }, [zonePolyLayer, zeleHeatLayer, zelePathLayer, zeleHexagonLayer, zeleBuildingLayer])

  return(
    <>
      <ZoneSelectionPoly setter={setZonePolyLayer} />
      <ZeleHeatLayer setter={setZeleHeatLayer} />
      <ZelePathLayer setter={setZelePathLayer} />
      <ZeleHexagonLayer setter={setZeleHexagonLayer} />
      <ZeleBuildingLayer setter={setZeleBuildingLayer} />
    </>
  )
}

export { ZeleParentLayers }