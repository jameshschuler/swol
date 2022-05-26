export interface CalculateMaxForm {
    unit: string;
    weight?: number;
    reps: number;
}

export interface CalculateMaxFormErrors {
    weight?: boolean;
}

export interface CalculateBarloadForm {
    unit: string;
    weight?: number;
}

export interface CalculateBarloadFormErrors {
    weight?: boolean;
}