import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
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

const { width } = Dimensions.get('window');
const NAVY = '#111827';
const SOFT_BG = '#f6f5f3';
const ACCENT = '#3b82f6';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Use tRPC to fetch events
  const { data: events, isLoading, refetch, isRefetching } = trpc.calendar.getEvents.useQuery();

  const groupedEvents = useMemo(() => {
    if (!events) return {};
    
    return events.reduce((acc: any, event: any) => {
      const dateKey = new Date(event.startAt).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [events]);

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
            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-[#111827] items-center justify-center"
              activeOpacity={0.8}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mini Day Scroller (Mocked for visual) */}
        <View className="flex-row justify-between items-center py-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
            const isToday = idx === 0; // Just for demo
            return (
              <View key={day} className="items-center">
                <Text className="text-[10px] font-bold text-slate-400 uppercase mb-2">{day}</Text>
                <TouchableOpacity 
                  className={`w-9 h-9 rounded-xl items-center justify-center ${isToday ? 'bg-navy' : 'bg-transparent'}`}
                  style={isToday ? { backgroundColor: NAVY } : {}}
                >
                  <Text className={`text-sm font-bold ${isToday ? 'text-white' : 'text-slate-600'}`}>{13 + idx}</Text>
                </TouchableOpacity>
                {isToday && <View className="w-1 h-1 rounded-full bg-coral mt-1" style={{ backgroundColor: '#e87a6e' }} />}
              </View>
            );
          })}
        </View>
      </View>

      {/* Agenda List */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={NAVY} />
        }
      >
        {sortedDates.length === 0 ? (
          <View className="mt-20 items-center justify-center px-10">
            <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
              <CalendarIcon size={40} color="#cbd5e1" />
            </View>
            <Text className="text-xl font-bold text-slate-400 text-center">Your schedule is empty</Text>
            <Text className="text-sm text-slate-400 text-center mt-2 leading-5">
              Sync your Google Calendar or add a new event manually to get started.
            </Text>
          </View>
        ) : (
          sortedDates.map((dateKey) => (
            <View key={dateKey} className="mt-6">
              <View className="px-6 mb-3 flex-row items-center justify-between">
                <Text className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  {isToday(dateKey) ? 'Today' : dateKey}
                </Text>
                <View className="h-[1px] flex-1 bg-slate-100 ml-4" />
              </View>
              
              <View className="px-4">
                {groupedEvents[dateKey].map((event: any) => (
                  <EventItem key={event.id} event={event} />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function isToday(dateString: string) {
  return new Date(dateString).toDateString() === new Date().toDateString();
}

function EventItem({ event }: { event: any }) {
  const startTime = new Date(event.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(event.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Custom colors based on priority
  const accentColor = event.priority === 'critical' ? '#ef4444' : event.priority === 'high' ? '#f59e0b' : '#3b82f6';

  return (
    <TouchableOpacity 
      className="flex-row mb-3 bg-white rounded-[24px] overflow-hidden border border-slate-50 shadow-sm"
      style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
      activeOpacity={0.8}
    >
      <View style={{ width: 6, backgroundColor: accentColor }} />
      <View className="flex-1 p-5">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-[17px] font-bold text-[#1e293b]" numberOfLines={1}>{event.title}</Text>
          </View>
          <TouchableOpacity>
            <MoreVertical size={16} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
        
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

