import { Button, Divider, Radio , Checkbox, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons'
import { servicesStore } from '~store/servicesStore'
import { toolboxStore } from '~store/toolboxStore'
import { toolboxGeoJson as toolboxGeoJsonInitial } from '~store/initials'
import { Presets } from './Presets'

const InputForm =  ({ formState, handleCheckboxChange, handlePresetChange })=> {
  const setZeleState = servicesStore((state) => state.setZeleState)
  const setToolboxGeoJson = toolboxStore((state)=> state.setToolboxGeoJson)

  const dividerTooltip= {
    trafficFlow: `Traffic Flow analysis will help optimize road usage and identify congestion points.`,
    affectedPopulation: `Population impact assessment will reveal how different demographic groups are affected.`,
    improvementSuggestions: `Improvement suggestions will offer data-driven recommendations to enhance policy effectiveness.`,
    financialProjections: `Financial projections will estimate costs, potential revenues, and overall economic impact.`,
  }

  //Styles
  const divderorientationMargin = 10
  const dividerStyle = {fontSize:"1.125rem",fontWeight:"700"}
  const textkStyle = {fontSize:"1rem", fontWeight:"500"}
  const btnStyle = {fontSize:"1rem", fontWeight:"500",paddingInline:"1rem",display:"flex",justifyContent: "center", alignItems: "center"}
  const checkStyle = {fontSize:"1rem", fontWeight:"500"}

  return (
  <Space direction="vertical">
    <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>AREA</Divider>
    <Space direction="horizontal" align="baseline">
      <p style={textkStyle}>Area already selected.</p>
      <Button onClick={()=> {setZeleState("ZONE_SELECTION"); setToolboxGeoJson(toolboxGeoJsonInitial)} } style={btnStyle}>Change area</Button>
    </Space>

    <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>EXEMPTIONS </Divider>
    <Space align="start" direction="horizontal" wrap="true" >
      {Object.keys(formState.exemptions).map((el)=> { return <Checkbox checked={formState.exemptions[el]} onChange={() => handleCheckboxChange('exemptions', el)} style={checkStyle}>{el}</Checkbox>})}
    </Space>

    <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>PRESETS </Divider>
    <Radio.Group defaultValue="CO2Reduction" onChange={handlePresetChange} value={formState.preset} buttonStyle="solid" size="medium">
      <Radio.Button value="CO2Reduction">CO2 Reduction</Radio.Button>
      <Radio.Button value="HighAccessibility">High Accessibility</Radio.Button>
      <Radio.Button value="BudgetOptimization">Budget Optimization</Radio.Button>
      <Radio.Button value="Custom">Custom</Radio.Button>
    </Radio.Group>

    <Presets formState={formState} />

    <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>OUTPUT INFO </Divider> 
    <Space align="start" direction="vertical" size="small" style={{marginBottom:"2rem"}}>
      {Object.keys(formState.outputInfo).map((el)=> { return <Checkbox checked={formState.outputInfo[el]} 
        onChange={() => handleCheckboxChange('outputInfo', el)} style={checkStyle}>
        Include {el} <Tooltip placement="right" title={dividerTooltip[el]} color={"blue"}><QuestionCircleOutlined /></Tooltip>
        </Checkbox>})}
    </Space>

  </Space>
  )
}

export {InputForm}