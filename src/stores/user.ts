import { User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore( 'user', () => {
    const user = ref<User | null | undefined>( null );

    const isAuthenticated = computed( () => !isNullOrUndefined( user.value ) );

    return {
        user,
        isAuthenticated
    }
} );

function isNullOrUndefined ( obj: any ): boolean {
    return obj === undefined || obj === null;
}