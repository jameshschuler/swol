import { checkInErrorMessage, checkInSuccessMessage, loadCheckInsErrorMessage, removeCheckInErrorMessage, removeCheckInSuccessMessage } from '@/models/constants';
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

    async function addCheckIn ( selectedDate?: string ): Promise<GymCheckIn | null> {
        supabaseError.value = null;
        processing.value = true;

        try {
            const user = useUserStore();

            const { data, error } = await supabase.from<GymCheckIn>( Entities.GymCheckIn ).insert( {
                user_id: user.user?.id,
                checkin_date: selectedDate ? dayjs( selectedDate ).utc().format() : dayjs.utc().format(),
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

    async function removeCheckIn ( checkInId: number ): Promise<boolean | null> {
        supabaseError.value = null;
        processing.value = true;

        try {
            const user = useUserStore();

            const { data, error } = await supabase.from<GymCheckIn>( Entities.GymCheckIn )
                .delete()
                .match( {
                    id: checkInId,
                    user_id: user.user?.id,
                } )
                .single();

            const toast = useToastStore();
            if ( error ) {
                toast.addToast( {
                    type: ToastType.Error,
                    message: removeCheckInErrorMessage,
                } );
                supabaseError.value = error;
                return null;
            } else {
                toast.addToast( {
                    type: ToastType.Success,
                    message: removeCheckInSuccessMessage,
                } );

                checkIns.value = checkIns.value.filter( c => c.id !== data.id );
                return true;
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
        processing,
        removeCheckIn
    }
} );