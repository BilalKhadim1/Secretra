import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Bell, Search, User } from 'lucide-react-native';

interface DashboardHeaderProps {
  name?: string;
  avatarUrl?: string | null;
}

export const DashboardHeader = ({ name = 'Guest', avatarUrl }: DashboardHeaderProps) => {
  return (
    <View className="bg-coral pt-14 pb-16 px-6 rounded-b-[40px] shadow-lg">
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
          <Search size={20} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row gap-4">
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Bell size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center overflow-hidden border-2 border-white/30">
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} className="w-full h-full" />
            ) : (
              <User size={22} color="#e87a6e" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <Text className="text-white/80 text-sm font-semibold uppercase tracking-[2.5px]">Good Morning,</Text>
        <Text className="text-white text-3xl font-black mt-1">{name}</Text>
      </View>
    </View>
  );
};
