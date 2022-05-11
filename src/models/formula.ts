export type FormulaFunc = ( weight: number, reps: number ) => number;

export const formulas = new Map<string, FormulaFunc>( [
    // weight * (36 / (37 - reps))
    [ "Brzycki", ( weight: number, reps: number ) => { return weight * ( 36 / ( 37 - reps ) ); } ],

    // weight * (1 + 0.0333 × reps)
    [ "Epley", ( weight: number, reps: number ) => { return weight * ( 1 + 0.0333 * reps ); } ],

    // (100 × weight) / (101.3 - 2.67123 × reps)
    [ "Lander", ( weight: number, reps: number ) => { return ( 100 * weight ) / ( 101.3 - 2.67123 * reps ) } ],

    // weight × reps ^ 0.1
    [ "Lombardi", ( weight: number, reps: number ) => { return weight * reps ** 0.1; } ],

    // (100 × weight) / (52.2 + (41.9 × e-0.055 × reps))
    [ "Mayhew et al.", ( weight: number, reps: number ) => { return ( 100 * weight ) / ( 52.2 + ( 41.9 * Math.pow( Math.E, - 0.055 * reps ) ) ); } ],

    // weight × (1 + 0.025 × reps)
    [ "O’Conner et al.", ( weight: number, reps: number ) => { return weight * ( 1 + 0.025 * reps ); } ],

    // (100 × weight) / (48.8 + (53.8 × e ^ -0.075 × reps))
    [ "Wathan", ( weight: number, reps: number ) => { return ( 100 * weight ) / ( 48.8 + ( 53.8 * Math.E ** ( -0.075 * reps ) ) ); } ]
] );