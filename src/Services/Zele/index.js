import React, {useState} from 'react'
import { Modal } from 'antd';
import ZeleIAInput from './zeleIAInput'
import ZeleIAOutput from './zeleIAOutput'
import ZeleAPI from './zeleAPI'
import {useServiceStore, useZeleStore} from '../../Stores'

export default function ZeleIA() {

  //Local Form state
  const [formState, setFormState] = useState({
    preset: 'Custom',
    exemptions: { emergencyVehicles: true, commercialVehicles: true, privateVehicles: false, electricVehicles: false, residents: false,},
    outputInfo: { trafficFlow: false, affectedPopulation: false, improvementSuggestions: false, financialProjections: false,},
  });

  //Stores
  const serviceState = useServiceStore((state) => state.activeService)
  const setActiveService = useServiceStore((state)=> state.setActiveService)
  const zeleState = useZeleStore((state) => state.zele)
  const setZeleState = useZeleStore((state)=> state.setZeleState)

  const [disclaimerText,setDisclaimerText] = useState("")

  // Handlers
  const zoneHandler =() => {
    //setZeleState("PARAMETER_SELECTION")
    setZeleState("ZONE_SELECTION")
  }

  const goHandler = () => {
    let input = Object.keys(formState.outputInfo).filter(key => formState.outputInfo[key])
    let inputLength = input.length
  
    if (inputLength === 0) {
      approveHandler()
    } else if (inputLength >= 1 && inputLength <= 3) {
      setZeleState("LONG_WAIT_WARNING")
      setDisclaimerText(`Processing the selected options (${input.join(', ')}) might take a little longer. Please be patient.`);
    } else if (inputLength === 3) {
      setZeleState("LONG_WAIT_WARNING")
      setDisclaimerText(`Processing all 3 selected options (${input.join(', ')}) might take significantly longer. Please be patient.`);
    } else if (inputLength === 4) {
      setZeleState("LONG_WAIT_WARNING")
      setDisclaimerText(`Processing all selected options (${input.join(', ')}) might take a lot longer. Do you wish to continue?`);
    }
  
  }

  const approveHandler =() => {
    setZeleState("WAITING_FOR_RESULT")
    setTimeout(()=> {
      setZeleState("RESULT_VIEW")
    }, 5000)
  }
    
  return(
    <>
    <Modal title="WELCOME TO ZELE IMPACT ANALYSIS TOOL"
    open={serviceState === "ZELE" && zeleState === "WELCOME"}
    onOk={zoneHandler}
    onCancel={()=> {setZeleState("WELCOME");setActiveService("REST")}}>
    Welcome to the ZELE Impact Analysis Tool. This tool is designed to help you assess the impact of zero and low-emission zones on urban traffic flow, air quality, and CO2 emissions in Montreal. 
    By selecting various parameters, you can customize the analysis to meet your specific needs and obtain detailed insights to support sustainable urban development.
    </Modal>
    
    <ZeleIAInput formState={formState} setFormState={setFormState} zeleState={zeleState} setZeleState={setZeleState}
      goHandler={goHandler} />
      <Modal
      open={zeleState === "LONG_WAIT_WARNING"}
      title="Processing Notice"
      onOk={approveHandler}
      onCancel={() => {setActiveService("REST");setZeleState("WELCOME")}}>
      {disclaimerText}
    </Modal>
    
    <ZeleIAOutput zeleState={zeleState} setZeleState={setZeleState} />

    {serviceState=== "ZELEAPI" && (<ZeleAPI />)}
   </>
  )
}
