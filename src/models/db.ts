export interface GymCheckIn {
    id: number;
    checkin_date: string;
    created_at: string;
    user_id: string;
}

export interface UserProfile {
    id?: number;
    created_at?: string;
    user_id?: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    picture_url?: string;
    username?: string;
    updated_at: string;
    synced_profile: boolean;
}