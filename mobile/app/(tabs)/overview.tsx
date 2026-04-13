import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { 
  FileText, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Tag as TagIcon,
  ChevronRight,
  Filter
} from 'lucide-react-native';
import { trpc } from '../../utils/trpc';

const { width } = Dimensions.get('window');
const NAVY = '#111827';
const SOFT_BG = '#f6f5f3';

export default function NotesScreen() {
  const [search, setSearch] = useState('');
  
  // Use tRPC to fetch notes
  const { data: notes, isLoading, refetch, isRefetching } = trpc.note.getNotes.useQuery({ 
    search: search.length > 2 ? search : undefined 
  });

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f6f5f3]">
        <ActivityIndicator size="large" color={NAVY} />
        <Text className="mt-4 text-slate-500 font-medium">Opening your logs...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: SOFT_BG }}>
      <StatusBar style="dark" />
      
      {/* Premium Header */}
      <View 
        className="px-6 pt-16 pb-6 bg-white border-b border-slate-100"
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
            <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-[2px]">Documentation</Text>
            <Text className="text-3xl font-black text-[#111827] mt-1">Personal Log</Text>
          </View>
          <TouchableOpacity 
            className="w-12 h-12 rounded-full items-center justify-center bg-[#111827]"
            activeOpacity={0.8}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl">
          <Search size={18} color="#94a3b8" />
          <TextInput 
            className="flex-1 ml-3 text-slate-700 font-medium"
            placeholder="Search your notes..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity className="ml-2">
            <Filter size={18} color={NAVY} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Note List */}
      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={NAVY} />
        }
      >
        <View className="mt-6 mb-4 flex-row items-center justify-between">
          <Text className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Logs</Text>
          <Text className="text-[12px] font-bold text-navy bg-slate-100 px-2 py-1 rounded-md overflow-hidden">{notes?.length || 0} Total</Text>
        </View>

        {(!notes || notes.length === 0) ? (
          <View className="mt-20 items-center justify-center px-10">
            <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
              <FileText size={40} color="#cbd5e1" />
            </View>
            <Text className="text-xl font-bold text-slate-400 text-center">No logs found</Text>
            <Text className="text-sm text-slate-400 text-center mt-2 leading-5">
              Everything important you draft or save will appear here. Start by creating your first note.
            </Text>
          </View>
        ) : (
          notes.map((note: any) => (
            <NoteItem key={note.id} note={note} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function NoteItem({ note }: { note: any }) {
  const date = new Date(note.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <TouchableOpacity 
      className="bg-white rounded-[24px] p-6 mb-4 border border-slate-100 shadow-sm"
      style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-[18px] font-bold text-[#1e293b] leading-6" numberOfLines={2}>
            {note.title || 'Untitled Note'}
          </Text>
        </View>
        <TouchableOpacity className="w-8 h-8 items-center justify-center rounded-full bg-slate-50">
          <MoreHorizontal size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>
      
      <Text className="text-[14px] text-slate-500 leading-6 mb-4" numberOfLines={3}>
        {note.plainText || 'No additional content provided.'}
      </Text>

      <View className="flex-row items-center justify-between pt-4 border-t border-slate-50">
        <View className="flex-row items-center">
          <Clock size={14} color="#94a3b8" />
          <Text className="text-[12px] text-slate-400 ml-2 font-bold uppercase tracking-wider">{date}</Text>
        </View>
        
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-indigo-400 mr-2" />
          <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Personal</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
