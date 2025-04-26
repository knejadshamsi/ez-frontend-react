import React, { useEffect, useState } from 'react'
import { Drawer, Divider, Space, Button } from 'antd'
import { controlStore } from '~store/controlStore'
import { servicesStore } from '~store/servicesStore'

import { Overview } from './output/Overview'
import { AreaAndNetwork } from './output/AreaAndNetwork'
import { TrafficFlow } from './output/TrafficFlow'
import { AirQuality } from './output/AirQuality'
import { Conclusion } from './output/Conclusion'

import styled from 'styled-components';

const ZeleIAOutput = ({ cancelHandler }) => {

  const StyledDrawer = styled(Drawer)`
  .ant-drawer-body {
    scrollbar-width: none; 
    scrollbar-color: lightgray transparent;
    padding-inline: 1rem;
    transition: 0.2 ease;
    scroll-behavior: smooth;
    &::-webkit-scrollbar {
        width: 0px;
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background-color: lightgray;
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
  }
  .ant-drawer-body:hover {
    scrollbar-width: thin;
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-thumb {
        opacity: 1; 
    }
  }
  `
  // const items = [
  //   { key: 1, label: 'Overview', children: <Overview /> },
  //   { key: 2, label: 'Area and Network', children: <AreaAndNetwork /> },
  //   { key: 3, label: 'Traffic Flow', children: <TrafficFlow /> },
  //   { key: 4, label: 'Air Quality', children: <AirQuality /> },
  //   { key: 5, label: 'Conclusion', children: <Conclusion /> },
  // ]
  
  const setLayersShown = controlStore((state) => state.setLayersShown)
  const zeleState = servicesStore((state) => state.zeleState)
  const setZeleState = servicesStore((state) => state.setZeleState)
  // const [tabKey, setTabkey] = useState(1)
  
  // useEffect(()=>{
  //   setLayersShown('zeleHeatLayer', false)
  //   setLayersShown('zelePathLayer', false)
  //   switch(tabKey) {
  //     case 1:
  //       //setLayersShown('zeleHeatLayer', true)
  //       //setLayersShown('zelePointLayer', true)
  //       //setLayersShown('zelebBuildingLayer', true)
  //       break
  //     case 2:
  //       setLayersShown('zelePathLayer', true)
  //       break
  //     default:
  //       setLayersShown('zeleHeatLayer', true)
  //       break
  //   }
  // },[tabKey])
  const divderorientationMargin = 10
  const dividerStyle = {fontSize:"1.125rem",fontWeight:"700"}

  return(
    <StyledDrawer
      title="Results"
      placement="right"
      open={zeleState === "RESULT_VIEW"}
      onClose={cancelHandler}
      width={740}
      headerStyle={{ display: 'none' }}
      maskStyle={{ display: 'none' }}
      style={{top: '77px', right: '15px', height: '88vh', zIndex: 1,}}
      contentWrapperStyle={{ boxShadow: '3px 3px 10px #777' }}
      footer={
        <Space align="center" direction="horizontal">
        <Button type="primary"> Download PDF</Button>
        <Button type="primary"  onClick={()=>{setZeleState('ZONE_SELECTION')}}> Restart</Button>
        </Space>
      }
    >
      {/* <Tabs defaultActiveKey="1" items={items} onTabClick={(key)=> setTabkey(key) } /> */}
      <Space direction='vertical'>
        <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>Overview</Divider>
        <Overview />
        <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>Area and Network</Divider>
        <AreaAndNetwork />
        <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>Traffic Flow</Divider>
        <TrafficFlow />
        <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>Air Quality</Divider>
        <AirQuality />
        <Divider orientationMargin={divderorientationMargin} orientation="left" style={dividerStyle}>Conclusion</Divider>
        <Conclusion />
      </Space>
    </StyledDrawer>
  )
}

export {ZeleIAOutput}