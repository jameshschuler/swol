import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCommonStore = defineStore( 'common', () => {
    const isBackgroundLoading = ref<boolean>( false );

    return {
        isBackgroundLoading
    }
} );