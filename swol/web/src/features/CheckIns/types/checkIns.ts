export interface Activity {
  name: string
  id: number
}

export interface CheckIn {
  id: number;
  checkinDate: string;
  notes: string | null;
  activity: {
    id: number;
    name: string;
  };
  program: {
    id: number;
    name: string;
  } | null;
}

export type CheckInDisplayItem = Map<string, Map<string, Map<string, { id: number, activity: Activity, originalDate: string }[]>>>
