import { UserProfile } from '@/models/db';
import { Entities } from '@/models/enums';
import { useUserStore } from '@/stores/user';
import { supabase } from '@/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { ref } from 'vue';

export function useLoadUserProfile () {
    const fetching = ref<boolean>();
    const apiError = ref<PostgrestError | null>();

    async function fetch (): Promise<UserProfile | null> {
        const user = useUserStore();

        try {
            apiError.value = null;
            fetching.value = true;

            const { data, error } = await supabase.from<UserProfile>( Entities.UserProfile )
                .select()
                .single();

            if ( error ) {
                apiError.value = error;
                return null;
            }

            user.profile = data;

            return data;
        } catch ( err ) {
            console.error( err );
            return null;
        } finally {
            fetching.value = false;
        }
    }

    return {
        fetch,
        error: apiError,
        fetching
    }
}