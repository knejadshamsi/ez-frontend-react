import React from 'react'
import { Drawer, Tabs, Space, Button } from 'antd';

export default function ZeleIAOutput({zeleState, setZeleState}){
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
    >
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Overview" key="1">

        <ul>
    <li>Summary of key findings</li>
    <li>High-level statistics</li>
    <li>Main visualizations (e.g., traffic flow summary, key metrics)</li>
</ul>

        </Tabs.TabPane>
        <Tabs.TabPane tab="Accessibility" key="2">
          
        <ul>
    <li>Analysis of accessibility to various locations</li>
    <li>Metrics like average travel time to key destinations</li>
    <li>Maps showing accessibility levels</li>
</ul>

        </Tabs.TabPane>
      <Tabs.TabPane tab="Area and Network" key="3">

      
      <ul>
      <li>Detailed information about the Area</li>
    <li>Detailed information about the transportation network</li>
    <li>Network topology, including roads, public transport routes</li>
    <li>Visualizations of network usage and bottlenecks</li>
</ul>
      </Tabs.TabPane>
      < Tabs.TabPane tab="Detailed Analysis" key="4">

      <ul>
    <li>In-depth analysis of specific aspects (e.g., traffic flow, vehicle counts)</li>
    <li>Detailed charts and tables</li>
    <li>Breakdown of various metrics over time and space</li>
</ul>

      </Tabs.TabPane>
      <Tabs.TabPane tab="Comparisons" key="5">

      <ul>
    <li>Comparative analysis with benchmarks or past data</li>
    <li>Side-by-side visualizations showing differences</li>
    <li>Interpretation of comparative data</li>
</ul>

      </Tabs.TabPane>
      <Tabs.TabPane tab="Conclusions" key="6">

      <ul>
    <li>Final conclusions based on the analysis</li>
    <li>Key takeaways</li>
    <li>Recommendations or next steps based on the results</li>
</ul>

      </Tabs.TabPane>
    </Tabs>
    </Drawer>
  )
}
