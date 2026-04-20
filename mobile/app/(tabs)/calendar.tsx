import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Bell
} from 'lucide-react-native';
import { trpc } from '../../utils/trpc';
import { AddEventModal } from '../../components/AddEventModal';
import {
  Users, CheckSquare, Phone, UtensilsCrossed, Plane, MoreHorizontal
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const NAVY = '#111827';
const SOFT_BG = '#f6f5f3';
const ACCENT = '#3b82f6';

const EVENT_TYPES = [
  { key: 'meeting', label: 'Meeting', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'event', label: 'Event', color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'reminder', label: 'Reminder', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'task', label: 'Task', color: '#10b981', bg: '#ecfdf5' },
  { key: 'call', label: 'Call', color: '#ef4444', bg: '#fef2f2' },
  { key: 'lunch', label: 'Lunch', color: '#f97316', bg: '#fff7ed' },
  { key: 'travel', label: 'Travel', color: '#06b6d4', bg: '#ecfeff' },
  { key: 'other', label: 'Other', color: '#64748b', bg: '#f1f5f9' },
] as const;

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const utils = trpc.useUtils();

  // Get current user for permission checks
  const { data: currentUser } = trpc.profile.me.useQuery();

  // Fetch groups for the filter
  const { data: groups = [] } = trpc.group.getGroups.useQuery();

  // Use tRPC to fetch events, with optional group filter
  const { data: events, isLoading, refetch, isRefetching } = trpc.calendar.getEvents.useQuery(
    selectedGroupId ? { groupId: selectedGroupId } : undefined
  );

  const groupedEvents = useMemo(() => {
    if (!events) return {};

    return events.reduce((acc: any, event: any) => {
      const dateKey = new Date(event.startAt).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [events]);

  const deleteEventMutation = trpc.calendar.deleteEvent.useMutation({
    onSuccess: () => {
      utils.calendar.getEvents.invalidate();
      setActionMenuId(null);
    },
  });

  const sortedDates = useMemo(() => {
    return Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [groupedEvents]);

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f6f5f3]">
        <ActivityIndicator size="large" color={NAVY} />
        <Text className="mt-4 text-slate-500 font-medium">Loading your schedule...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: SOFT_BG }}>
      <StatusBar style="dark" />

      {/* Premium Header */}
      <View
        className="px-6 pt-16 pb-4 bg-white border-b border-slate-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.03,
          shadowRadius: 10,
          elevation: 2
        }}
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-[2px]">Schedule</Text>
            <Text className="text-3xl font-black text-[#111827] mt-1">Calendar</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
              <Bell size={20} color={NAVY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Group / Department Filter */}
        {groups.length > 0 && (
          <View className="mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => setSelectedGroupId(null)}
                className={`px-4 py-2 rounded-full border ${!selectedGroupId ? 'bg-[#111827] border-[#111827]' : 'bg-white border-slate-200'}`}
              >
                <Text className={`text-[12px] font-bold ${!selectedGroupId ? 'text-white' : 'text-slate-500'}`}>My Calendar</Text>
              </TouchableOpacity>

              {groups.map((group: any) => (
                <TouchableOpacity
                  key={group.id}
                  onPress={() => setSelectedGroupId(group.id)}
                  className={`px-4 py-2 rounded-full border ${selectedGroupId === group.id ? 'bg-[#06b6d4] border-[#06b6d4]' : 'bg-white border-slate-200'}`}
                >
                  <Text className={`text-[12px] font-bold ${selectedGroupId === group.id ? 'text-white' : 'text-slate-500'}`}>{group.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Horizontal Dynamic Day Scroller */}
        <View className="py-4 bg-white">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {(() => {
              const days = [];
              const curr = new Date();
              // Show 14 days starting from 2 days ago
              const start = new Date(curr);
              start.setDate(curr.getDate() - 2);

              for (let i = 0; i < 14; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const isSelected = d.toDateString() === selectedDate.toDateString();
                const isTodayDate = d.toDateString() === new Date().toDateString();

                days.push(
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedDate(d)}
                    className="items-center"
                  >
                    <Text className={`text-[10px] font-bold ${isSelected ? 'text-[#111827]' : 'text-slate-400'} uppercase mb-2`}>
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                    <View
                      className={`w-9 h-11 rounded-2xl items-center justify-center ${isSelected ? 'bg-[#111827]' : 'bg-slate-50'}`}
                      style={isSelected ? { backgroundColor: '#111827' } : {}}
                    >
                      <Text className={`text-[13px] font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                        {d.getDate()}
                      </Text>
                    </View>
                    {isTodayDate && !isSelected && <View className="w-1.5 h-1.5 rounded-full bg-[#e87a6e] mt-1.5" />}
                    {isSelected && <View className="w-1.5 h-1.5 rounded-full bg-[#111827] mt-1.5" />}
                  </TouchableOpacity>
                );
              }
              return days;
            })()}
          </ScrollView>
        </View>
      </View>

      {/* Agenda List for Selected Day */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={NAVY} />
        }
      >
        <View className="mt-6">
          <View className="px-6 mb-3 flex-row items-center justify-between">
            <Text className="text-sm font-black text-slate-400 uppercase tracking-widest">
              {isToday(selectedDate.toDateString()) ? 'Today' : selectedDate.toDateString()}
            </Text>
            <View className="h-[1px] flex-1 bg-slate-100 ml-4" />
          </View>

          <View className="px-4">
            {(() => {
              const dayEvents = (events || []).filter(e =>
                new Date(e.startAt).toDateString() === selectedDate.toDateString()
              );

              if (dayEvents.length === 0) {
                return (
                  <View className="py-10 items-center justify-center">
                    <Text className="text-slate-400 font-medium">No events for this day</Text>
                  </View>
                );
              }

              return dayEvents.map((event: any) => (
                <EventItem
                  key={event.id}
                  event={event}
                  isMenuOpen={actionMenuId === event.id}
                  canEdit={event.userId === currentUser?.id}
                  onToggleMenu={() => setActionMenuId(actionMenuId === event.id ? null : event.id)}
                  onEdit={() => {
                    setActionMenuId(null);
                    setEditingEvent(event);
                  }}
                  onDelete={() => deleteEventMutation.mutate({ id: event.id })}
                  onPress={() => {
                    setActionMenuId(null);
                    setEditingEvent(event);
                  }}
                />
              ));
            })()}
          </View>
        </View>
      </ScrollView>

      {editingEvent && (
        <AddEventModal
          visible={!!editingEvent}
          eventToEdit={editingEvent}
          readOnly={editingEvent.userId !== currentUser?.id}
          onClose={() => {
            setEditingEvent(null);
            setActionMenuId(null);
          }}
        />
      )}
    </View>
  );
}

function isToday(dateString: string) {
  return new Date(dateString).toDateString() === new Date().toDateString();
}

function EventItem({
  event,
  isMenuOpen,
  canEdit,
  onToggleMenu,
  onEdit,
  onDelete,
  onPress
}: {
  event: any;
  isMenuOpen: boolean;
  canEdit: boolean;
  onToggleMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPress: () => void
}) {
  const startTime = new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(event.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const typeMeta = EVENT_TYPES.find((t) => t.key === event.eventType);
  const badgeLabel = typeMeta ? typeMeta.label : event.eventType || 'Event';
  const badgeColor = typeMeta ? typeMeta.color : '#64748b';
  const badgeBg = typeMeta ? typeMeta.bg : '#f1f5f9';

  // Custom colors based on priority
  const accentColor = event.priority === 'critical' ? '#ef4444' : event.priority === 'high' ? '#f59e0b' : '#3b82f6';

  return (
    <TouchableOpacity
      className="mb-3 bg-white rounded-[24px] overflow-hidden border border-slate-50 shadow-sm"
      style={{ boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)' }}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View className="flex-1 p-5 relative">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-row flex-1 flex-wrap items-center mr-2 gap-2">
            <View className="flex-1">
              <Text className="text-[17px] font-semibold text-[#111827]" numberOfLines={1}>{event.title}</Text>
              {event.group && (
                <Text className="text-[11px] font-bold text-[#06b6d4] mt-0.5">
                  Shared with {event.group.name}
                </Text>
              )}
            </View>
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: badgeBg }}>
              <Text className="text-[11px] font-bold" style={{ color: badgeColor }}>{badgeLabel}</Text>
            </View>
          </View>
          {canEdit && (
            <TouchableOpacity onPress={onToggleMenu} className="p-2 rounded-full bg-slate-50">
              <MoreVertical size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        {isMenuOpen && (
          <View className="absolute right-5 top-14 rounded-[14px] bg-white border border-slate-200 shadow-lg overflow-hidden" style={{ zIndex: 10 }}>
            <TouchableOpacity onPress={onEdit} className="px-4 py-2 border-b border-slate-100">
              <Text className="text-[12px] font-semibold text-[#111827]">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} className="px-4 py-2 bg-red-50">
              <Text className="text-[12px] font-semibold text-[#b91c1c]">Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2">
          <View className="flex-row items-center">
            <Clock size={14} color="#94a3b8" />
            <Text className="text-[13px] text-slate-400 ml-1.5 font-medium">{startTime} - {endTime}</Text>
          </View>

          {event.location && (
            <View className="flex-row items-center">
              <MapPin size={14} color="#94a3b8" />
              <Text className="text-[13px] text-slate-400 ml-1.5 font-medium" numberOfLines={1}>{event.location}</Text>
            </View>
          )}
        </View>

        {event.description && (
          <Text className="text-[13px] text-slate-400 mt-3 leading-5" numberOfLines={2}>
            {event.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
function EventTypeSection({
  selected, onSelect, customValue, onCustomChange,
}: {
  selected: string;
  onSelect: (key: string) => void;
  customValue: string;
  onCustomChange: (v: string) => void;
}) {
  return (
    <View className="bg-white rounded-[20px] overflow-hidden">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          Event type
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {EVENT_TYPES.map((t) => {
            const active = selected === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => onSelect(t.key)}
                className="items-center rounded-2xl py-3"
                style={{
                  width: '22%',
                  backgroundColor: active ? t.bg : '#f8fafc',
                  borderWidth: 1.5,
                  borderColor: active ? t.color : 'transparent',
                }}
                activeOpacity={0.7}
              >
                <EventTypeIcon typeKey={t.key} color={t.color} />
                <Text
                  className="text-[11px] font-bold mt-1.5 text-center"
                  style={{ color: t.color }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selected === 'other' && (
        <View className="px-4 pb-4">
          <TextInput
            placeholder="Describe the type…"
            placeholderTextColor="#cbd5e1"
            value={customValue}
            onChangeText={onCustomChange}
            autoFocus
            className="bg-slate-50 rounded-xl px-4 py-3 text-[14px] text-slate-700"
            style={{ borderWidth: 1.5, borderColor: '#e2e8f0' }}
          />
        </View>
      )}
    </View>
  );
}

function EventTypeIcon({ typeKey, color }: { typeKey: string; color: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    meeting: <Users size={18} color={color} />,
    event: <CalendarIcon size={18} color={color} />,
    reminder: <Bell size={18} color={color} />,
    task: <CheckSquare size={18} color={color} />,
    call: <Phone size={18} color={color} />,
    lunch: <UtensilsCrossed size={18} color={color} />,
    travel: <Plane size={18} color={color} />,
    other: <MoreHorizontal size={18} color={color} />,
  };
  return (
    <View
      className="w-9 h-9 rounded-xl items-center justify-center"
      style={{ backgroundColor: color + '22' }}
    >
      {iconMap[typeKey]}
    </View>
  );
}