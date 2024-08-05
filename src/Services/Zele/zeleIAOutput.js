import React from 'react'
import { Drawer, Tabs, Space, Button } from 'antd';
import { useResultStore } from '../../Stores'

export default function ZeleIAOutput({zeleState, setZeleState}){

  const setTab = useResultStore((state)=> state.setTab)

  const resultItems = [
    {
        key: '1', 
        label: 'Overview', 
        children: (
            <ul>
                <li>Summary of key findings</li>
                <li>High-level statistics</li>
                <li>Main visualizations (e.g., traffic flow summary, key metrics)</li>
            </ul>
        )
    },
    {
        key: '2', 
        label: 'Area and Network', 
        children: (
            <ul>
                <li>Detailed information about the Area</li>
                <li>Detailed information about the transportation network</li>
                <li>Network topology, including roads, public transport routes</li>
                <li>Visualizations of network usage and bottlenecks</li>
            </ul>
        )
    },
    {
        key: '3', 
        label: 'Accessibility', 
        children: (
            <ul>
                <li>Analysis of accessibility to various locations</li>
                <li>Metrics like average travel time to key destinations</li>
                <li>Maps showing accessibility levels</li>
            </ul>
        )
    },
    {
        key: '4', 
        label: 'Detailed Analysis', 
        children: (
            <ul>
                <li>In-depth analysis of specific aspects (e.g., traffic flow, vehicle counts)</li>
                <li>Detailed charts and tables</li>
                <li>Breakdown of various metrics over time and space</li>
            </ul>
        )
    },
    {
        key: '5', 
        label: 'Comparisons', 
        children: (
            <ul>
                <li>Comparative analysis with benchmarks or past data</li>
                <li>Side-by-side visualizations showing differences</li>
                <li>Interpretation of comparative data</li>
            </ul>
        )
    },
    {
        key: '6', 
        label: 'Conclusions', 
        children: (
            <ul>
                <li>Final conclusions based on the analysis</li>
                <li>Key takeaways</li>
                <li>Recommendations or next steps based on the results</li>
            </ul>
        )
    },
];

  return(
    <Drawer
      title="Results"
      placement="right"
      open={zeleState === "RESULT_VIEW"}
      width={740}
      headerStyle={{ display: 'none' }}
      maskStyle={{ display: 'none' }}
      contentWrapperStyle={{ boxShadow: 'none' }}
      style={{ position: 'absolute', bottom: '30px', right: '15px', height: '88vh', boxShadow: '3px 3px 10px #777'}}
      footer={
        <Space align="center" direction="horizontal">
        <Button type="primary"> Download PDF</Button>
        <Button type="primary" onClick={()=>{setZeleState("PARAMETER_SELECTION")}}> Restart</Button>
        </Space>
      }
      onTabClick={(e)=> {console.log("fired"); console.log(e)}}
    >
      <Tabs defaultActiveKey="1" items={resultItems} onTabClick={(key)=> setTab(key)} />
    </Drawer>
  )
}
