import React, { useState } from 'react';
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
  CheckCircle2, 
  Circle, 
  Calendar, 
  Plus, 
  Filter, 
  Search, 
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react-native';
import { trpc } from '../../utils/trpc';

const { width } = Dimensions.get('window');
const NAVY = '#111827';
const SOFT_BG = '#f6f5f3';
const ACCENT = '#3b82f6';
const CORAL = '#e87a6e';

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState('active'); // 'all', 'active', 'done'
  
  // Use tRPC to fetch tasks
  const { data: tasks, isLoading, refetch, isRefetching } = trpc.task.getTasks.useQuery();
  
  const updateTaskMutation = trpc.task.updateTask.useMutation({
    onSuccess: () => refetch(),
  });

  const toggleTask = (id: string, currentStatus: string) => {
    updateTaskMutation.mutate({
      id,
      status: currentStatus === 'done' ? 'todo' : 'done',
    });
  };

  const filteredTasks = tasks?.filter((task: any) => {
    if (activeTab === 'done') return task.status === 'done';
    if (activeTab === 'active') return task.status !== 'done';
    return true;
  }) || [];

  const stats = {
    total: tasks?.length || 0,
    active: tasks?.filter((t: any) => t.status !== 'done').length || 0,
    done: tasks?.filter((t: any) => t.status === 'done').length || 0,
  };

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f6f5f3]">
        <ActivityIndicator size="large" color={NAVY} />
        <Text className="mt-4 text-slate-500 font-medium">Loading your tasks...</Text>
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
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2
        }}
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-[2px]">Your Focus</Text>
            <Text className="text-3xl font-black text-[#111827] mt-1">Priorities</Text>
          </View>
          <TouchableOpacity 
            className="w-12 h-12 rounded-full items-center justify-center bg-[#111827]"
            activeOpacity={0.8}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3">
          <StatCard label="Active" value={stats.active} active />
          <StatCard label="Completed" value={stats.done} />
        </View>
      </View>

      {/* Tabs / Filters */}
      <View className="flex-row px-6 py-4 gap-4 items-center">
        <TabButton 
          label="In Progress" 
          active={activeTab === 'active'} 
          onPress={() => setActiveTab('active')} 
          count={stats.active}
        />
        <TabButton 
          label="Done" 
          active={activeTab === 'done'} 
          onPress={() => setActiveTab('done')} 
          count={stats.done}
        />
        <View className="flex-1" />
        <TouchableOpacity className="w-10 h-10 rounded-xl bg-white items-center justify-center border border-slate-100">
          <Filter size={18} color={NAVY} />
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <View className="flex-1">
        <ScrollView 
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={NAVY} />
          }
        >
          {filteredTasks.length === 0 ? (
            <View className="mt-20 items-center justify-center px-10">
              <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
                <CheckCircle2 size={40} color="#cbd5e1" />
              </View>
              <Text className="text-xl font-bold text-slate-400 text-center">
                {activeTab === 'done' ? 'No finished tasks yet' : "All clear! You're caught up."}
              </Text>
              <Text className="text-sm text-slate-400 text-center mt-2 leading-5">
                {activeTab === 'active' ? "Tap the blue plus button to add a new priority to your list." : ""}
              </Text>
            </View>
          ) : (
            filteredTasks.map((task: any, index: number) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={() => toggleTask(task.id, task.status)}
                isLast={index === filteredTasks.length - 1}
              />
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function StatCard({ label, value, active = false }: { label: string, value: number, active?: boolean }) {
  return (
    <View 
      className={`flex-1 rounded-2xl p-4 border ${active ? 'bg-navy border-navy' : 'bg-white border-slate-100'}`}
      style={active ? { backgroundColor: NAVY } : {}}
    >
      <Text className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${active ? 'text-white/60' : 'text-slate-400'}`}>
        {label}
      </Text>
      <Text className={`text-2xl font-black ${active ? 'text-white' : 'text-navy'}`} style={!active ? { color: NAVY } : {}}>
        {value}
      </Text>
    </View>
  );
}

function TabButton({ label, active, onPress, count }: { label: string, active: boolean, onPress: () => void, count: number }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-row items-center px-4 py-2 rounded-full ${active ? 'bg-white' : ''}`}
      style={active ? { 
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
      } : {}}
    >
      <Text className={`text-sm font-bold ${active ? 'text-[#111827]' : 'text-slate-400'}`}>
        {label}
      </Text>
      <View className={`ml-2 px-1.5 py-0.5 rounded-md ${active ? 'bg-[#111827]' : 'bg-slate-200'}`}>
        <Text className={`text-[10px] font-bold ${active ? 'text-white' : 'text-slate-500'}`}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function TaskItem({ task, onToggle, isLast }: { task: any, onToggle: () => void, isLast: boolean }) {
  const isDone = task.status === 'done';
  const priorityColor = task.priority === 'P1' ? '#ef4444' : task.priority === 'P2' ? '#f59e0b' : '#3b82f6';

  return (
    <TouchableOpacity 
      className={`flex-row items-center p-5 bg-white rounded-2xl mb-3 border border-slate-50 shadow-sm`}
      activeOpacity={0.7}
      style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}
    >
      <TouchableOpacity 
        onPress={onToggle}
        className="mr-4"
      >
        {isDone ? (
          <View className="bg-emerald-500 rounded-full w-6 h-6 items-center justify-center">
            <CheckCircle2 size={16} color="white" />
          </View>
        ) : (
          <Circle size={24} color="#e2e8f0" />
        )}
      </TouchableOpacity>
      
      <View className="flex-1">
        <Text 
          className={`text-[16px] font-semibold ${isDone ? 'text-slate-300 line-through' : 'text-[#1e293b]'}`}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <View className="flex-row items-center mt-1.5">
          <View className="flex-row items-center mr-4">
            <Clock size={12} color={isDone ? "#cbd5e1" : "#94a3b8"} />
            <Text className="text-[12px] text-slate-400 ml-1.5 font-medium">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
            </Text>
          </View>
          <View 
            className="w-1.5 h-1.5 rounded-full mr-2" 
            style={{ backgroundColor: isDone ? '#e2e8f0' : priorityColor }} 
          />
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {task.priority || 'P3'}
          </Text>
        </View>
      </View>
      
      <ChevronRight size={18} color="#e2e8f0" />
    </TouchableOpacity>
  );
}

