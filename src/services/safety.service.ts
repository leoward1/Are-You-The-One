import { supabase } from '@/config/supabase';
import { SafetyCheckin, Coordinates } from '@/types';

interface StartCheckinData {
  meeting_with: string;
  expected_end: string;
  auto_alert_minutes: number;
  emergency_contact_email?: string;
  emergency_contact_phone?: string;
}

class SafetyService {
  async startCheckin(data: StartCheckinData): Promise<SafetyCheckin> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: checkin, error } = await supabase
      .from('safety_checkins')
      .insert({
        user_id: user.id,
        meeting_with: data.meeting_with,
        expected_end: data.expected_end,
        auto_alert_minutes: data.auto_alert_minutes,
        emergency_contact_email: data.emergency_contact_email || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        status: 'active',
        is_date_mode: false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return checkin as SafetyCheckin;
  }

  async startDateMode(matchId: string | null, partnerName: string): Promise<SafetyCheckin> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const expectedEnd = new Date();
    expectedEnd.setHours(expectedEnd.getHours() + 2); // Default 2 hours

    const { data: checkin, error } = await supabase
      .from('safety_checkins')
      .insert({
        user_id: user.id,
        match_id: matchId,
        meeting_with: partnerName,
        expected_end: expectedEnd.toISOString(),
        auto_alert_minutes: 120,
        status: 'active',
        is_date_mode: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return checkin as SafetyCheckin;
  }

  async updateLocation(checkinId: string, coords: Coordinates): Promise<SafetyCheckin> {
    // SECURITY: Verify user owns this checkin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: checkin, error } = await supabase
      .from('safety_checkins')
      .update({
        last_latitude: coords.latitude,
        last_longitude: coords.longitude,
        updated_at: new Date().toISOString(),
      })
      .eq('id', checkinId)
      .eq('user_id', user.id) // SECURITY: ownership check
      .select()
      .single();

    if (error) throw new Error(error.message);
    return checkin as SafetyCheckin;
  }

  async completeCheckin(checkinId: string): Promise<SafetyCheckin> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: checkin, error } = await supabase
      .from('safety_checkins')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', checkinId)
      .eq('user_id', user.id) // SECURITY: ownership check
      .select()
      .single();

    if (error) throw new Error(error.message);
    return checkin as SafetyCheckin;
  }

  async triggerSOS(checkinId: string): Promise<SafetyCheckin> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: checkin, error } = await supabase
      .from('safety_checkins')
      .update({
        status: 'sos_triggered',
        updated_at: new Date().toISOString(),
      })
      .eq('id', checkinId)
      .eq('user_id', user.id) // SECURITY: ownership check
      .select()
      .single();

    if (error) throw new Error(error.message);
    return checkin as SafetyCheckin;
  }

  async extendCheckin(checkinId: string, newEndTime: string): Promise<SafetyCheckin> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: checkin, error } = await supabase
      .from('safety_checkins')
      .update({
        expected_end: newEndTime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', checkinId)
      .eq('user_id', user.id) // SECURITY: ownership check
      .select()
      .single();

    if (error) throw new Error(error.message);
    return checkin as SafetyCheckin;
  }
}

export const safetyService = new SafetyService();
