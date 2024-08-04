import { Menu, Button } from "antd";
import {useServiceStore} from '../Stores'
import ZeleHeader from '../Services/Zele/zeleHeader'

export default function HeaderContent() {
    
    const serviceState = useServiceStore((state) => state.activeService)
    const setActiveService = useServiceStore((state)=> state.setActiveService)

    const menuStyle = {flexGrow: '1', border: 'none', userSelect: 'none'}
    const buttonStyle = { margin: '0 20px 0 0',}
    const menuItems = [
        {key:'layers', label: 'Layers'},
        {key:'services', label: 'Services',  children: 
          [{ label: 'Building Info', key: 'bldg-info'},
            { label: 'IDF Generator', key: 'IDF-Generator'}, 
            { label: 'Single-Building Retrofit', key: 'Single-Building-Retrofit'}, 
            { label: 'Multi-Building Retrofit', key: 'Multi-Building-Retrofit'}, 
            { label: 'ZELE Impact analysis', key: 'ZELE',  onClick: ()=> {setActiveService("ZELE")}},
            { label: 'ZELE API', key: 'ZELE',  onClick: ()=> {setActiveService("ZELEAPI")}}
          ]},
            
        {key:'workbench', label: 'Workbench'}
      ]
    return (
        <>
        {serviceState === "REST" && (<><Menu mode="horizontal" items={menuItems} style={menuStyle} />
        <Button style={buttonStyle}>En</Button></>)}
        {serviceState === "ZELE" && (<ZeleHeader />)}
        </>
    )
}