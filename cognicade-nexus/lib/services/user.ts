
import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/types';

export async function getUserProfile(supabase: SupabaseClient, userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    return data;
}
