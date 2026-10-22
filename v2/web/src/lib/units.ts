import type { WeightUnit } from '#/types/api'

export const kgPerLb = 0.45359237

export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kg / kgPerLb
}

export function formatWeight(value: number, unit: WeightUnit): string {
  return `${Number(value.toFixed(1))} ${unit}`
}
