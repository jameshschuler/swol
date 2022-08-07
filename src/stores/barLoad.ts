import { UnitOfMeasure } from '@/models/enums';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBarLoadStore = defineStore( 'barLoad', () => {
    const selectedPlateSetUom = ref<UnitOfMeasure>( UnitOfMeasure.Pound );

    return {
        selectedPlateSetUom
    }
} );