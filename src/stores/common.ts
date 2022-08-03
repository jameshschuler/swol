import { defineStore } from 'pinia';
import { ref } from 'vue';

interface CommonStore {
    isBackgroundLoading: boolean;
}

export const useCommonStore = defineStore( 'common', () => {
    const isBackgroundLoading = ref<boolean>( false );

    return {
        isBackgroundLoading
    }
} );