import React, {useState, useEffect} from 'react'
import { Typography,  Button} from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { LogoutOutlined } from '@ant-design/icons'
import {useServiceStore, useZeleStore} from '../../Stores'

export default function ZeleHeader() {

  const zeleState = useZeleStore((state) => state.zele)
  const setZeleState = useZeleStore((state)=> state.setZeleState)
  const setActiveService = useServiceStore((state)=> state.setActiveService)
  const [stepTitle,setStepTitle] = useState("Welcome")
  const { Title } = Typography

  const titleStyle = { width: '14ch', textAlign: 'center', marginTop: '8px',height: '100%', textTransform: 'uppercase',}

  useEffect(()=> {
    switch (zeleState) {
      case "WELCOME":
        setStepTitle("Welcome");
        break;
      case "ZONE_SELECTION":
        setStepTitle("Zone Selection");
        break;
      case "PARAMETER_SELECTION":
        setStepTitle("Parameter Selection");
        break;
      case "LONG_WAIT_WARNING":
        setStepTitle("Long Wait Warning");
        break;
      case "INPUT_CONFIRMATION":
        setStepTitle("Input Confirmation");
        break;
      case "WAITING_FOR_RESULT":
        setStepTitle("Waiting For Result");
        break;
      case "RESULT_VIEW":
        setStepTitle("View Results");
        break;
      case "MAP_VIEW":
        setStepTitle("View Map");
        break;
    }
    
  },[zeleState])

  const exitHandler = ()=> {
    setZeleState("WELCOME");
    setActiveService("REST")
  }
  
  return (
    <>
      <div>
      <Title level={4} style={titleStyle}>Z.E.L.E Impact analysis tool</Title>
      </div>
      <div style={{flexGrow:1,textAlign:"center", display:"flex", justifyContent:"center",alignItems:"center"}}>
      <span style={{ textTransform: 'uppercase', fontSize:"1.5rem",fontWeight:"600" }}>{stepTitle}</span>
      </div>
      <Button title="Help"> Help
      <QuestionCircleOutlined style={{ verticalAlign: 'text-bottom', paddingBottom: '1px' }} />
      </Button>
      <Button title="Exit" style={{ marginLeft: '15px' }} onClick={()=> exitHandler()}> Exit
      <LogoutOutlined style={{ verticalAlign: 'text-bottom', paddingBottom: '1px' }} />
      </Button>
    </>
  )
}
