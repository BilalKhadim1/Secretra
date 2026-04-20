import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle } from 'react-native-svg';
import { trpc } from '../../utils/trpc';
import { AddEventModal } from '../../components/AddEventModal';

const IconBack = ({ color = '#111827', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconPlus = ({ color = '#fff', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

const IconRemoveUser = ({ color = '#ef4444', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="10" cy="7" r="3.5" stroke={color} strokeWidth="1.8" />
    <Path d="M3 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M19 11h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const IconUser = ({ color = '#6b7280', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const IconUsersGroup = ({ size = 40, color = '#16a34a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="9" cy="7" r="3" stroke={color} strokeWidth="1.6" />
    <Path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Circle cx="17" cy="7" r="2.5" stroke={color} strokeWidth="1.6" />
    <Path d="M21 19c0-2.8-1.8-5.1-4-5.8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

const IconCalendar = ({ color = '#06b6d4', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" stroke={color} strokeWidth="1.8" />
    <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const IconEdit = ({ color = '#6b7280', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconLogOut = ({ color = '#ef4444', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconCamera = ({ color = '#6b7280', size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" />
  </Svg>
);

const AVATAR_COLORS = [
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#dbeafe', text: '#2563eb' },
  { bg: '#dcfce7', text: '#16a34a' },
  { bg: '#fce7f3', text: '#db2777' },
  { bg: '#ffedd5', text: '#ea580c' },
  { bg: '#e0f2fe', text: '#0284c7' },
];

const AvatarInitials = ({ email, size = 44 }: { email: string; size?: number }) => {
  const initials = email.slice(0, 2).toUpperCase();
  const color = AVATAR_COLORS[email.charCodeAt(0) % AVATAR_COLORS.length];
  const fontSize = size * 0.34;
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color.bg, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: color.text, fontWeight: '700', fontSize }}>{initials}</Text>
    </View>
  );
};

type GroupMember = {
  id: string;
  email: string;
  userId?: string | null;
  status?: 'pending' | 'accepted';
  user?: { id: string } | null;
};

type GroupWithMembers = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  members: GroupMember[];
};

// ── Modals ──────────────────────────────────────────────

const ConfirmRemoveModal = ({
  visible, member, onClose, onConfirm, loading,
}: {
  visible: boolean; member: GroupMember | null; onClose: () => void;
  onConfirm: () => void; loading: boolean;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={S.modalOverlay} onPress={onClose}>
      <Pressable style={S.modalCard}>
        <View style={[S.modalIconWrap, { backgroundColor: '#fee2e2' }]}>
          <IconRemoveUser size={22} color="#ef4444" />
        </View>
        <Text style={S.modalTitle}>Remove member?</Text>
        <Text style={S.modalBody}>
          <Text style={{ fontWeight: '600', color: '#374151' }}>{member?.email}</Text>
          {' '}will be removed from this department.
        </Text>
        <View style={S.modalActions}>
          <TouchableOpacity onPress={onClose} style={S.btnOutline}>
            <Text style={S.btnOutlineText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} disabled={loading} style={[S.btnDanger, loading && { opacity: 0.7 }]}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={S.btnDangerText}>Remove</Text>}
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

const ConfirmLeaveModal = ({
  visible, groupName, onClose, onConfirm, loading,
}: {
  visible: boolean; groupName: string; onClose: () => void;
  onConfirm: () => void; loading: boolean;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={S.modalOverlay} onPress={onClose}>
      <Pressable style={S.modalCard}>
        <View style={[S.modalIconWrap, { backgroundColor: '#fee2e2' }]}>
          <IconLogOut size={22} color="#ef4444" />
        </View>
        <Text style={S.modalTitle}>Leave department?</Text>
        <Text style={S.modalBody}>
          You will be removed from{' '}
          <Text style={{ fontWeight: '600', color: '#374151' }}>{groupName}</Text>.
          {' '}If you're the last member, the department will be deleted.
        </Text>
        <View style={S.modalActions}>
          <TouchableOpacity onPress={onClose} style={S.btnOutline}>
            <Text style={S.btnOutlineText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} disabled={loading} style={[S.btnDanger, loading && { opacity: 0.7 }]}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={S.btnDangerText}>Leave</Text>}
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

const EditGroupModal = ({
  visible, onClose, name, setName, description, setDescription,
  imageUrl, onPickImage, onTakePhoto, onSave, loading,
}: {
  visible: boolean; onClose: () => void; name: string; setName: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  imageUrl: string | null; onPickImage: () => void; onTakePhoto: () => void;
  onSave: () => void; loading: boolean;
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={S.sheetOverlay} onPress={onClose}>
      <Pressable style={S.sheet} onPress={(e) => e.stopPropagation()}>
        <View style={S.sheetHandle} />
        <Text style={S.sheetTitle}>Edit Department</Text>
        <Text style={S.sheetSubtitle}>Update department details and photo.</Text>

        <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
          <View style={{ position: 'relative' }}>
            <View style={S.groupAvatarWrap}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={S.groupAvatarImg} />
              ) : (
                <IconUsersGroup size={32} color="#9ca3af" />
              )}
            </View>
            <View style={{ position: 'absolute', bottom: 0, right: -4, flexDirection: 'row', gap: 4 }}>
              <TouchableOpacity onPress={onPickImage} style={S.miniIconBtn}>
                <IconCamera size={13} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onTakePhoto} style={S.miniIconBtn}>
                <IconCamera size={13} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={S.fieldLabel}>Department Name</Text>
        <TextInput
          placeholder="Department name"
          placeholderTextColor="#9ca3af"
          style={S.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={[S.fieldLabel, { marginTop: 14 }]}>Description</Text>
        <TextInput
          placeholder="Brief description (optional)"
          placeholderTextColor="#9ca3af"
          multiline
          style={[S.input, { minHeight: 80, textAlignVertical: 'top', marginBottom: 24 }]}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          onPress={onSave}
          disabled={loading || !name.trim()}
          style={[S.btnPrimary, (loading || !name.trim()) && { opacity: 0.4 }]}
        >
          {loading ? <ActivityIndicator color="#fff" size="small" /> : (
            <>
              <IconEdit color="#fff" size={16} />
              <Text style={S.btnPrimaryText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);

const GroupMemberModal = ({
  visible, onClose, email, setEmail, onAdd, loading,
}: {
  visible: boolean; onClose: () => void; email: string;
  setEmail: (v: string) => void; onAdd: () => void; loading: boolean;
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={S.sheetOverlay} onPress={onClose}>
      <Pressable style={S.sheet}>
        <View style={S.sheetHandle} />
        <Text style={S.sheetTitle}>Add member</Text>
        <Text style={S.sheetSubtitle}>Invite someone via their email address.</Text>

        <Text style={[S.fieldLabel, { marginBottom: 8 }]}>Email address</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="member@example.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          style={[S.input, { marginBottom: 24 }]}
        />

        <TouchableOpacity
          onPress={onAdd}
          disabled={loading || !email.trim()}
          style={[S.btnPrimary, (loading || !email.trim()) && { opacity: 0.4 }]}
        >
          {loading ? <ActivityIndicator color="#fff" size="small" /> : (
            <>
              <IconPlus color="#fff" size={16} />
              <Text style={S.btnPrimaryText}>Add member</Text>
            </>
          )}
        </TouchableOpacity>
      </Pressable>
    </Pressable>
  </Modal>
);

const MemberCalendarModal = ({
  visible, member, onClose, events, loading,
}: {
  visible: boolean; member: GroupMember | null; onClose: () => void;
  events: any[]; loading: boolean;
}) => {
  const fmt = (date: string, type: 'time' | 'date') => {
    const d = new Date(date);
    return type === 'time'
      ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={S.sheetOverlay} onPress={onClose}>
        <Pressable style={[S.sheet, { paddingBottom: 36 }]} onPress={(e) => e.stopPropagation()}>
          <View style={S.sheetHandle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 }}>
            {member && <AvatarInitials email={member.email} size={46} />}
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#111827', fontSize: 15, fontWeight: '700' }} numberOfLines={1}>{member?.email}</Text>
              <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>Availability</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={S.closeBtn}>
              <Text style={{ fontSize: 18, color: '#6b7280', lineHeight: 22 }}>×</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#111827" size="large" style={{ marginVertical: 32 }} />
          ) : events.length === 0 ? (
            <View style={{ paddingVertical: 28, alignItems: 'center' }}>
              <View style={[S.emptyIconWrap, { backgroundColor: '#ecfdf5' }]}>
                <IconCalendar color="#10b981" size={28} />
              </View>
              <Text style={S.emptyTitle}>No events scheduled</Text>
              <Text style={S.emptySubtitle}>This member is free and available</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 8 }}>
                {events.map((event: any, idx: number) => (
                  <View key={idx} style={S.eventCard}>
                    <View style={S.eventDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={S.eventTitle} numberOfLines={1}>{event.title}</Text>
                      <Text style={S.eventMeta}>
                        {fmt(event.startAt, 'date')} · {fmt(event.startAt, 'time')} – {fmt(event.endAt, 'time')}
                      </Text>
                      {event.location && (
                        <Text style={S.eventLocation}>📍 {event.location}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ── Empty state ──────────────────────────────────────────

const EmptyMembers = ({ onAdd }: { onAdd: () => void }) => (
  <View style={S.emptyState}>
    <View style={[S.emptyIconWrap, { width: 64, height: 64, borderRadius: 20, backgroundColor: '#f3f4f6' }]}>
      <IconUsersGroup size={30} color="#d1d5db" />
    </View>
    <Text style={[S.emptyTitle, { marginBottom: 6 }]}>No members yet</Text>
    <Text style={[S.emptySubtitle, { marginBottom: 24, maxWidth: 220, textAlign: 'center' }]}>
      This department is empty. Add members using their account email.
    </Text>
    <TouchableOpacity onPress={onAdd} style={S.emptyAddBtn}>
      <IconPlus color="#fff" size={14} />
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Add first member</Text>
    </TouchableOpacity>
  </View>
);

// ── Main screen ──────────────────────────────────────────

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId?: string }>();
  const groupId = typeof params.groupId === 'string' ? params.groupId : '';
  const utils = trpc.useUtils();

  const groupQuery = trpc.group.getGroup.useQuery(
    { id: groupId },
    {
      enabled: !!groupId,
      retry: false,
    }
  );
  const group = groupQuery.data as GroupWithMembers | undefined;
  const { isLoading, isError } = groupQuery;

  const { data: currentUser } = trpc.profile.me.useQuery();
  const isAdmin = group?.userId === currentUser?.id;

  const [showAddModal, setShowAddModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupImageUrl, setEditGroupImageUrl] = useState<string | null>(null);

  const selectedMemberId = selectedMember?.user?.id ?? selectedMember?.userId;

  const teamCalendarRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 30);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, []);

  const getTeamMemberCalendar = trpc.calendar.getTeamMemberCalendar.useQuery(
    {
      memberId: selectedMemberId || '',
      groupId,
      startDate: selectedMemberId ? teamCalendarRange.startDate : undefined,
      endDate: selectedMemberId ? teamCalendarRange.endDate : undefined,
    },
    {
      enabled: !!selectedMemberId && !!groupId,
      retry: false,
    }
  );

  // Handle graceful redirection if the user is removed from the group in real-time
  useEffect(() => {
    if (isError && groupQuery.error?.data?.code === 'NOT_FOUND') {
      router.replace('/(tabs)/dashboard');
    }
  }, [isError, groupQuery.error, router]);

  const addGroupMember = trpc.group.addGroupMember.useMutation({
    onSuccess: async () => {
      setMemberEmail('');
      setShowAddModal(false);
      await utils.group.getGroup.invalidate({ id: groupId });
      await utils.group.getGroups.invalidate();
    },
  });

  const removeGroupMember = trpc.group.removeGroupMember.useMutation({
    onSuccess: async () => {
      setMemberToRemove(null);
      await utils.group.getGroup.invalidate({ id: groupId });
      await utils.group.getGroups.invalidate();
    },
  });

  const leaveGroup = trpc.group.leaveGroup.useMutation({
    onSuccess: async (result) => {
      setShowLeaveConfirm(false);
      await utils.group.getGroups.invalidate();
      if (result.groupDeleted) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.back();
      }
    },
  });

  const updateGroup = trpc.group.updateGroup.useMutation({
    onSuccess: async () => {
      setShowEditGroupModal(false);
      await utils.group.getGroup.invalidate({ id: groupId });
      await utils.group.getGroups.invalidate();
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please grant photo library access'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setEditGroupImageUrl(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please grant camera access'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setEditGroupImageUrl(result.assets[0].uri);
  };

  const handleAddMember = () => {
    if (!memberEmail.trim() || !groupId) return;
    addGroupMember.mutate({ groupId, email: memberEmail.trim().toLowerCase() });
  };

  const handleConfirmRemove = () => {
    if (!memberToRemove || !groupId) return;
    removeGroupMember.mutate({ groupId, memberId: memberToRemove.id });
  };

  const handleOpenEditGroup = () => {
    if (!group) return;
    setEditGroupName(group.name);
    setEditGroupDescription(group.description || '');
    setEditGroupImageUrl(group.imageUrl);
    setShowEditGroupModal(true);
  };

  const handleSaveGroup = () => {
    if (!groupId || !editGroupName.trim()) return;
    updateGroup.mutate({
      id: groupId,
      name: editGroupName.trim(),
      description: editGroupDescription.trim() || undefined,
      imageUrl: editGroupImageUrl || undefined,
    });
  };

  // ── Shared nav bar for loading/error states ──
  const NavBar = () => (
    <View style={S.navBar}>
      <TouchableOpacity onPress={() => router.back()} style={S.navBtn}>
        <IconBack size={18} color="#111827" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) return (
    <View style={{ flex: 1, backgroundColor: '#f6f5f3' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />
      <NavBar />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    </View>
  );

  if (isError || !group) return (
    <View style={{ flex: 1, backgroundColor: '#f6f5f3' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />
      <NavBar />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={[S.emptyIconWrap, { backgroundColor: '#fee2e2', width: 64, height: 64, borderRadius: 20 }]}>
          <IconUser color="#ef4444" size={28} />
        </View>
        <Text style={[S.emptyTitle, { marginBottom: 6 }]}>Failed to load department</Text>
        <Text style={[S.emptySubtitle, { textAlign: 'center', marginBottom: 20 }]}>Something went wrong. Go back and try again.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#111827', borderRadius: 14 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f5f3' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />

      {/* ── Modals ── */}
      <GroupMemberModal
        visible={showAddModal} onClose={() => setShowAddModal(false)}
        email={memberEmail} setEmail={setMemberEmail}
        onAdd={handleAddMember} loading={addGroupMember.isPending}
      />
      <AddEventModal visible={showAddEventModal} onClose={() => setShowAddEventModal(false)} initialGroupId={groupId} />
      <ConfirmRemoveModal
        visible={!!memberToRemove} member={memberToRemove}
        onClose={() => setMemberToRemove(null)} onConfirm={handleConfirmRemove}
        loading={removeGroupMember.isPending}
      />
      <ConfirmLeaveModal
        visible={showLeaveConfirm} groupName={group?.name || 'this department'}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={() => leaveGroup.mutate({ groupId })}
        loading={leaveGroup.isPending}
      />
      <MemberCalendarModal
        visible={!!selectedMember} member={selectedMember}
        onClose={() => setSelectedMember(null)}
        events={getTeamMemberCalendar.data || []}
        loading={getTeamMemberCalendar.isLoading}
      />
      <EditGroupModal
        visible={showEditGroupModal} onClose={() => setShowEditGroupModal(false)}
        name={editGroupName} setName={setEditGroupName}
        description={editGroupDescription} setDescription={setEditGroupDescription}
        imageUrl={editGroupImageUrl} onPickImage={pickImage} onTakePhoto={takePhoto}
        onSave={handleSaveGroup} loading={updateGroup.isPending}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Hero ── */}
        <View style={S.hero}>
          {/* Top nav row */}
          <View style={S.heroNav}>
            <TouchableOpacity onPress={() => router.back()} style={S.heroNavBtn}>
              <IconBack size={18} color="#374151" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {isAdmin && (
                <TouchableOpacity onPress={handleOpenEditGroup} style={S.heroNavBtn}>
                  <IconEdit size={16} color="#374151" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowLeaveConfirm(true)} style={[S.heroNavBtn, { borderColor: 'rgba(239,68,68,0.2)' }]}>
                <IconLogOut size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Avatar */}
          <View style={S.heroAvatarWrap}>
            {group?.imageUrl ? (
              <Image source={{ uri: group.imageUrl }} style={S.heroAvatarImg} />
            ) : (
              <IconUsersGroup size={38} color="#16a34a" />
            )}
          </View>

          {/* Text */}
          <Text style={S.heroName}>{group.name}</Text>
          <Text style={S.heroMeta}>
            Department · {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
          </Text>
          {group.description ? (
            <View style={S.heroPill}>
              <Text style={S.heroPillText}>{group.description}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Members section ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>

          {/* Section header */}
          <View style={S.sectionHeader}>
            <Text style={S.sectionLabel}>MEMBERS · {group.members.length}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => setShowAddEventModal(true)} style={S.pillBtnDark}>
                <IconCalendar color="#fff" size={13} />
                <Text style={S.pillBtnDarkText}>Schedule</Text>
              </TouchableOpacity>
              {isAdmin && (
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={S.pillBtnLight}>
                  <IconPlus color="#111827" size={13} />
                  <Text style={S.pillBtnLightText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Members list */}
          {group.members.length === 0 ? (
            isAdmin ? (
              <EmptyMembers onAdd={() => setShowAddModal(true)} />
            ) : (
              <View style={S.emptyState}>
                <Text style={S.emptyTitle}>No members yet</Text>
                <Text style={S.emptySubtitle}>Only the group creator can invite new members.</Text>
              </View>
            )
          ) : (
            <View style={S.memberList}>
              {group.members.map((member: GroupMember, index: number) => {
                const memberIsActive =
                  member.status === 'accepted' || member.status == null ||
                  !!member.user?.id || !!member.userId ||
                  member.email.toLowerCase() === currentUser?.email?.toLowerCase();
                const isPending = member.status === 'pending';
                const isMe = member.email.toLowerCase() === currentUser?.email?.toLowerCase();
                const isLast = index === group.members.length - 1;

                return (
                  <TouchableOpacity
                    key={member.id}
                    onPress={() => memberIsActive && setSelectedMember(member)}
                    activeOpacity={memberIsActive ? 0.6 : 1}
                    style={[
                      S.memberRow,
                      !isLast && S.memberRowDivider,
                    ]}
                  >
                    <AvatarInitials email={member.email} size={42} />

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={S.memberEmail} numberOfLines={1}>{member.email}</Text>
                        {isMe && (
                          <View style={S.meBadge}>
                            <Text style={S.meBadgeText}>you</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
                        <View style={[S.statusDot, { backgroundColor: isPending ? '#d1d5db' : '#22c55e' }]} />
                        <Text style={S.memberStatus}>{isPending ? 'Pending invite' : 'Active'}</Text>
                      </View>
                    </View>

                    {/* Right action */}
                    {isAdmin && !isMe ? (
                      <TouchableOpacity
                        onPress={() => setMemberToRemove(member)}
                        style={S.removeBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <IconRemoveUser size={15} color="#ef4444" />
                      </TouchableOpacity>
                    ) : memberIsActive && !isAdmin ? (
                      <View style={S.calendarBadge}>
                        <IconCalendar color="#10b981" size={15} />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────

const S = {
  // Nav
  navBar: {
    backgroundColor: '#fff',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  } as const,
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },

  // Hero
  hero: {
    backgroundColor: '#f0fdf4',
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    borderBottomWidth: 1,
    borderBottomColor: '#d1fae5',
  },
  heroNav: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    width: '100%' as any,
    marginBottom: 20,
  },
  heroNavBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  heroAvatarWrap: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#dcfce7',
    borderWidth: 3, borderColor: '#fff',
    alignItems: 'center' as const, justifyContent: 'center' as const,
    marginBottom: 14,
  },
  heroAvatarImg: { width: 70, height: 70, borderRadius: 35 },
  heroName: {
    fontSize: 22, fontWeight: '800' as const, color: '#111827',
    letterSpacing: -0.4, marginBottom: 4, textAlign: 'center' as const,
  },
  heroMeta: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9,
    borderWidth: 1, borderColor: '#bbf7d0', maxWidth: 300,
  },
  heroPillText: { color: '#374151', fontSize: 13, lineHeight: 20, textAlign: 'center' as const },

  // Section
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700' as const, color: '#9ca3af',
    letterSpacing: 0.8,
  },
  pillBtnDark: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    gap: 5, backgroundColor: '#111827',
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10,
  },
  pillBtnDarkText: { color: '#fff', fontWeight: '700' as const, fontSize: 12 },
  pillBtnLight: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    gap: 5, backgroundColor: '#fff',
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  pillBtnLightText: { color: '#111827', fontWeight: '700' as const, fontSize: 12 },

  // Member list — card wrapping all rows
  memberList: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden' as const,
  },
  memberRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  memberRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  memberEmail: {
    color: '#111827', fontSize: 14, fontWeight: '600' as const,
    flexShrink: 1,
  },
  memberStatus: { color: '#9ca3af', fontSize: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  meBadge: {
    backgroundColor: '#eff6ff', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  meBadgeText: { color: '#3b82f6', fontSize: 10, fontWeight: '700' as const },
  removeBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#fecaca',
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  calendarBadge: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#ecfdf5',
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },

  // Empty states
  emptyState: {
    backgroundColor: '#fff', borderRadius: 18,
    padding: 32, alignItems: 'center' as const,
    borderWidth: 1, borderColor: '#f0f0f0',
  },
  emptyIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center' as const, justifyContent: 'center' as const,
    marginBottom: 12,
  },
  emptyTitle: { color: '#111827', fontSize: 15, fontWeight: '700' as const },
  emptySubtitle: { color: '#9ca3af', fontSize: 13, lineHeight: 20, marginTop: 4 },
  emptyAddBtn: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    gap: 7, backgroundColor: '#111827',
    paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12,
  },

  // Modal base
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center' as const, alignItems: 'center' as const, padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%' as any, maxWidth: 360,
  },
  modalIconWrap: {
    width: 50, height: 50, borderRadius: 15,
    alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '800' as const, color: '#111827', marginBottom: 8 },
  modalBody: { color: '#6b7280', fontSize: 14, lineHeight: 21, marginBottom: 24 },
  modalActions: { flexDirection: 'row' as const, gap: 10 },
  btnOutline: {
    flex: 1, paddingVertical: 13, borderRadius: 13,
    borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center' as const,
  },
  btnOutlineText: { color: '#374151', fontWeight: '600' as const, fontSize: 14 },
  btnDanger: {
    flex: 1, paddingVertical: 13, borderRadius: 13,
    backgroundColor: '#ef4444', alignItems: 'center' as const,
  },
  btnDangerText: { color: '#fff', fontWeight: '700' as const, fontSize: 14 },

  // Sheet (bottom modal)
  sheetOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' as const,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 44,
  },
  sheetHandle: {
    width: 36, height: 4, backgroundColor: '#e5e7eb',
    borderRadius: 2, alignSelf: 'center' as const, marginBottom: 22,
  },
  sheetTitle: { color: '#111827', fontSize: 20, fontWeight: '800' as const, marginBottom: 4 },
  sheetSubtitle: { color: '#9ca3af', fontSize: 13, marginBottom: 22 },

  // Form
  fieldLabel: {
    color: '#374151', fontSize: 11, fontWeight: '700' as const,
    letterSpacing: 0.7, textTransform: 'uppercase' as const, marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb',
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 13,
    fontSize: 15, color: '#111827',
  },
  btnPrimary: {
    backgroundColor: '#111827', borderRadius: 15, paddingVertical: 15,
    alignItems: 'center' as const, flexDirection: 'row' as const,
    justifyContent: 'center' as const, gap: 8,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' as const, fontSize: 15 },

  // Group avatar in edit modal
  groupAvatarWrap: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: '#f3f4f6', borderWidth: 1.5, borderColor: '#e5e7eb',
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  groupAvatarImg: { width: 74, height: 74, borderRadius: 37 },
  miniIconBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#111827',
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },

  // Calendar event card
  eventCard: {
    flexDirection: 'row' as const, alignItems: 'flex-start' as const,
    backgroundColor: '#f9fafb', borderRadius: 13, padding: 13, gap: 10,
  },
  eventDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#111827',
    marginTop: 4, flexShrink: 0,
  },
  eventTitle: { color: '#111827', fontSize: 13, fontWeight: '700' as const, marginBottom: 4 },
  eventMeta: { color: '#6b7280', fontSize: 12 },
  eventLocation: { color: '#9ca3af', fontSize: 11, marginTop: 5 },

  // Close button
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#f3f4f6',
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
};