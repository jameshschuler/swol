import { UserProfile } from '@/models/db';
import { Entities } from '@/models/enums';
import { supabase } from '@/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useCommonStore } from './common';
import { useUserStore } from './user';

export const useProfileStore = defineStore( 'profile', () => {
    const profile = ref<UserProfile | null>( null );
    const supabaseError = ref<PostgrestError | null>( null );

    async function getProfile () {
        supabaseError.value = null;

        try {
            const { data, error } = await supabase.from<UserProfile>( Entities.UserProfile )
                .select()
                .single();

            if ( error ) {
                supabaseError.value = error;
            } else {
                profile.value = data || [];
            }
        } catch ( err ) {
            console.error( err );
        }
    }

    async function updateProfile () {
        const userStore = useUserStore();

        const user = userStore.user;
        const preferredProvider = 'google'; // TODO: make this a setting?
        const identity = user?.identities?.find( ( i ) => i.provider === preferredProvider );
        const identityData = identity?.identity_data;

        if ( !user || !identityData ) {
            return null;
        }

        const { avatar_url, full_name, picture } = identityData;

        let username = identityData.username;
        if ( !username && user?.user_metadata ) {
            username = user.user_metadata.preferred_username ?? user.user_metadata.user_name;
        }

        const payload: UserProfile = {
            avatar_url,
            full_name,
            picture_url: picture,
            username,
            updated_at: dayjs().utc().format(),
            synced_profile: true
        };

        const common = useCommonStore();
        try {
            common.isBackgroundLoading = true;
            supabaseError.value = null;

            const { data, error } = await supabase.from<UserProfile>( 'user_profile' )
                .update( payload )
                .match( { user_id: payload.user_id } )
                .single();

            if ( error ) {
                supabaseError.value = error;
                return null;
            }

            profile.value = data;

            return data;
        } catch ( err ) {
            console.error( err );
            return null;
        } finally {
            common.isBackgroundLoading = false;
        }
    }

    return {
        error: supabaseError,
        profile,
        getProfile,
        updateProfile
    }
} );