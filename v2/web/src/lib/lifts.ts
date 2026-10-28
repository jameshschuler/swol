export const maxWeight = 99999.99
export const maxReps = 1000

export function isValidLift(weight: string, reps: string): boolean {
  const rounded = Math.round(Number(weight) * 100) / 100
  const repCount = Number(reps)
  return (
    rounded > 0 &&
    rounded <= maxWeight &&
    Number.isInteger(repCount) &&
    repCount >= 1 &&
    repCount <= maxReps
  )
}

export function estimatedOneRepMax(weight: number, reps: number): number {
  return reps === 1 ? weight : weight * (1 + reps / 30)
}
