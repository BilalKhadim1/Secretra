import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { User, Lock, Eye, Mail, ArrowRight } from 'lucide-react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

import { trpc } from '../utils/trpc';
import { setStorageItem } from '../utils/storage';
import { Alert } from 'react-native';
import { formatError } from '../utils/errors';

const { width, height } = Dimensions.get('window');
const CORAL = '#e87a6e';
const HEADER_HEIGHT = height * 0.25;

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Google OAuth setup
  const redirectUri = Platform.OS === 'web'
    ? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8082')
    : AuthSession.makeRedirectUri({ scheme: 'personal-secretary' });

  console.log('[Signup] Platform:', Platform.OS, 'Redirect URI:', redirectUri);

  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!;

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: googleClientId,
    iosClientId: googleClientId,
    webClientId: googleClientId,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  const googleLoginMutation = trpc.profile.googleLogin.useMutation({
    onSuccess: async (data: any) => {
      await setStorageItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        await setStorageItem('refreshToken', data.refreshToken);
      }
      setTimeout(() => {
        router.replace('/dashboard');
      }, 100);
    },
    onError: (error: any) => {
      Alert.alert('Google Login Error', formatError(error));
    },
  });

  React.useEffect(() => {
    if (response) {
      console.log('[Signup] Response received:', response.type);
      
      if (response.type === 'success') {
        const { id_token, authentication } = response.params;
        // Handle variations in how the token might be returned
        const finalToken = id_token || (authentication as any)?.idToken;
        
        if (finalToken) {
          googleLoginMutation.mutate({ idToken: finalToken });
        } else {
          console.error('[Signup] Success but missing token. Params:', response.params);
          Alert.alert('Auth Error', 'Successfully authenticated but could not retrieve verification token.');
        }
      } else if (response.type === 'error') {
        console.error('[Signup] Error details:', response.error);
        Alert.alert('Google Auth Error', response.error?.message || 'Authentication failed. Please try again.');
      }
    }
  }, [response]);

  const registerMutation = trpc.profile.register.useMutation({
    onSuccess: async (data: any) => {
      // Store token securely
      await setStorageItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        await setStorageItem('refreshToken', data.refreshToken);
      }
      
      Alert.alert('Success', 'Account created successfully!');
      router.replace('/dashboard');
    },
    onError: (error: any) => {
      Alert.alert('Signup Error', formatError(error));
    },
  });

  const handleSignup = () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    registerMutation.mutate({
      email,
      password,
      name,
    });
  };

  const handleGoogleSignup = () => {
    if (request) {
      promptAsync();
    } else {
      Alert.alert('Config Error', 'Google Login is not configured yet. Please check your Client IDs.');
    }
  };

  const handleAppleSignup = () => {
    Alert.alert('Coming Soon', 'Apple Login setup is in progress. Please use Email/Password for now.');
  };
  const goBackToLogin = () => router.replace('/');

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Main Coral Header Background */}
      <View 
        className="justify-center px-7 bg-coral"
        style={{ height: HEADER_HEIGHT }}
      >
        <View className="-mt-3">
          <Text className="text-white/80 text-[11px] font-semibold uppercase tracking-[2px]">Join Us</Text>
          <Text className="text-white text-[28px] font-black mt-1">Secretra</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 -mt-8 z-10"
      >
        <ScrollView 
          className="flex-1 bg-white rounded-t-[40px]"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View className="flex-1 px-8 pt-8 pb-8">
            <Text className="text-[26px] font-bold text-[#222] mb-1">Create Account</Text>
            <View className="w-[30px] h-[3px] bg-coral rounded-[2px] mb-5" />

            {/* Form Fields Section */}
            <View style={{ flex: 1 }}>
              {/* Name Input */}
              <Text className="text-[11px] font-bold text-[#333] mb-1.5 uppercase tracking-widest">Full Name</Text>
              <View className="flex-row items-center pb-1.5 gap-2">
                <User size={16} color="#aaa" />
                <Text className="text-[#ccc] text-sm">|</Text>
                <TextInput
                  className="flex-1 text-base text-[#333] h-10"
                  placeholder="John Doe"
                  placeholderTextColor="#bbb"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View className="h-[1px] bg-[#eee] mb-3" />

              {/* Email Input */}
              <Text className="text-[11px] font-bold text-[#333] mb-1.5 uppercase tracking-widest">Email</Text>
              <View className="flex-row items-center pb-1.5 gap-2">
                <Mail size={16} color="#aaa" />
                <Text className="text-[#ccc] text-sm">|</Text>
                <TextInput
                  className="flex-1 text-base text-[#333] h-10"
                  placeholder="demo@email.com"
                  placeholderTextColor="#bbb"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View className="h-[1px] bg-[#eee] mb-3" />

              {/* Password Input */}
              <Text className="text-[11px] font-bold text-[#333] mb-1.5 uppercase tracking-widest">Password</Text>
              <View className="flex-row items-center pb-1.5 gap-2">
                <Lock size={16} color="#aaa" />
                <Text className="text-[#ccc] text-sm">|</Text>
                <TextInput
                  className="flex-1 text-base text-[#333] h-10"
                  placeholder="create a strong password"
                  placeholderTextColor="#bbb"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Eye size={16} color="#bbb" />
                </TouchableOpacity>
              </View>
              <View className="h-[1px] bg-[#eee] mb-4" />

              <Text className="text-[12px] text-[#64748b] text-center mb-5">
                By signing up, you agree to our Terms & Privacy Policy.
              </Text>
            </View>

            <View className="mt-4">
              <TouchableOpacity 
                className={`bg-coral h-[54px] rounded-[27px] flex-row items-center justify-center mb-5 ${registerMutation.isPending ? 'opacity-70' : ''}`}
                activeOpacity={0.85} 
                onPress={handleSignup}
                disabled={registerMutation.isPending}
                style={{ boxShadow: '0 4px 16px rgba(232, 122, 110, 0.3)' }}
              >
                {registerMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white text-lg font-bold">Sign Up</Text>
                    <ArrowRight size={18} color="white" className="ml-2" />
                  </>
                )}
              </TouchableOpacity>

              <View className="flex-row items-center gap-3 mb-5">
                <View className="flex-1 h-[1px] bg-[#f1f5f9]" />
                <Text className="text-[11px] text-[#94a3b8] font-semibold uppercase">or sign up with</Text>
                <View className="flex-1 h-[1px] bg-[#f1f5f9]" />
              </View>

              <View className="flex-row justify-center gap-5 mb-6">
                <TouchableOpacity 
                  className="w-[52px] h-[52px] rounded-[26px] border-[1.5px] border-[#f1f5f9] items-center justify-center bg-white" 
                  activeOpacity={0.85} 
                  onPress={handleGoogleSignup}
                  style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}
                >
                  <FontAwesome6 name="google" size={22} color="#DB4437" />
                </TouchableOpacity>

                <TouchableOpacity 
                  className="w-[52px] h-[52px] rounded-[26px] bg-black items-center justify-center overflow-hidden" 
                  activeOpacity={0.85} 
                  onPress={handleAppleSignup}
                >
                  <Ionicons name="logo-apple" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center items-center">
                <Text className="text-sm text-[#64748b]">Already have an account? </Text>
                <TouchableOpacity onPress={goBackToLogin}>
                  <Text className="text-sm text-coral font-bold ml-1">Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}


