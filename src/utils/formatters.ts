import { formatDistanceToNow, format, differenceInYears } from 'date-fns';

export const formatDistance = (miles: number): string => {
  if (miles < 1) {
    return 'Less than 1 mile away';
  }
  if (miles === 1) {
    return '1 mile away';
  }
  return `${Math.round(miles)} miles away`;
};

export const formatAge = (birthdate: string): number => {
  return differenceInYears(new Date(), new Date(birthdate));
};

export const formatTimeAgo = (date: string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDate = (date: string, formatString: string = 'MMM d, yyyy'): string => {
  return format(new Date(date), formatString);
};

export const formatTime = (date: string): string => {
  return format(new Date(date), 'h:mm a');
};

export const formatDateTime = (date: string): string => {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatMessageTime = (date: string): string => {
  const messageDate = new Date(date);
  const now = new Date();
  const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return format(messageDate, 'h:mm a');
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) {
    return format(messageDate, 'EEEE');
  } else {
    return format(messageDate, 'MMM d');
  }
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

export const formatHeight = (inches: number): string => {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatInterests = (interests: string[]): string => {
  if (interests.length === 0) return '';
  if (interests.length === 1) return interests[0];
  if (interests.length === 2) return interests.join(' and ');
  
  const last = interests[interests.length - 1];
  const rest = interests.slice(0, -1);
  return `${rest.join(', ')}, and ${last}`;
};
