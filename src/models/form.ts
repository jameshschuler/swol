export interface CalculateMaxForm {
    unit: string;
    weight?: number;
    reps: number;
}

export interface CalculateMaxFormErrors {
    weight?: boolean;
}

export interface CalculateBarLoadForm {
    weight?: number;
}

export interface CalculateBarLoadFormErrors {
    weight?: boolean;
}