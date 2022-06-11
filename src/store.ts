import { reactive } from 'vue';
import { defaultKilogramPlateSet, defaultPoundPlateSet } from './models/constants';
import { UnitOfMeasure } from './models/enums';
import { FormulaFunc, formulas } from './models/formula';
import { SelectableBarbell } from './models/selectableBarbell';
import { SelectablePlate } from './models/selectablePlate';

// TODO: replace with pinia

interface StoreState {
    calculatedMaxes: Map<string, string>;
    calculateMaxes: ( weight: number, reps: number ) => void;
    showResults: boolean;
    selectablePoundPlates: SelectablePlate[];
    selectableKilogramPlates: SelectablePlate[];
    selectedPlateUnitOfMeasure: UnitOfMeasure;
    selectedBarbell: SelectableBarbell;
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
    },
    selectablePoundPlates: defaultPoundPlateSet,
    selectableKilogramPlates: defaultKilogramPlateSet,
    selectedPlateUnitOfMeasure: UnitOfMeasure.Pound,
    selectedBarbell: {
        weight: 45,
        unitOfMeasure: UnitOfMeasure.Pound
    } as SelectableBarbell
} );