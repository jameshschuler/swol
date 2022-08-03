import { UserProfile } from '@/models/db';
import { useCommonStore } from '@/stores/common';
import { useUserStore } from '@/stores/user';
import { supabase } from '@/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

export function useUpdateUserProfile () {
    const fetching = ref<boolean>();
    const apiError = ref<PostgrestError | null>();

    async function updateUserProfile (): Promise<UserProfile | null> {
        const { user, profile } = storeToRefs( useUserStore() );
        const common = useCommonStore();

        const preferredProvider = 'google'; // TODO: make this a setting?
        const identity = user.value?.identities?.find( ( i ) => i.provider === preferredProvider );
        const identityData = identity?.identity_data;

        if ( !user || !identityData ) {
            return null;
        }

        const { avatar_url, full_name, picture } = identityData;

        let username = identityData.username;
        if ( !username && user?.value?.user_metadata ) {
            username = user.value.user_metadata.preferred_username ?? user.value.user_metadata.user_name;
        }

        const payload: UserProfile = {
            avatar_url,
            full_name,
            picture_url: picture,
            username,
            updated_at: dayjs().utc().format(),
            synced_profile: true
        };

        try {
            common.isBackgroundLoading = true;
            apiError.value = null;
            fetching.value = true;

            const { data, error } = await supabase.from<UserProfile>( 'user_profile' )
                .update( payload )
                .match( { user_id: payload.user_id } )
                .single();

            if ( error ) {
                apiError.value = error;
                return null;
            }

            profile.value = data;

            return data;
        } catch ( err ) {
            console.error( err );
            return null;
        } finally {
            fetching.value = false;
            common.isBackgroundLoading = false;
        }
    }

    return {
        updateUserProfile,
        error: apiError,
        fetching
    }
}