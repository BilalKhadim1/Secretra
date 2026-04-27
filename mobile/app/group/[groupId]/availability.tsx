// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { trpc } from '../../../utils/trpc';
import { AddEventModal } from '../../../components/AddEventModal';

const NAVY = '#111827';
const SURFACE = '#f6f5f3';
const BORDER = '#f0eeec';
const MUTED = '#9ca3af';
const CORAL = '#e87a6e';
const ACCENT = '#3b82f6';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Layout constants — tight
const TIME_COL = 44;       // width of the time label column
const HOUR_HEIGHT = 56;    // height per hour row (was 80)
const MIN_COL = 64;        // minimum member column width
const MAX_COL = 100;       // cap so wide screens don't look sparse

// Compute column width so all members fill the visible width if possible
function colWidth(memberCount: number): number {
  if (memberCount === 0) return MIN_COL;
  const available = SCREEN_WIDTH - TIME_COL;
  const natural = Math.floor(available / memberCount);
  return Math.min(Math.max(natural, MIN_COL), MAX_COL);
}

// 24 hours, starting at 8 AM and wrapping around
const HOURS = Array.from({ length: 24 }, (_, i) => (i + 8) % 24);

function hourLabel(h: number) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

// ── Avatar initials ──
const AVATAR_COLORS = [
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#dbeafe', text: '#2563eb' },
  { bg: '#dcfce7', text: '#16a34a' },
  { bg: '#fce7f3', text: '#db2777' },
  { bg: '#ffedd5', text: '#ea580c' },
  { bg: '#e0f2fe', text: '#0284c7' },
];

function memberColor(name: string) {
  const idx = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ── Compact day scroller ──
function DayScroller({ selected, onSelect }: { selected: Date; onSelect: (d: Date) => void }) {
  const today = new Date();
  const days: Date[] = [];
  const start = new Date(today);
  start.setDate(today.getDate() - 3);
  for (let i = 0; i < 21; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }

  return (
    <ScrollView
      horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 6 }}
    >
      {days.map((d, i) => {
        const active = d.toDateString() === selected.toDateString();
        const todayDot = d.toDateString() === today.toDateString() && !active;
        return (
          <TouchableOpacity
            key={i} onPress={() => onSelect(d)} activeOpacity={0.7}
            style={{ alignItems: 'center', width: 40 }}
          >
            <Text style={{
              fontSize: 10, fontWeight: '600', color: active ? NAVY : MUTED,
              textTransform: 'uppercase', marginBottom: 4,
            }}>
              {d.toLocaleDateString('en-US', { weekday: 'short' })}
            </Text>
            <View style={{
              width: 36, height: 42, borderRadius: 10,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: active ? NAVY : 'white',
              borderWidth: 1, borderColor: active ? NAVY : BORDER,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: active ? 'white' : NAVY }}>
                {d.getDate()}
              </Text>
            </View>
            <View style={{
              width: 4, height: 4, borderRadius: 2, marginTop: 3,
              backgroundColor: todayDot ? CORAL : 'transparent',
            }} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── Main screen ──
export default function AvailabilityScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [prefilledTime, setPrefilledTime] = useState<any>(null);
  const timeScrollRef = useRef<ScrollView>(null);

  const groupQuery = trpc.group.getGroup.useQuery({ id: groupId });
  const availabilityQuery = trpc.calendar.getTeamAvailability.useQuery({
    groupId,
    startDate: new Date(new Date(selectedDate).setHours(0, 0, 0, 0)).toISOString(),
    endDate: new Date(new Date(selectedDate).setHours(23, 59, 59, 999)).toISOString(),
  }, { enabled: !!groupId });

  const isLoading = groupQuery.isLoading || availabilityQuery.isLoading;
  const members = availabilityQuery.data || [];
  const COL = colWidth(members.length);

  // No scroll needed — 8 AM is already the first row

  const handleSlotPress = (hour: number) => {
    const start = new Date(selectedDate);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);
    setPrefilledTime({ start, end });
    setShowAddEvent(true);
  };

  if (isLoading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: SURFACE }}>
      <ActivityIndicator size="small" color={NAVY} />
    </View>
  );

  // Total grid width — if wider than screen, horizontal scroll kicks in
  const gridWidth = TIME_COL + COL * members.length;
  const needsHScroll = gridWidth > SCREEN_WIDTH;

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>

      {/* ── Header ── */}
      <View style={{
        paddingTop: insets.top + 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
      }}>
        {/* Nav row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14, gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center' }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color={NAVY} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: NAVY }}>Team Calander</Text>
            {groupQuery.data?.name && (
              <Text style={{ fontSize: 12, color: MUTED, fontWeight: '600', marginTop: 1 }}>
                {groupQuery.data.name}
              </Text>
            )}
          </View>
          {/* Member count badge */}
          <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: NAVY }}>{members.length} members</Text>
          </View>
        </View>

        {/* Day scroller */}
        <View style={{ paddingBottom: 14 }}>
          <DayScroller selected={selectedDate} onSelect={setSelectedDate} />
        </View>
      </View>

      {/* ── Grid ── */}
      <ScrollView
        horizontal
        style={{ flex: 1 }}
        contentContainerStyle={{ minWidth: '100%', flexGrow: 1 }}
        showsHorizontalScrollIndicator={false}
        directionalLockEnabled={false}
        bounces={false}
      >
        <View style={{ width: Math.max(gridWidth, SCREEN_WIDTH), flex: 1 }}>

          {/* Member header row */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: BORDER,
          }}>
            {/* Time col spacer */}
            <View style={{ width: TIME_COL }} />

            {members.map((m: any, i: number) => {
              const label = (m.name || m.userId || '?').charAt(0).toUpperCase();
              const colors = memberColor(m.name || m.userId || '');
              return (
                <View
                  key={i}
                  style={{
                    width: COL,
                    paddingVertical: 10,
                    alignItems: 'center',
                    borderLeftWidth: 1,
                    borderLeftColor: BORDER,
                  }}
                >
                  <View style={{
                    width: 28, height: 28, borderRadius: 9,
                    backgroundColor: colors.bg,
                    alignItems: 'center', justifyContent: 'center',
                    marginBottom: 3,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: colors.text }}>{label}</Text>
                  </View>
                  <Text
                    style={{ fontSize: 10, fontWeight: '600', color: NAVY, textAlign: 'center' }}
                    numberOfLines={1}
                  >
                    {(m.name || 'User').split(' ')[0]}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Time + event grid */}
          <ScrollView
            ref={timeScrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
            nestedScrollEnabled
          >
            <View style={{ flexDirection: 'row' }}>

              {/* Hour labels */}
              <View style={{ width: TIME_COL, backgroundColor: 'white' }}>
                {HOURS.map((h, idx) => (
                  <View key={h} style={{
                    height: HOUR_HEIGHT,
                    justifyContent: 'flex-start', paddingTop: 6,
                    paddingRight: 8, alignItems: 'flex-end',
                    borderBottomWidth: 1,
                    borderBottomColor: idx % 2 === 1 ? '#e9e7e4' : BORDER,
                    backgroundColor: idx % 2 === 1 ? '#fafaf9' : 'white',
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: idx % 2 === 0 ? '#64748b' : MUTED }}>
                      {hourLabel(h)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Member columns */}
              {members.map((m: any, colIdx: number) => (
                <View
                  key={colIdx}
                  style={{ width: COL, borderLeftWidth: 1, borderLeftColor: BORDER, position: 'relative' }}
                >
                  {/* Hour slots */}
                  {HOURS.map((h, idx) => (
                    <TouchableOpacity
                      key={h}
                      onPress={() => handleSlotPress(h)}
                      activeOpacity={0.4}
                      style={{
                        height: HOUR_HEIGHT,
                        borderBottomWidth: 1,
                        borderBottomColor: idx % 2 === 1 ? '#e9e7e4' : BORDER,
                        backgroundColor: idx % 2 === 1 ? '#fafaf9' : 'white',
                      }}
                    />
                  ))}

                  {/* Conflict blocks */}
                  {(m.conflictingEvents || []).map((ev: any, blockIdx: number) => {
                    const start = new Date(ev.start);
                    const end = new Date(ev.end);

                    const dayStart = new Date(selectedDate);
                    dayStart.setHours(0, 0, 0, 0);

                    const dayEnd = new Date(selectedDate);
                    dayEnd.setHours(23, 59, 59, 999);

                    // Skip if event doesn't overlap with this specific Calendar Day
                    if (end <= dayStart || start >= dayEnd) return null;

                    const clampedStart = new Date(Math.max(start.getTime(), dayStart.getTime()));
                    let clampedEnd = new Date(Math.min(end.getTime(), dayEnd.getTime()));
                    // Push end to the minute boundary if it was clamped to exactly 23:59:59.999
                    if (clampedEnd.getTime() === dayEnd.getTime()) {
                        clampedEnd = new Date(dayEnd.getTime() + 1); // Exact midnight
                    }

                    // Custom mapping: 8:00 AM = 0, Midnight = 16 hours, 7:59 AM = 23h59
                    const getVisualMins = (d: Date) => {
                        const m = d.getHours() * 60 + d.getMinutes();
                        return (m - 480 + 1440) % 1440;
                    };

                    const isTask = ev.type === 'task';

                    // Renders a single UI block safely
                    const renderBox = (topMins: number, bottomMins: number, keySuffix: string) => {
                        const top = (topMins / 60) * HOUR_HEIGHT;
                        const height = Math.max(((bottomMins - topMins) / 60) * HOUR_HEIGHT, 18);
                        return (
                          <View
                            key={`${blockIdx}-${keySuffix}`}
                            style={{
                              position: 'absolute',
                              top, left: 3, right: 3,
                              height,
                              backgroundColor: isTask ? '#eff6ff' : '#fff0ee',
                              borderRadius: 6,
                              borderLeftWidth: 2.5,
                              borderLeftColor: isTask ? '#3b82f6' : '#e87a6e',
                              paddingHorizontal: 5, paddingTop: 3,
                              zIndex: 10, overflow: 'hidden',
                            }}
                          >
                            <Text style={{ fontSize: 9, fontWeight: '700', color: isTask ? '#3b82f6' : '#e87a6e' }} numberOfLines={1}>
                              {ev.title || 'Busy'}
                            </Text>
                          </View>
                        );
                    };

                    const durationMins = (clampedEnd.getTime() - clampedStart.getTime()) / 60000;
                    if (Math.round(durationMins) >= 1440) {
                        return renderBox(0, 1440, 'fullday');
                    }

                    const today8AM = new Date(dayStart);
                    today8AM.setHours(8, 0, 0, 0);

                    // If event physically crosses the 8 AM boundary (e.g. 7 AM to 9 AM), we must visually split it
                    if (clampedStart < today8AM && clampedEnd > today8AM) {
                        const vStart1 = getVisualMins(clampedStart);
                        const vEnd1 = 1440; // Reaches visual bottom
                        
                        const vStart2 = 0; // Restarts at visual top
                        const vEnd2 = getVisualMins(clampedEnd);
                        
                        return (
                            <React.Fragment key={blockIdx}>
                                {renderBox(vStart1, vEnd1, 'part1')}
                                {renderBox(vStart2, vEnd2, 'part2')}
                            </React.Fragment>
                        );
                    } else {
                        // Standalone contiguous block
                        const vStart = getVisualMins(clampedStart);
                        let vEnd = getVisualMins(clampedEnd);
                        
                        // If it ends exactly at 8 AM, it's extending to the visual bottom of the list
                        if (clampedEnd.getTime() === today8AM.getTime()) {
                            vEnd = 1440;
                        }
                        
                        return renderBox(vStart, vEnd, 'full');
                    }
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        onPress={() => { setPrefilledTime(null); setShowAddEvent(true); }}
        activeOpacity={0.85}
        style={{
          position: 'absolute', bottom: 32, right: 20,
          width: 48, height: 48, borderRadius: 15,
          backgroundColor: NAVY,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Plus size={20} color="white" />
      </TouchableOpacity>

      <AddEventModal
        visible={showAddEvent}
        onClose={() => {
            setShowAddEvent(false);
            setPrefilledTime(null);
        }}
        initialGroupId={groupId as string}
        initialDate={selectedDate}
        prefilledStart={prefilledTime?.start}
        prefilledEnd={prefilledTime?.end}
      />
    </View>
  );
}