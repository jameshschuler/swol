import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCommonStore = defineStore( 'common', () => {
    const isBackgroundLoading = ref<boolean>( false );
    const isAppLoading = ref<boolean>( false );
    const isDrawerOpen = ref<boolean>( false );

    function toggleDrawer () {
        isDrawerOpen.value = !isDrawerOpen.value;
    }

    return {
        isAppLoading,
        isBackgroundLoading,
        isDrawerOpen,
        toggleDrawer
    }
} );