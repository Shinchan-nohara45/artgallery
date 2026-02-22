import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, googleLogin, loading } = useAuth();
    const navigation = useNavigation();

    const handleLogin = async () => {

        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const result = await login(email, password);
        if (result.success) {
            // Navigation handled by AppNavigator based on auth state
        } else {
            Alert.alert('Login Failed', result.error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6">
                    <View className="mb-8 items-center">
                        <Text className="text-4xl font-playfair font-bold text-artbloom-charcoal mb-2">Welcome Back</Text>
                        <Text className="text-artbloom-charcoal/70 text-center">Sign in to continue to ArtBloom</Text>
                    </View>

                    <View className="space-y-4">
                        <View>
                            <Text className="mb-2 font-medium text-black">Email</Text>
                            <TextInput
                                className="w-full bg-white border border-gray-200 rounded-lg p-4 font-sans"
                                placeholder="your.email@example.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View>
                            <Text className="mb-2 font-medium text-black">Password</Text>
                            <TextInput
                                className="w-full bg-white border border-gray-200 rounded-lg p-4 font-sans"
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="items-center mt-4 mb-2">
                             <Text className="text-black">Or continue with</Text>
                        </View>

                        <TouchableOpacity
                            className="bg-white border border-gray-200 py-4 rounded-lg flex-row justify-center items-center active:opacity-80"
                            onPress={async () => {
                                const result = await googleLogin();
                                if (result?.error) Alert.alert('Error', result.error);
                            }}
                        >
                            <Image 
                                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
                                style={{ width: 24, height: 24, marginRight: 10 }}
                                resizeMode="contain"
                            />
                            <Text className="text-gray-700 font-bold text-lg">Sign in with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-artbloom-peach py-4 rounded-lg items-center mt-4 active:opacity-80"
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text className="text-white font-bold text-lg">{loading ? 'Signing in...' : 'Sign In'}</Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-gray-600">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text className="text-artbloom-peach font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;
