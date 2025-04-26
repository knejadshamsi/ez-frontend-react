import { useState } from "react"
import { Slider, InputNumber } from 'antd';

const Presets =  ({ formState })=> {
  const [customCamera, setCustomCamera] = useState([20, 50])
  const [customBarriers, setCustomBarriers] = useState([20,50])

  return(
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
  )
}

export {Presets}