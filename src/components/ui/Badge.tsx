import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../utils/constants';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary + '20';
      case 'secondary':
        return COLORS.secondary + '40';
      case 'success':
        return COLORS.success + '20';
      case 'warning':
        return COLORS.warning + '20';
      case 'error':
        return COLORS.error + '20';
      case 'info':
        return COLORS.info + '20';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.text;
      case 'success':
        return COLORS.success;
      case 'warning':
        return COLORS.warning;
      case 'error':
        return COLORS.error;
      case 'info':
        return COLORS.info;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        size === 'small' ? styles.small : styles.medium,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'small' ? styles.smallText : styles.mediumText,
          { color: getTextColor() },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  small: {
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
  },
  medium: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  text: {
    fontFamily: FONTS.medium,
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
});

export default Badge;
