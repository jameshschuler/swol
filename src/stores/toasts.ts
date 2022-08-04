import { Toast } from '@/models/toast';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore( 'toasts', () => {
    const toasts = ref<Array<Toast>>( [] );

    function addToast ( toast: Toast ) {
        toasts.value.push( toast )
    }

    function removeToast () {
        toasts.value.shift();
    }

    return {
        toasts,
        addToast,
        removeToast
    }
} );