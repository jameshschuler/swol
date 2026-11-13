export type WeightUnit = 'lb' | 'kg'

export interface Me {
  id: string
  email: string
  weightUnit: WeightUnit
}

export type SessionStatus = 'active' | 'paused' | 'completed'

export type SessionKind = 'workout' | 'check_in'

export interface WorkoutSession {
  id: string
  kind: SessionKind
  status: SessionStatus
  startedAt: string
  pausedAt: string | null
  pausedSeconds: number
  endedAt: string | null
  notes: string | null
  createdAt: string
}

export interface LegacyCheckIn {
  id: number
  checkedInAt: string
}

export interface Exercise {
  id: string
  userId: string | null
  name: string
  baseExerciseId: string | null
}

export interface Milestone {
  id: string
  exerciseId: string
  exerciseName: string
  baseExerciseId: string | null
  baseExerciseName: string | null
  weight: number
  unit: WeightUnit
  weightKg: number
  reps: number
  rpe: number | null
  achievedAt: string
  note: string | null
}

export interface NewMilestone {
  exerciseId: string
  weight: number
  unit: WeightUnit
  reps: number
  rpe: number | null
  achievedAt: string
  note: string
}

export interface Goal {
  id: string
  exerciseId: string
  exerciseName: string
  targetWeight: number
  unit: WeightUnit
  targetWeightKg: number
  targetReps: number
  completedAt: string | null
  completedMilestoneId: string | null
  createdAt: string
}
