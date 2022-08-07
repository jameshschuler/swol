import { checkInErrorMessage, checkInSuccessMessage, loadCheckInsErrorMessage } from '@/models/constants';
import { GymCheckIn } from '@/models/db';
import { Entities, ToastType } from '@/models/enums';
import { supabase } from '@/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToastStore } from './toasts';
import { useUserStore } from './user';

export const useCheckInStore = defineStore( 'checkIn', () => {
    const checkIns = ref<Array<GymCheckIn>>( [] );
    const supabaseError = ref<PostgrestError | null>( null );
    const processing = ref<boolean>( false );

    async function getCheckIns () {
        supabaseError.value = null;

        try {
            const { data, error } = await supabase.from<GymCheckIn>( Entities.GymCheckIn );
            if ( error ) {
                const toast = useToastStore();
                supabaseError.value = error;
                toast.addToast( {
                    type: ToastType.Error,
                    message: loadCheckInsErrorMessage,
                } );
            } else {
                checkIns.value = data || [];
            }
        } catch ( err ) {
            console.error( err );
        }
    }

    async function addCheckIn (): Promise<GymCheckIn | null> {
        supabaseError.value = null;
        processing.value = true;

        try {
            const user = useUserStore();
            const now = dayjs.utc().format();

            const { data, error } = await supabase.from<GymCheckIn>( Entities.GymCheckIn ).insert( {
                user_id: user.user?.id,
                checkin_date: now,
            } ).single();

            const toast = useToastStore();
            if ( error ) {
                toast.addToast( {
                    type: ToastType.Error,
                    message: checkInErrorMessage,
                } );
                supabaseError.value = error;
                return null;
            } else {
                toast.addToast( {
                    type: ToastType.Success,
                    message: checkInSuccessMessage,
                } );
                checkIns.value = [ ...checkIns.value, data ];
                return data;
            }
        } catch ( err ) {
            console.error( err );
            return null;
        } finally {
            processing.value = false;
        }
    }

    return {
        addCheckIn,
        getCheckIns,
        checkIns,
        error: supabaseError,
        processing
    }
} );