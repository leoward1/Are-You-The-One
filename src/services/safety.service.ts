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
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return checkin as SafetyCheckin;
  }

  async updateLocation(checkinId: string, coords: Coordinates): Promise<SafetyCheckin> {
    const { data: checkin, error } = await supabase
      .from('safety_checkins')
      .update({
        last_latitude: coords.latitude,
        last_longitude: coords.longitude,
        updated_at: new Date().toISOString(),
      })
      .eq('id', checkinId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return checkin as SafetyCheckin;
  }

  async completeCheckin(checkinId: string): Promise<SafetyCheckin> {
    const { data: checkin, error } = await supabase
      .from('safety_checkins')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', checkinId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return checkin as SafetyCheckin;
  }

  async triggerSOS(checkinId: string): Promise<SafetyCheckin> {
    const { data: checkin, error } = await supabase
      .from('safety_checkins')
      .update({
        status: 'sos_triggered',
        updated_at: new Date().toISOString(),
      })
      .eq('id', checkinId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return checkin as SafetyCheckin;
  }
}

export const safetyService = new SafetyService();
