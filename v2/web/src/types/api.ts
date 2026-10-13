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
}

export interface LegacyCheckIn {
  id: number
  checkedInAt: string
}
