import { apiService } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
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
    return apiService.post<SafetyCheckin>(API_ENDPOINTS.SAFETY.CHECKINS, data);
  }

  async updateLocation(checkinId: string, coords: Coordinates): Promise<SafetyCheckin> {
    return apiService.patch<SafetyCheckin>(
      API_ENDPOINTS.SAFETY.UPDATE_LOCATION(checkinId),
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
    );
  }

  async completeCheckin(checkinId: string): Promise<SafetyCheckin> {
    return apiService.post<SafetyCheckin>(API_ENDPOINTS.SAFETY.COMPLETE(checkinId));
  }

  async triggerSOS(checkinId: string): Promise<SafetyCheckin> {
    return apiService.post<SafetyCheckin>(API_ENDPOINTS.SAFETY.SOS(checkinId));
  }
}

export const safetyService = new SafetyService();
