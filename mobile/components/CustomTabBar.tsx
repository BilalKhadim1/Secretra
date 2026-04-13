import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path, Rect, Line, Circle, Polyline } from 'react-native-svg';

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

const IconHome = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? '#e87a6e' : 'none'} stroke={active ? 'none' : '#9ca3af'} strokeWidth="2">
    <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconTabCalendar = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? '#e87a6e' : '#9ca3af'} strokeWidth="2">
    <Rect x="3" y="4" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
    <Line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
    <Line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
  </Svg>
);

const IconTabCheck = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? '#e87a6e' : '#9ca3af'} strokeWidth="2">
    <Path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconTabMail = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? '#e87a6e' : '#9ca3af'} strokeWidth="2">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconTabUser = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? '#e87a6e' : '#9ca3af'} strokeWidth="2">
    <Circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M20 21a8 8 0 10-16 0" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const getIcon = (name: string, active: boolean) => {
  switch (name) {
    case 'dashboard':
      return <IconHome active={active} />;
    case 'tasks':
      return <IconTabCheck active={active} />;
    case 'calendar':
      return <IconTabCalendar active={active} />;
    case 'overview':
      return <IconTabMail active={active} />;
    case 'settings':
      return <IconTabUser active={active} />;
    default:
      return <IconHome active={active} />;
  }
};

const getLabel = (name: string) => {
  switch (name) {
    case 'dashboard':
      return 'Home';
    case 'tasks':
      return 'Tasks';
    case 'calendar':
      return 'Calendar';
    case 'overview':
      return 'Log'; // Or Mail as per user's preference
    case 'settings':
      return 'Profile';
    default:
      return name;
  }
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {getIcon(route.name, isFocused)}
              <Text style={[styles.label, { color: isFocused ? '#e87a6e' : '#9ca3af' }]}>
                {getLabel(route.name)}
              </Text>
              {isFocused && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, // Docked to bottom
    left: 0,
    right: 0,
    backgroundColor: '#f6f5f3', // Match dashboard background for seamless docking
    paddingBottom: 20, // Safe area padding
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e87a6e',
    marginTop: 2,
  },
});
