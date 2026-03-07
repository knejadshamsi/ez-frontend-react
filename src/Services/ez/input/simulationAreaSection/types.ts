import type { Coordinate, Zone, OriginType } from '~ez/stores/types'

export type { OriginType }

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
