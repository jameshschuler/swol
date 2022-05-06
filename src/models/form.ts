export interface CalculateMaxForm {
    unit: string;
    weight?: number;
    reps: number;
}

export interface CalculateMaxFormErrors {
    weight?: boolean;
}