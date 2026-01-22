import type { Coordinate, Zone } from '~ez/stores/types'

export type OriginType = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface ScaleUpdate {
  percentage?: number
  origin?: OriginType
}

export interface ValidatedZone extends Zone {
  coords: Coordinate[][]
}

export interface AreaColorPreset {
  label: string
  colors: string[]
}
