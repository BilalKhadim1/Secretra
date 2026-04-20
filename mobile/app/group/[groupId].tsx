// @ts-nocheck
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  StatusBar,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { 
  BottomSheetModal, 
  BottomSheetView, 
  BottomSheetScrollView, 
  BottomSheetTextInput, 
  BottomSheetBackdrop 
} from '@gorhom/bottom-sheet';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Circle } from 'react-native-svg';
import { AlertCircle } from 'lucide-react-native';
import { trpc } from '../../utils/trpc';
import { AddEventModal } from '../../components/AddEventModal';

const NAVY = '#111827';
const CORAL = '#e87a6e';

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

// ── Modals ──

const renderBackdrop = (props) => (
  <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
);

const ConfirmRemoveModal = ({ visible, member, onClose, onConfirm, loading }) => {
  const ref = useRef(null);
  useEffect(() => { if (visible) ref.current?.present(); else ref.current?.dismiss(); }, [visible]);
  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['100%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={(idx) => { if (idx === -1) onClose(); }}
      backgroundStyle={{ backgroundColor: 'white', borderRadius: 40 }}
    >
      <BottomSheetView style={{ flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <IconRemoveUser size={22} color="#ef4444" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: NAVY, marginBottom: 8 }}>Remove member?</Text>
        <Text style={{ color: '#64748b', textAlign: 'center', marginBottom: 32 }}>
          <Text style={{ fontWeight: 'bold', color: NAVY }}>{member?.email}</Text> will be removed from this department.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
          <TouchableOpacity onPress={onClose} style={{ flex: 1, py: 16, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', color: '#64748b' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} disabled={loading} style={{ flex: 1, py: 16, borderRadius: 16, backgroundColor: '#ef4444', alignItems: 'center' }}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={{ fontWeight: 'bold', color: 'white' }}>Remove</Text>}
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const ConfirmLeaveModal = ({ visible, groupName, onClose, onConfirm, loading }) => {
  const ref = useRef(null);
  useEffect(() => { if (visible) ref.current?.present(); else ref.current?.dismiss(); }, [visible]);
  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['100%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={(idx) => { if (idx === -1) onClose(); }}
      backgroundStyle={{ backgroundColor: 'white', borderRadius: 40 }}
    >
      <BottomSheetView style={{ flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <IconLogOut size={22} color="#ef4444" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: NAVY, marginBottom: 8 }}>Leave department?</Text>
        <Text style={{ color: '#64748b', textAlign: 'center', marginBottom: 32 }}>
          You will be removed from <Text style={{ fontWeight: 'bold', color: NAVY }}>{groupName}</Text>.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
          <TouchableOpacity onPress={onClose} style={{ flex: 1, py: 16, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', color: '#64748b' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} disabled={loading} style={{ flex: 1, py: 16, borderRadius: 16, backgroundColor: '#ef4444', alignItems: 'center' }}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={{ fontWeight: 'bold', color: 'white' }}>Leave</Text>}
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const EditGroupModal = ({ visible, onClose, name, setName, description, setDescription, imageUrl, onPickImage, onTakePhoto, onSave, loading }) => {
  const ref = useRef(null);
  useEffect(() => { if (visible) ref.current?.present(); else ref.current?.dismiss(); }, [visible]);
  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['100%']}
      enablePanDownToClose
      keyboardBehavior="interactive"
      backdropComponent={renderBackdrop}
      onChange={(idx) => { if (idx === -1) onClose(); }}
      backgroundStyle={{ backgroundColor: 'white', borderRadius: 40 }}
    >
      <BottomSheetView style={{ flex: 1, padding: 32 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: NAVY, marginBottom: 8 }}>Edit Department</Text>
        <Text style={{ color: '#64748b', marginBottom: 24 }}>Update details and photo.</Text>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ position: 'relative' }}>
            <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
              {imageUrl ? <Image source={{ uri: imageUrl }} style={{ width: 80, height: 80, borderRadius: 40 }} /> : <IconUsersGroup size={32} color="#94a3b8" />}
            </View>
            <View style={{ position: 'absolute', bottom: -5, right: -5, flexDirection: 'row', gap: 4 }}>
              <TouchableOpacity onPress={onPickImage} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
                <IconCamera size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Department Name</Text>
        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
          style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, fontSize: 16, fontWeight: 'bold', color: NAVY, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 }}
        />

        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Description</Text>
        <BottomSheetTextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Brief description"
          multiline
          style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, fontSize: 15, color: NAVY, borderWidth: 1, borderColor: '#f1f5f9', minHeight: 100, textAlignVertical: 'top', marginBottom: 32 }}
        />

        <TouchableOpacity onPress={onSave} disabled={loading || !name.trim()} style={[{ py: 18, borderRadius: 16, backgroundColor: NAVY, alignItems: 'center' }, (loading || !name.trim()) && { opacity: 0.5 }]}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Save Changes</Text>}
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const GroupMemberModal = ({ visible, onClose, email, setEmail, onAdd, loading }) => {
  const ref = useRef(null);
  useEffect(() => { if (visible) ref.current?.present(); else ref.current?.dismiss(); }, [visible]);
  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['100%']}
      enablePanDownToClose
      keyboardBehavior="interactive"
      backdropComponent={renderBackdrop}
      onChange={(idx) => { if (idx === -1) onClose(); }}
      backgroundStyle={{ backgroundColor: 'white', borderRadius: 40 }}
    >
      <BottomSheetView style={{ flex: 1, padding: 32 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: NAVY, marginBottom: 8 }}>Add Member</Text>
        <Text style={{ color: '#64748b', marginBottom: 32 }}>Invite someone to join this department.</Text>

        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Email Address</Text>
        <BottomSheetTextInput
          value={email}
          onChangeText={setEmail}
          placeholder="member@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, fontSize: 16, fontWeight: 'bold', color: NAVY, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 32 }}
        />

        <TouchableOpacity onPress={onAdd} disabled={loading || !email.trim()} style={[{ py: 18, borderRadius: 16, backgroundColor: NAVY, alignItems: 'center' }, (loading || !email.trim()) && { opacity: 0.5 }]}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>Add to Department</Text>}
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const MemberCalendarModal = ({ visible, member, onClose, events, loading }) => {
  const ref = useRef(null);
  useEffect(() => { if (visible) ref.current?.present(); else ref.current?.dismiss(); }, [visible]);
  
  const fmt = (date: string, type: 'time' | 'date') => {
    const d = new Date(date);
    return type === 'time'
      ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['100%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={(idx) => { if (idx === -1) onClose(); }}
      backgroundStyle={{ backgroundColor: 'white', borderRadius: 40 }}
    >
      <BottomSheetView style={{ flex: 1, padding: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 }}>
          {member && <AvatarInitials email={member.email} size={50} />}
          <View>
            <Text style={{ color: NAVY, fontSize: 18, fontWeight: 'bold' }}>{member?.email?.split('@')[0]}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>Member Schedule</Text>
          </View>
        </View>

        {loading ? <ActivityIndicator color={NAVY} size="large" /> : events.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <IconCalendar size={48} color="#cbd5e1" />
            <Text style={{ color: '#94a3b8', marginTop: 16, fontWeight: 'bold' }}>No events today</Text>
          </View>
        ) : (
          <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            {events.map((ev, i) => (
              <View key={i} style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: NAVY }}>
                <Text style={{ fontWeight: 'bold', color: NAVY, fontSize: 15 }}>{ev.title}</Text>
                <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{fmt(ev.startAt, 'time')} – {fmt(ev.endAt, 'time')}</Text>
              </View>
            ))}
          </BottomSheetScrollView>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

// ── Main Page ──

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const groupId = params.groupId;
  const utils = trpc.useUtils();

  const [showAddModal, setShowAddModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editGroupImageUrl, setEditGroupImageUrl] = useState(null);

  const groupQuery = trpc.group.getGroup.useQuery({ id: groupId }, { enabled: !!groupId });
  const currentUserQuery = trpc.profile.me.useQuery();
  
  const isLoading = groupQuery.isLoading || currentUserQuery.isLoading;
  const isError = groupQuery.isError;
  const group = groupQuery.data;
  const currentUser = currentUserQuery.data;
  const isAdmin = group?.userId === currentUser?.id;

  const getTeamMemberCalendar = trpc.calendar.getTeamMemberCalendar.useQuery(
    { memberId: selectedMember?.user?.id || selectedMember?.userId || '', groupId },
    { enabled: !!selectedMember && !!groupId }
  );

  const addGroupMember = trpc.group.addGroupMember.useMutation({
    onSuccess: () => { setShowAddModal(false); setMemberEmail(''); utils.group.getGroup.invalidate(); }
  });

  const removeGroupMember = trpc.group.removeGroupMember.useMutation({
    onSuccess: () => { setMemberToRemove(null); utils.group.getGroup.invalidate(); }
  });

  const leaveGroup = trpc.group.leaveGroup.useMutation({
    onSuccess: (res) => { if (res.groupDeleted) router.replace('/dashboard'); else router.back(); }
  });

  const updateGroup = trpc.group.updateGroup.useMutation({
    onSuccess: () => { setShowEditGroupModal(false); utils.group.getGroup.invalidate(); }
  });

  if (isLoading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f5f3' }}><ActivityIndicator size="large" color={NAVY} /><Text style={{ marginTop: 12, color: '#94a3b8', fontWeight: '500' }}>Loading department...</Text></View>;

  if (isError || !group) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f6f5f3', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <AlertCircle color="#ef4444" size={28} />
        </View>
        <Text style={{ color: NAVY, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>Department not found</Text>
        <Text style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>This department may have been deleted or you don't have access.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 24, paddingVertical: 14, paddingHorizontal: 32, backgroundColor: NAVY, borderRadius: 16 }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f5f3' }}>
      <StatusBar barStyle="dark-content" />
      
      <GroupMemberModal visible={showAddModal} onClose={() => setShowAddModal(false)} email={memberEmail} setEmail={setMemberEmail} onAdd={() => addGroupMember.mutate({ groupId, email: memberEmail })} loading={addGroupMember.isPending} />
      <ConfirmRemoveModal visible={!!memberToRemove} member={memberToRemove} onClose={() => setMemberToRemove(null)} onConfirm={() => removeGroupMember.mutate({ groupId, memberId: memberToRemove.id })} loading={removeGroupMember.isPending} />
      <ConfirmLeaveModal visible={showLeaveConfirm} groupName={group?.name} onClose={() => setShowLeaveConfirm(false)} onConfirm={() => leaveGroup.mutate({ groupId })} loading={leaveGroup.isPending} />
      <EditGroupModal visible={showEditGroupModal} onClose={() => setShowEditGroupModal(false)} name={editGroupName} setName={setEditGroupName} description={editGroupDescription} setDescription={setEditGroupDescription} imageUrl={editGroupImageUrl} onSave={() => updateGroup.mutate({ id: groupId, name: editGroupName, description: editGroupDescription, imageUrl: editGroupImageUrl })} loading={updateGroup.isPending} />
      <MemberCalendarModal visible={!!selectedMember} member={selectedMember} onClose={() => setSelectedMember(null)} events={getTeamMemberCalendar.data || []} loading={getTeamMemberCalendar.isLoading} />
      <AddEventModal visible={showAddEventModal} onClose={() => setShowAddEventModal(false)} initialGroupId={groupId} />

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={{ backgroundColor: '#fff', paddingTop: 64, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 24, marginBottom: 24 }}>
              <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
                <IconBack size={20} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {isAdmin && <TouchableOpacity onPress={() => { setEditGroupName(group.name); setEditGroupDescription(group.description || ''); setEditGroupImageUrl(group.imageUrl); setShowEditGroupModal(true); }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}><IconEdit size={18} /></TouchableOpacity>}
                <TouchableOpacity onPress={() => setShowLeaveConfirm(true)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}><IconLogOut size={18} color="#ef4444" /></TouchableOpacity>
              </View>
           </View>
           
           <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff', marginBottom: 16 }}>
             {group.imageUrl ? <Image source={{ uri: group.imageUrl }} style={{ width: 84, height: 84, borderRadius: 42 }} /> : <IconUsersGroup size={40} />}
           </View>
           
           <Text style={{ fontSize: 26, fontWeight: '900', color: NAVY }}>{group.name}</Text>
           <Text style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: 13, marginTop: 4 }}>DEPARTMENT · {group.members.length} MEMBERS</Text>
        </View>

        <View style={{ padding: 24 }}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
             <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 }}>Members</Text>
             <View style={{ flexDirection: 'row', gap: 8 }}>
               <TouchableOpacity onPress={() => setShowAddEventModal(true)} style={{ backgroundColor: NAVY, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 }}><Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Schedule</Text></TouchableOpacity>
               {isAdmin && <TouchableOpacity onPress={() => setShowAddModal(true)} style={{ backgroundColor: 'white', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}><Text style={{ color: NAVY, fontWeight: 'bold', fontSize: 12 }}>Add</Text></TouchableOpacity>}
             </View>
           </View>

           <View style={{ backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' }}>
             {group.members.map((m, i) => (
               <TouchableOpacity key={m.id} onPress={() => setSelectedMember(m)} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: i === group.members.length - 1 ? 0 : 1, borderBottomColor: '#f8fafc' }}>
                 <AvatarInitials email={m.email} size={44} />
                 <View style={{ flex: 1, marginLeft: 16 }}>
                   <Text style={{ fontWeight: 'bold', color: NAVY }}>{m.email}</Text>
                   <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{m.userId === group.userId ? 'Admin' : 'Member'}</Text>
                 </View>
                 {isAdmin && m.id !== group.userId && <TouchableOpacity onPress={(e) => { e.stopPropagation(); setMemberToRemove(m); }}><IconRemoveUser size={18} color="#ef4444" /></TouchableOpacity>}
               </TouchableOpacity>
             ))}
           </View>
        </View>
      </ScrollView>
    </View>
  );
}