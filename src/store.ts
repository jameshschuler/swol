import { reactive } from 'vue';
import { FormulaFunc, formulas } from './models/formula';

interface StoreState {
    calculatedMaxes: Map<string, string>;
    calculateMaxes: ( weight: number, reps: number ) => void;
    showResults: boolean;
}

export const store = reactive<StoreState>( {
    showResults: false,
    calculatedMaxes: new Map<string, string>(),
    calculateMaxes ( weight: number, reps: number ) {
        this.calculatedMaxes.clear();

        formulas.forEach( ( func: FormulaFunc, k: string ) => {
            this.calculatedMaxes.set( k, func( weight, reps ).toFixed( 2 ) );
        } );

        this.showResults = true;
    }
} );