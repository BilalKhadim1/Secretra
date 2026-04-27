import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface SummaryCardProps {
  title: string;
  value: string;
  Icon: LucideIcon;
  color: string;
  onPress?: () => void;
}

export const SummaryCard = ({ title, value, Icon, color, onPress }: SummaryCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white p-5 rounded-[24px] shadow-sm w-[47%] mb-4 border border-slate-50"
      style={{
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
      }}
    >
      <View
        className="w-10 h-10 rounded-[14px] items-center justify-center mb-4"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={22} color={color} />
      </View>
      <Text className="text-[#64748b] text-[11px] font-bold uppercase tracking-widest">{title}</Text>
      <Text className="text-[#0f172a] text-xl font-black mt-1">{value}</Text>
    </TouchableOpacity>
  );
};
