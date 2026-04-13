import React from 'react';
import { View, Text } from 'react-native';

interface SimpleHeaderProps {
  title: string;
}

export const SimpleHeader = ({ title }: SimpleHeaderProps) => {
  return (
    <View className="bg-coral pt-14 pb-8 px-6 rounded-b-[30px] shadow-md mb-6">
      <Text className="text-white/80 text-[10px] uppercase font-bold tracking-[2.5px]">Secretra</Text>
      <Text className="text-white text-2xl font-black mt-0.5">{title}</Text>
    </View>
  );
};
