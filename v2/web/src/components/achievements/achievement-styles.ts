import { tierColorIndex } from '#/lib/achievements'

const tierColors = [
  'bg-[#d08b4e]',
  'bg-[#c9d1d9]',
  'bg-[#f5c842]',
  'bg-[#5fa8ff]',
  'bg-[#b48cff]',
]

export function tierColor(level: number, tierCount: number): string {
  return tierColors[tierColorIndex(level, tierCount, tierColors.length)]
}
