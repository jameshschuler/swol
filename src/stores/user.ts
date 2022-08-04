import { UserProfile } from '@/models/db';
import { User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore( 'user', () => {
    const user = ref<User | null | undefined>( null );
    const profile = ref<UserProfile | null>( null );

    const isAuthenticated = computed( () => !isNullOrUndefined( user.value ) );

    return {
        user,
        profile,
        isAuthenticated
    }
} );

function isNullOrUndefined ( obj: any ): boolean {
    return obj === undefined || obj === null;
}