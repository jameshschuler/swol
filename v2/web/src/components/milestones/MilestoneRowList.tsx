import type { PersonalRecord } from '#/lib/milestones'
import type { Milestone, WeightUnit } from '#/types/api'
import { MilestoneRow } from './MilestoneRow'

export function MilestoneRowList({
  milestones,
  records,
  unit,
}: {
  milestones: Milestone[]
  records: Map<string, PersonalRecord>
  unit: WeightUnit
}) {
  return (
    <ul className="flex flex-col gap-2">
      {milestones.map((milestone) => (
        <MilestoneRow
          key={milestone.id}
          milestone={milestone}
          unit={unit}
          record={records.get(milestone.id)}
        />
      ))}
    </ul>
  )
}
