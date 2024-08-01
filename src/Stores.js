import { create } from 'zustand'

export const useServiceStore = create((set)=> ({
    activeService: "REST",
    setActiveService: (value)=> {set({activeService:value})},
}))

//Possible value: 

//WELCOME, ZONE_SELECTION, PARAMETER_SELECTION, 
//LONG_WAIT_WARNING, INPUT_CONFIRMATION, 
//WAITING_FOR_RESULT, RESULT_VIEW, MAP_VIEW

export const useZeleStore = create((set)=>({
    zele:"WELCOME",
    setZeleState: (value)=> {set({zele:value})},
}))