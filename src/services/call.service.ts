// Video call service - temporarily disabled for Android build
// import Daily, { DailyCall } from '@daily-co/react-native-daily-js';

export const callService = {
  createCall: async () => {
    console.log('Video calls temporarily disabled');
    return null;
  },
  joinCall: async () => null,
  leaveCall: async () => null,
  endCall: async () => null,
};
