// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, Pressable, Switch, Platform, 
} from 'react-native';
import { 
  BottomSheetModal, 
  BottomSheetView, 
  BottomSheetScrollView, 
  BottomSheetTextInput, 
  BottomSheetBackdrop 
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import Svg, { Path, Circle } from 'react-native-svg';
import { trpc } from '../../utils/trpc';
import { removeStorageItem } from '../../utils/storage';

const NAVY = '#111827';
const CORAL = '#e87a6e';

// ─── Icons ───────────────────────────────────────────────────────────────────

const Icon = {
  User: ({ color = '#e87a6e', size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21a8 8 0 00-16 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" />
    </Svg>
  ),
  Users: ({ color = '#06b6d4', size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" />
      <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  X: ({ color = '#94a3b8', size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  ChevronRight: ({ color = '#94a3b8', size = 16 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Logout: ({ color = '#ef4444', size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Shield: ({ color = '#6366f1', size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Bell: ({ color = '#f59e0b', size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Palette: ({ color = '#ec4899', size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.55 0 1-.45 1-1v-1.08c0-.27-.11-.52-.29-.71-.18-.19-.29-.44-.29-.71 0-.55.45-1 1-1h1.5c2.76 0 5-2.24 5-5C21 6.13 16.97 2 12 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="6.5" cy="11.5" r="1" fill={color} />
      <Circle cx="9.5" cy="7.5" r="1" fill={color} />
      <Circle cx="14.5" cy="7.5" r="1" fill={color} />
      <Circle cx="17.5" cy="11.5" r="1" fill={color} />
    </Svg>
  ),
  Cloud: ({ color = '#0ea5e9', size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Help: ({ color = '#10b981', size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
      <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Camera: ({ color = '#fff', size = 18 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.8" />
    </Svg>
  ),
};

const AVATARS = ['🐼', '🦊', '🐬', '🦁', '🐸', '🦄', '🐙', '🦋', '🐺', '🦅', '🐲', '🌙'];

function ProfileScreen() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: user, isLoading } = trpc.profile.me.useQuery();

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const avatarModalRef = useRef<BottomSheetModal>(null);
  const editModalRef = useRef<BottomSheetModal>(null);
  const themeModalRef = useRef<BottomSheetModal>(null);

  const [editName, setEditName] = useState('');
  const [editTimezone, setEditTimezone] = useState('');

  const updateProfile = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      utils.profile.me.invalidate();
      setShowEditModal(false);
      editModalRef.current?.dismiss();
      Alert.alert('Success', 'Profile updated successfully');
    },
    onError: (err) => Alert.alert('Error', err.message),
  });

  useEffect(() => {
    if (showAvatarModal) avatarModalRef.current?.present();
    else avatarModalRef.current?.dismiss();
  }, [showAvatarModal]);

  useEffect(() => {
    if (showEditModal) editModalRef.current?.present();
    else editModalRef.current?.dismiss();
  }, [showEditModal]);

  useEffect(() => {
    if (showThemeModal) themeModalRef.current?.present();
    else themeModalRef.current?.dismiss();
  }, [showThemeModal]);

  const performLogout = async () => {
    try {
      await removeStorageItem('accessToken');
      await removeStorageItem('refreshToken');
      if (Platform.OS === 'web') window.location.href = '/';
      else router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) performLogout();
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: performLogout },
      ]);
    }
  };

  const handleTestNotification = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Please enable notifications in your system settings.');
          return;
        }
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Secretra Test 🔔",
          body: "Your notifications are working perfectly!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification: ' + error.message);
    }
  };

  const handleSelectPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      updateProfile.mutate({ avatarUrl: result.assets[0].uri });
      setShowAvatarModal(false);
      avatarModalRef.current?.dismiss();
    }
  };

  if (isLoading && !user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0c0c12' }}>
        <ActivityIndicator size="large" color="#e87a6e" />
      </View>
    );
  }

  const name = user?.name || 'Your Name';
  const email = user?.email || 'user@example.com';
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const theme = (user as any)?.theme || 'dark';
  const notificationsEnabled = (user as any)?.notificationsEnabled ?? true;

  const renderAvatar = () => {
    if (user?.avatarUrl && user.avatarUrl.length <= 4) return <Text style={{ fontSize: 42 }}>{user.avatarUrl}</Text>;
    return <Text style={{ color: '#e87a6e', fontSize: 30, fontWeight: '900' }}>{initials}</Text>;
  };

  const renderBackdrop = (props) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0c0c12' }}>
      
      {/* ── Avatar Modal ── */}
      <BottomSheetModal
        ref={avatarModalRef}
        index={0}
        snapPoints={['100%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#1a1a24', borderRadius: 40 }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        onChange={(i) => { if (i === -1) setShowAvatarModal(false); }}
      >
        <BottomSheetView style={{ flex: 1, padding: 32, paddingBottom: 56 }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Change Avatar</Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 32 }}>Choose an emoji or upload a photo.</Text>
          
          <TouchableOpacity
            onPress={handleSelectPhoto}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(232,122,110,0.1)', borderRadius: 24, padding: 20, marginBottom: 32, borderWith: 1, borderColor: 'rgba(232,122,110,0.2)' }}
          >
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(232,122,110,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Camera color="#e87a6e" size={24} />
            </View>
            <View>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Upload Photo</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>From your gallery</Text>
            </View>
          </TouchableOpacity>

          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Preset Avatars</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {AVATARS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => { updateProfile.mutate({ avatarUrl: emoji }); setShowAvatarModal(false); avatarModalRef.current?.dismiss(); }}
                style={{ width: 62, height: 62, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <Text style={{ fontSize: 32 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      {/* ── Edit Profile Modal ── */}
      <BottomSheetModal
        ref={editModalRef}
        index={0}
        snapPoints={['100%']}
        enablePanDownToClose
        keyboardBehavior="interactive"
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#1a1a24', borderRadius: 40 }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        onChange={(i) => { if (i === -1) setShowEditModal(false); }}
      >
        <BottomSheetView style={{ flex: 1, padding: 32, paddingBottom: 56 }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Profile Settings</Text>
          
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Display Name</Text>
            <BottomSheetTextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor="rgba(255,255,255,0.2)"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 18, color: '#fff', fontSize: 16, fontWeight: 'bold', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}
            />
          </View>

          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Timezone</Text>
            <BottomSheetTextInput
              value={editTimezone}
              onChangeText={setEditTimezone}
              placeholder="e.g. UTC, Asia/Karachi"
              placeholderTextColor="rgba(255,255,255,0.2)"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 18, color: '#fff', fontSize: 16, fontWeight: 'bold', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => { setShowEditModal(false); editModalRef.current?.dismiss(); }} style={{ flex: 1, py: 18, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => updateProfile.mutate({ name: editName, timezone: editTimezone })}
              disabled={updateProfile.isPending}
              style={[{ flex: 1, py: 18, borderRadius: 16, backgroundColor: '#e87a6e', alignItems: 'center' }, updateProfile.isPending && { opacity: 0.7 }]}
            >
              {updateProfile.isPending ? <ActivityIndicator color="white" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      {/* ── Theme Modal ── */}
      <BottomSheetModal
        ref={themeModalRef}
        index={0}
        snapPoints={['100%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#1a1a24', borderRadius: 40 }}
        handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        onChange={(i) => { if (i === -1) setShowThemeModal(false); }}
      >
        <BottomSheetView style={{ flex: 1, padding: 32, paddingBottom: 56 }}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Appearance</Text>
          <View style={{ gap: 12 }}>
            {['Light', 'Dark', 'System Default'].map((t) => {
              const val = t.toLowerCase().split(' ')[0];
              const active = theme === val;
              return (
                <TouchableOpacity 
                  key={t}
                  onPress={() => { updateProfile.mutate({ theme: val }); setShowThemeModal(false); themeModalRef.current?.dismiss(); }}
                  style={[{ padding: 20, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }, active && { backgroundColor: 'rgba(232,122,110,0.1)', borderColor: '#e87a6e' }]}
                >
                  <Text style={[{ color: '#fff', fontWeight: 'bold', fontSize: 16 }, active && { color: '#e87a6e' }]}>{t}</Text>
                  {active && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#e87a6e' }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 72, paddingBottom: 36, alignItems: 'center' }}>
          <View style={{ position: 'relative', marginBottom: 18 }}>
            <View style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: '#1a1a24', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.08)' }}>
              {renderAvatar()}
            </View>
            <TouchableOpacity onPress={() => setShowAvatarModal(true)} style={{ position: 'absolute', bottom: -2, right: -2, width: 36, height: 36, borderRadius: 12, backgroundColor: '#e87a6e', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#0c0c12' }}>
              <Icon.Camera color="#fff" size={16} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 }}>{name.toUpperCase()}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>{email}</Text>
        </View>

        <View style={{ backgroundColor: '#f6f5f3', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 20, paddingTop: 32, flex: 1, minHeight: 600 }}>
          <SectionLabel>Account Settings</SectionLabel>
          <View style={{ backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', padding: 8 }}>
            <Row label="Edit Profile" IconComp={Icon.User} iconColor="#e87a6e" iconBg="rgba(232,122,110,0.1)" isFirst onPress={() => { setEditName(user?.name || ''); setEditTimezone(user?.timezone || ''); setShowEditModal(true); }} />
            <Row label="Security" IconComp={Icon.Shield} iconColor="#6366f1" iconBg="rgba(99,102,241,0.1)" isLast />
          </View>

          <SectionLabel>Application Preferences</SectionLabel>
          <View style={{ backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', padding: 8 }}>
            <Row label="Notifications" IconComp={Icon.Bell} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.1)" isFirst right={<Switch value={notificationsEnabled} onValueChange={(val) => updateProfile.mutate({ notificationsEnabled: val })} trackColor={{ false: '#e2e8f0', true: '#e87a6e' }} thumbColor="#fff" />} />
            <Row label="Appearance" IconComp={Icon.Palette} iconColor="#ec4899" iconBg="rgba(236,72,153,0.1)" onPress={() => setShowThemeModal(true)} />
            <Row label="Sync Data" IconComp={Icon.Cloud} iconColor="#0ea5e9" iconBg="rgba(14,165,233,0.1)" isLast />
          </View>

          <SectionLabel>Help & Legal</SectionLabel>
          <View style={{ backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', padding: 8 }}>
            <Row label="Send Test Notification" IconComp={Icon.Bell} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.1)" isFirst onPress={handleTestNotification} />
            <Row label="Help Center" IconComp={Icon.Help} iconColor="#10b981" iconBg="rgba(16,185,129,0.1)" isLast />
          </View>

          <TouchableOpacity onPress={handleLogout} style={{ marginTop: 32, backgroundColor: 'white', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Icon.Logout color="#ef4444" size={20} />
            <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16 }}>Log Out</Text>
          </TouchableOpacity>

          <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginTop: 40 }}>SECRETRA v1.0.4</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const Row = ({ label, IconComp, iconColor, iconBg, isFirst, isLast, onPress, right }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, backgroundColor: 'white' }}
  >
    <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }}>
      <IconComp color={iconColor} size={20} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: '#1e293b', fontSize: 15, fontWeight: 'bold' }}>{label}</Text>
    </View>
    {right ?? <Icon.ChevronRight color="#cbd5e1" />}
  </TouchableOpacity>
);

const SectionLabel = ({ children }) => (
  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 8, marginTop: 24 }}>
    {children}
  </Text>
);

export default ProfileScreen;