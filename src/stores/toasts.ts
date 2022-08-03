import { Toast } from '@/models/toast';
import { defineStore } from 'pinia';

interface ToastStore {
    toasts: Toast[]
}

// TODO: convert to composition api
export const useToastStore = defineStore( 'toasts', {
    state: () => ( {
        toasts: []
    } ) as ToastStore,
    getters: {},
    actions: {
        addToast ( toast: Toast ) {
            this.toasts.push( toast );
        },
        removeToast () {
            this.toasts.shift();
        }
    },
} );