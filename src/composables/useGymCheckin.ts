import { GymCheckIn } from '@/models/db';
import { useUserStore } from '@/stores/user';
import { supabase } from '@/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { ref } from 'vue';

export function useGymCheckIn () {
    const fetching = ref<boolean>();
    const apiError = ref<PostgrestError | null>();
    const { user } = useUserStore();

    async function addCheckin (): Promise<GymCheckIn | null> {
        try {
            apiError.value = null;
            fetching.value = true;

            const now = dayjs.utc().format();
            const { data, error } = await supabase.from<GymCheckIn>( 'gym_checkin' ).insert( {
                user_id: user?.id,
                checkin_date: now,
            } ).single();

            if ( error ) {
                apiError.value = error;
                return null;
            }

            return data;
        } catch ( err ) {
            console.error( err );
            return null;
        } finally {
            fetching.value = false;
        }
    }

    return {
        addCheckin,
        error: apiError,
        fetching
    }
}