import { reactive } from 'vue';
import { defaultKilogramPlateSet, defaultPoundPlateSet } from './models/constants';
import { SelectablePlate } from './models/selectablePlate';

interface StoreState {
    selectablePoundPlates: SelectablePlate[];
    selectableKilogramPlates: SelectablePlate[];
}

// TODO: move to pinia stores
export const store = reactive<StoreState>( {
    selectablePoundPlates: defaultPoundPlateSet,
    selectableKilogramPlates: defaultKilogramPlateSet,
} );