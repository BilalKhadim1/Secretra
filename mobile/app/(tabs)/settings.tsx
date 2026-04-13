import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { trpc } from '../../utils/trpc';
import { removeStorageItem } from '../../utils/storage';

const IconUser = ({ color = '#e87a6e', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21a8 8 0 00-16 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconChevronRight = ({ color = '#cbd5e1', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconLogout = ({ color = '#ff4b4b', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 17l5-5-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconShield = ({ color = '#6366f1', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { data: user, isLoading } = trpc.profile.me.useQuery();

  const handleLogout = async () => {
    try {
      await removeStorageItem('accessToken');
      await removeStorageItem('refreshToken');
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out properly');
    }
  };

  if (isLoading && !user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f14' }}>
        <ActivityIndicator size="large" color="#e87a6e" />
      </View>
    );
  }

  const initials = (user?.name || 'SJ').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f14' }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* ── Header / Hero ── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32, alignItems: 'center' }}>
          <View style={{ 
            width: 100, height: 100, borderRadius: 34, 
            backgroundColor: '#1e1e26', alignItems: 'center', justifyContent: 'center',
            borderWidth: 1, borderColor: '#ffffff10', marginBottom: 20
          }}>
            <Text style={{ color: '#e87a6e', fontSize: 32, fontWeight: '900' }}>{initials}</Text>
          </View>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 4 }}>
            {user?.name || 'User Name'}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '500' }}>
            {user?.email || 'user@example.com'}
          </Text>
          
          <TouchableOpacity 
            style={{ 
              marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, 
              borderRadius: 12, backgroundColor: '#ffffff08', 
              borderWidth: 1, borderColor: '#ffffff14' 
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── Body ── */}
        <View style={{ 
          backgroundColor: '#f6f5f3', borderTopLeftRadius: 36, borderTopRightRadius: 36, 
          paddingHorizontal: 22, paddingTop: 32, paddingBottom: 100, flex: 1, minHeight: 400
        }}>
          
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16, marginLeft: 6 }}>
            Account Settings
          </Text>

          {/* Settings Group */}
          <View style={{ backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', marginBottom: 24 }}>
            {[
              { id: 'security', label: 'Privacy & Security', Icon: IconShield, color: '#6366f1', bg: '#eef0ff' },
              { id: 'account', label: 'Connected Accounts', Icon: IconUser, color: '#e87a6e', bg: '#fff0ee' },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.id}
                style={{
                  flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14,
                  borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#f1f5f9'
                }}
              >
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <item.Icon color={item.color} size={20} />
                </View>
                <Text style={{ flex: 1, color: '#0f172a', fontSize: 15, fontWeight: '600' }}>{item.label}</Text>
                <IconChevronRight />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16, marginLeft: 6 }}>
            Session
          </Text>

          {/* Logout Button */}
          <View style={{ backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden' }}>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14,
              }}
            >
              <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: '#fff1f1', alignItems: 'center', justifyContent: 'center' }}>
                <IconLogout color="#ff4b4b" size={20} />
              </View>
              <Text style={{ flex: 1, color: '#ff4b4b', fontSize: 15, fontWeight: '700' }}>Log Out</Text>
              <IconChevronRight color="#ff4b4b20" />
            </TouchableOpacity>
          </View>

          <Text style={{ textAlign: 'center', marginTop: 32, color: '#9ca3af', fontSize: 12, fontWeight: '500' }}>
            Personal Secretary v1.0.0
          </Text>

        </View>
      </ScrollView>
    </View>
  );
}
