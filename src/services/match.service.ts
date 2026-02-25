import { supabase } from '@/config/supabase';
import { 
  DiscoveryResponse, 
  Like, 
  Match, 
  LikeType,
  PaginatedResponse,
  Profile
} from '@/types';

class MatchService {
  async getDiscoveryProfiles(limit: number = 10, offset: number = 0): Promise<DiscoveryResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get IDs the user already liked or passed
    const { data: likedIds } = await supabase
      .from('likes')
      .select('to_user_id')
      .eq('from_user_id', user.id);

    const excludeIds = [user.id, ...(likedIds || []).map((l: any) => l.to_user_id)];

    // Fetch profiles not yet seen
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .eq('is_verified', true)
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    // Fetch photos for each profile
    const profilesWithPhotos = await Promise.all(
      (profiles || []).map(async (profile: any) => {
        const { data: photos } = await supabase
          .from('photos')
          .select('*')
          .eq('user_id', profile.id)
          .order('position');
        return { ...profile, photos: photos || [] };
      })
    );

    return {
      profiles: profilesWithPhotos as Profile[],
      daily_reveals_remaining: 10,
      has_more: (profiles || []).length === limit,
    };
  }

  async sendLike(userId: string, type: LikeType, note?: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Insert the like
    const { data: like, error } = await supabase
      .from('likes')
      .insert({
        from_user_id: user.id,
        to_user_id: userId,
        type,
        note,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Check if the other user already liked us (mutual match)
    const { data: mutualLike } = await supabase
      .from('likes')
      .select('*')
      .eq('from_user_id', userId)
      .eq('to_user_id', user.id)
      .single();

    if (mutualLike) {
      // Create a match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          user1_id: user.id,
          user2_id: userId,
          status: 'active',
          current_stage: 'chat',
        })
        .select()
        .single();

      if (matchError) throw new Error(matchError.message);

      return { ...like, is_mutual_match: true, match };
    }

    return { ...like, is_mutual_match: false, match: null };
  }

  async sendPass(userId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Record the pass as a 'pass' type like to exclude from discovery
    await supabase
      .from('likes')
      .insert({
        from_user_id: user.id,
        to_user_id: userId,
        type: 'pass',
      });
  }

  async getMatches(
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<Match>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('matches')
      .select('*', { count: 'exact' })
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: matches, error, count } = await query;
    if (error) throw new Error(error.message);

    // Fetch the other user's profile for each match
    const matchesWithProfiles = await Promise.all(
      (matches || []).map(async (match: any) => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single();

        const { data: photos } = await supabase
          .from('photos')
          .select('*')
          .eq('user_id', otherUserId)
          .order('position');

        return {
          ...match,
          other_user: { ...otherProfile, photos: photos || [] },
        };
      })
    );

    return {
      data: matchesWithProfiles as Match[],
      total: count || 0,
      limit,
      offset,
      has_more: (matches || []).length === limit,
    };
  }

  async unlockStage(matchId: string): Promise<Match> {
    const stages = ['chat', 'voice', 'video', 'reveal'];
    
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const currentIndex = stages.indexOf(match.current_stage);
    const nextStage = stages[Math.min(currentIndex + 1, stages.length - 1)];

    const { data: updated, error } = await supabase
      .from('matches')
      .update({ current_stage: nextStage, updated_at: new Date().toISOString() })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated as Match;
  }
}

export const matchService = new MatchService();
