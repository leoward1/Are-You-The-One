import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const OfflineBanner: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.banner, { paddingTop: insets.top + 6 }]}>
      <Text style={styles.text}>📡  No internet connection</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    paddingBottom: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
