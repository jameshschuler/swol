import { defaultKilogramPlateSet, defaultPoundPlateSet } from '@/models/constants';
import { UnitOfMeasure } from '@/models/enums';
import { SelectablePlate } from '@/models/selectablePlate';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBarLoadStore = defineStore( 'barLoad', () => {
    const selectedPlateSetUom = ref<UnitOfMeasure>( UnitOfMeasure.Pound );
    const selectablePoundPlates = ref<Array<SelectablePlate>>( defaultPoundPlateSet );
    const selectableKilogramPlates = ref<Array<SelectablePlate>>( defaultKilogramPlateSet );

    return {
        selectedPlateSetUom,
        selectablePoundPlates,
        selectableKilogramPlates
    }
} );