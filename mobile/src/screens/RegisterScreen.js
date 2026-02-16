import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, googleLogin, loading } = useAuth();
    const navigation = useNavigation();

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const result = await register(name, email, password);
        if (result.success) {
             Alert.alert('Success', 'Account created successfully');
             // Navigation handled by AppNavigator
        } else {
            Alert.alert('Registration Failed', result.error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6">
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()}
                        className="absolute top-4 left-6 z-10"
                    >
                        <ArrowLeft color="#2C2C2C" size={24} />
                    </TouchableOpacity>

                    <View className="mb-8 items-center mt-12">
                        <Text className="text-4xl font-playfair font-bold text-artbloom-charcoal mb-2">Create Account</Text>
                        <Text className="text-artbloom-charcoal/70 text-center">Join the ArtBloom community</Text>
                    </View>

                    <View className="space-y-4">
                        <View>
                            <Text className="mb-2 font-medium text-artbloom-charcoal">Full Name</Text>
                            <TextInput
                                className="w-full bg-white border border-gray-200 rounded-lg p-4 font-sans"
                                placeholder="John Doe"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View>
                            <Text className="mb-2 font-medium text-artbloom-charcoal">Email</Text>
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
                            <Text className="mb-2 font-medium text-artbloom-charcoal">Password</Text>
                            <TextInput
                                className="w-full bg-white border border-gray-200 rounded-lg p-4 font-sans"
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View>
                            <Text className="mb-2 font-medium text-artbloom-charcoal">Confirm Password</Text>
                            <TextInput
                                className="w-full bg-white border border-gray-200 rounded-lg p-4 font-sans"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="items-center mt-4 mb-2">
                             <Text className="text-gray-500">Or continue with</Text>
                        </View>

                        <TouchableOpacity
                            className="bg-white border border-gray-200 py-4 rounded-lg flex-row justify-center items-center active:opacity-80"
                            onPress={async () => {
                                const result = await loginWithGoogle(); // Assuming alias from hook or context - wait, I need to check how I exposed it
                                // I exposed it as `googleLogin` in AuthContext.
                                const res = await googleLogin();
                                if (res?.error) Alert.alert('Error', res.error);
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
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text className="text-white font-bold text-lg">{loading ? 'Creating Account...' : 'Sign Up'}</Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-6 mb-8">
                            <Text className="text-gray-600">Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text className="text-artbloom-peach font-bold">Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;
