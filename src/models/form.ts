export interface CalculateMaxForm {
    unit: string;
    weight?: number;
    reps: number;
}

export interface CalculateMaxFormErrors {
    weight?: boolean;
}

export interface CalculateBarLoadForm {
    unit: string;
    weight?: number;
}

export interface CalculateBarLoadFormErrors {
    weight?: boolean;
}