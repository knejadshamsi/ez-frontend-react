import React, {useCallback, useState} from 'react'
import { Button, Drawer, Divider, Radio , Checkbox, Space, Tooltip, notification, Slider, InputNumber } from 'antd';
import { LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons'


export default function ZeleIAInput({formState, setFormState, zeleState, setZeleState , goHandler}){

  const labels = {
    exemptions: {
      emergencyVehicles: 'Emergency Vehicles',
      commercialVehicles: 'Commercial Vehicles',
      privateVehicles: 'Private Vehicles',
      electricVehicles: 'Electric Vehicles',
      residents: 'Residents',
    },
    outputInfo: {
      trafficFlow: 'Include Traffic Flow',
      affectedPopulation: 'Include Affected Population',
      improvementSuggestions: 'Include Improvement Suggestions',
      financialProjections: 'Include Financial Projections',
    },
  };

  // Custom section is unfinished. Once the model is finished the spesifics will be created
  const [customCamera, setCustomCamera] = useState([20, 50])
  const [customBarriers, setCustomBarriers] = useState([20,50])

  const customSpinnerCon = { position:"absolute",top:0,left:0,background:"rgba(255,255,255,.6)",backdropFilter:"blur(1px)", 
    width:"100%",height:"100%","display":"flex",justifyContent: "center",flexDirection:"column",gap:"1rem", alignItems: "center",zIndex:"5"}
  
  const dividerStyle = {fontSize:"1rem",fontWeight:"700"}
  const divderorientationMargin = 10
  const checkStyle = {fontSize:"0.95rem", fontWeight:"500"}
  const btnStyle = {fontSize:"1rem", fontWeight:"500",paddingInline:"1rem",display:"flex",justifyContent: "center", alignItems: "center"}
  const textkStyle = {fontSize:"1rem", fontWeight:"500"}

  const dividerTooltip= {
    trafficFlow: `Traffic Flow analysis will help optimize road usage and identify congestion points.`,
    affectedPopulation: `Population impact assessment will reveal how different demographic groups are affected.`,
    improvementSuggestions: `Improvement suggestions will offer data-driven recommendations to enhance policy effectiveness.`,
    financialProjections: `Financial projections will estimate costs, potential revenues, and overall economic impact.`,
  }

  const handleCheckboxChange = (category, name) => {
    setFormState((prevState) => ({
      ...prevState,
      [category]: {
        ...prevState[category],
        [name]: !prevState[category][name],
      },
    }));
  };
  const handlePresetChange = useCallback((e) => {
    const newPreset = e.target.value;
    setFormState(prevState => ({ ...prevState, preset: newPreset }));
    let newState = {emergencyVehicles: true,commercialVehicles: true,privateVehicles: false,electricVehicles: true,residents: false,}
    switch(newPreset) {
      case "CO2Reduction":
        newState = {emergencyVehicles: true,commercialVehicles: true,privateVehicles: false,electricVehicles: true,residents: false,}
        setFormState(prevState => ({ ...prevState,exemptions: newState }))
        break;
      case "HighAccessibility":
        newState = {emergencyVehicles: true,commercialVehicles: true,privateVehicles: true,electricVehicles: true,residents: true,}
        setFormState(prevState => ({ ...prevState,exemptions: newState }))
        break;
      case "BudgetOptimization":
        newState = {emergencyVehicles: true,commercialVehicles: true,privateVehicles: true,electricVehicles: false,residents: false,}
        setFormState(prevState => ({ ...prevState,exemptions: newState }))
        break;
      case "Custom":
        newState = {emergencyVehicles: false,commercialVehicles: false,privateVehicles: false,electricVehicles: false,residents: false,}
        setFormState(prevState => ({ ...prevState,exemptions: newState }))
        break;
    }
  });

  const openNotificationWithIcon = (type) => {
    notification[type]({
      message: 'Mock-up Limitation Notice',
      description:
        'Area changes are disabled for the mock-up. This feature will be available in the final release.',
        placement: 'top'
    });
  };
  
  
  return(
    <Drawer
      title="Choose Parameters"
      placement="right"
      open={zeleState==="PARAMETER_SELECTION" || zeleState==="LONG_WAIT_WARNING" || zeleState==="WAITING_FOR_RESULT"}
      onClose={() => {setZeleState('userParameterSelection',false);setZeleState('userInactive',true)}}
      width={750}
      headerStyle={{ display: 'none' }}
      maskStyle={{ display: 'none' }}
      contentWrapperStyle={{ boxShadow: 'none' }}
      style={{ position: 'absolute', bottom: '30px', right: '15px', height: '88vh', boxShadow: '3px 3px 10px #777'}}
    >
      {zeleState === "WAITING_FOR_RESULT" && (<div style={customSpinnerCon}>
        <LoadingOutlined style={{ fontSize: 42, color:"#1890ff" }} spin /><p style={{color:"#1890ff"}}>Loading...</p></div>) }

      <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>AREA</Divider>
      <Space direction="horizontal" align="baseline">
      <p style={textkStyle}>Area already selected.</p>
      <Button onClick={() => openNotificationWithIcon('info')} style={btnStyle}>Change area</Button>
      </Space>

      <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>EXEMPTIONS </Divider>
      <Space align="start" direction="horizontal" wrap="true" >
      {Object.keys(formState.exemptions).map((el)=> { return <Checkbox checked={formState.exemptions[el]} onChange={() => handleCheckboxChange('exemptions', el)} style={checkStyle}>{labels.exemptions[el]}</Checkbox>})}
      </Space>

      <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>PRESETS </Divider>
  
      <Radio.Group defaultValue="CO2Reduction" onChange={handlePresetChange} value={formState.preset} buttonStyle="solid" size="medium">
        <Radio.Button value="CO2Reduction">CO2 Reduction</Radio.Button>
        <Radio.Button value="HighAccessibility">High Accessibility</Radio.Button>
        <Radio.Button value="BudgetOptimization">Budget Optimization</Radio.Button>
        <Radio.Button value="Custom">Custom</Radio.Button>
      </Radio.Group>

      <div style={{width:"100%", flexGrow:"1", marginBlock:"0.5rem",marginTop:"0.75rem" , border:"1px solid rgba(0,0,0,0.1)", borderRadius:"10px", display:"flex",justifyContent:"center",alignItems:"center"}}>
        {formState.preset==="CO2Reduction" && (
          <ul>
          <li><strong>Goal:</strong> Drastically reduce CO2 emissions by limiting most vehicles, especially high-emission ones. Focus on long-term environmental benefits.</li>
          <li><strong>Exemptions:</strong></li>
          <ul>
            <li>Emergency Vehicles</li>
            <li>Commercial Vehicles</li>
            <li>Electric Vehicles</li>
          </ul>
          <li><strong>Enforcement Methods:</strong></li>
          <ul>
            <li><strong>Physical Barriers:</strong> Permanent (15-20)</li>
            <li><strong>Cameras:</strong> 20-30</li>
          </ul>
        </ul>
        )}
        {formState.preset==="HighAccessibility" && (
          <ul>
          <li><strong>Goal:</strong> Maintain high accessibility for essential services and residents, ensuring minimal disruption to daily life while still reducing emissions.</li>
          <li><strong>Exemptions:</strong></li>
          <ul>
            <li>Emergency Vehicles</li>
            <li>Private Vehicles</li>
            <li>Commercial Vehicles</li>
            <li>Residents</li>
            <li>Electric Vehicles</li>
          </ul>
          <li><strong>Enforcement Methods:</strong></li>
          <ul>
            <li><strong>Physical Barriers:</strong> Movable (15-20)</li>
            <li><strong>Cameras:</strong> 10-20</li>
          </ul>
        </ul>
        )}
        {formState.preset==="BudgetOptimization" && (
          <ul>
          <li><strong>Goal:</strong> Implement low-cost measures to reduce emissions without significant financial investment. Ideal for areas with limited budgets.</li>
          <li><strong>Exemptions:</strong></li>
          <ul>
            <li>Emergency Vehicles</li>
            <li>Private Vehicles</li>
            <li>Commercial Vehicles</li>
          </ul>
          <li><strong>Enforcement Methods:</strong></li>
          <ul>
            <li><strong>Physical Barriers:</strong> Temporary (15-20)</li>
            <li><strong>Cameras:</strong> 5-10</li>
          </ul>
        </ul>
        )}

        {formState.preset==="Custom" && (
          <div style={{width:"100%", height:"100%", padding:"2rem"}}>
          <div style={{display:"grid",gridTemplateColumns:"3fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap:"0.25rem", paddingBottom:"1.5rem"}}>
            <strong style={{}}>Number of Cameras:</strong>
            <Slider range defaultValue={[20, 50]} min={0} max={500}  value={customCamera} onChange={(newvalue) => setCustomCamera(newvalue)} style={{gridColumn:"1/2", gridRow:"2/3"}} />
            <strong>Min:</strong>
            <InputNumber  min={0} max={500} value={customCamera[0]} onChange={(newvalue) => setCustomCamera([newvalue, customCamera[1]])}   />
            <strong style={{gridColumn:"3/4", gridRow:"1/2"}}>Max:</strong>
            <InputNumber  min={0} max={500} value={customCamera[1]} onChange={(newvalue) => setCustomCamera([customCamera[0], newvalue])}   />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"3fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap:"0.25rem"}}>
          <strong>Number of Barriers:</strong>
          <Slider range defaultValue={[20, 50]} min={0} max={500} onChange={(newvalue)=> setCustomBarriers(newvalue)} style={{gridColumn:"1/2", gridRow:"2/3"}}  />
          <strong>Min:</strong>
          <InputNumber  min={0} max={500} value={customBarriers[0]} onChange={(newvalue)=> setCustomBarriers([newvalue,customBarriers[1] ])}  />
          <strong style={{gridColumn:"3/4", gridRow:"1/2"}}>Max:</strong>
          <InputNumber  min={0} max={500} value={customBarriers[1]} onChange={(newvalue)=> setCustomBarriers([customBarriers[0],newvalue])}  />
          </div>
        </div>
        )}

      </div>
      
      <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>OUTPUT INFO </Divider> 
      <Space align="start" direction="vertical" size="small" style={{marginBottom:"2rem"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
      {Object.keys(formState.outputInfo).map((el)=> { return <Checkbox checked={formState.outputInfo[el]} 
      onChange={() => handleCheckboxChange('outputInfo', el)} style={checkStyle}>
        {labels.outputInfo[el]} <Tooltip placement="right" title={dividerTooltip[el]} color={"blue"}> <QuestionCircleOutlined /></Tooltip>
        </Checkbox>})}
        </div>
      </Space>

      <Button type="primary" align="end" onClick={goHandler} style={btnStyle}> GO!</Button>
    </Drawer>
    
  )
}