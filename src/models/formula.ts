export type FormulaFunc = ( weight: number, reps: number ) => number;

export const formulas = new Map<string, FormulaFunc>( [
    // weight * (36 / (37 - reps))
    [ "Brzycki", ( weight: number, reps: number ) => { return weight * ( 36 / ( 37 - reps ) ); } ],

    // weight * (1 + 0.0333 × reps)
    [ "Epley", ( weight: number, reps: number ) => { return weight * ( 1 + 0.0333 * reps ); } ],

    // (100 × weight) / (101.3 - 2.67123 × reps)
    [ "Lander", ( weight: number, reps: number ) => { return ( 100 * weight ) / ( 101.3 - 2.67123 * reps ) } ]
] );