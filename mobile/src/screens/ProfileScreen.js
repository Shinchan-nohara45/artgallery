import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../constants/config';
import { LogOut, User, Settings, ShoppingBag, Heart, ChevronRight, MapPin } from 'lucide-react-native';

const ProfileScreen = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigation = useNavigation();

    const handleMyOrders = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/orders/myorders`);
            if (data && data.length > 0) {
                 // Navigate to Orders screen if it exists, for now Cart is the placeholder
                 navigation.navigate('Orders');
            } else {
                 Alert.alert(
                     'No Orders', 
                     "You haven't placed any orders yet. Please go to discover page to explore the art works.",
                     [
                         { text: 'Cancel', style: 'cancel' },
                         { text: 'Go to Discover', onPress: () => navigation.navigate('DiscoverTab') }
                     ]
                 );
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Fallback navigation or alert
            Alert.alert('Error', 'Failed to fetch orders');
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Logout", onPress: async () => {
                  await logout();
                  // Navigation handled by AppNavigator
              }}
            ]
        );
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView className="flex-1 bg-artbloom-cream items-center justify-center p-6">
                <Text className="text-2xl font-playfair font-bold text-artbloom-charcoal mb-4">Guest User</Text>
                <Text className="text-center text-gray-600 mb-8">Sign in to view your profile, manage orders, and save your favorite artworks.</Text>
                <TouchableOpacity 
                    className="bg-artbloom-peach px-8 py-3 rounded-full w-full items-center"
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text className="text-white font-bold text-lg">Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className="mt-4"
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text className="text-artbloom-peach font-bold">Create Account</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header Profile Info */}
                <View className="bg-white p-6 mb-4 shadow-sm rounded-b-3xl items-center">
                    <View className="h-24 w-24 bg-artbloom-clay/30 rounded-full items-center justify-center mb-4 overflow-hidden">
                        {user?.imageUrl ? (
                            <Image source={{ uri: user.imageUrl }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <User size={40} color="#6B4C3E" />
                        )}
                    </View>
                    <Text className="text-2xl font-playfair font-bold text-artbloom-charcoal">{user?.name}</Text>
                    <Text className="text-gray-500 mb-2">{user?.email}</Text>
                    {user?.isAdmin && <View className="bg-artbloom-gold/20 px-3 py-1 rounded-full"><Text className="text-artbloom-gold text-xs font-bold">Admin</Text></View>}
                </View>

                {/* Menu Items */}
                <View className="px-4 space-y-4">
                    {/* Personalisation Section */}
                    <Text className="text-lg font-bold text-artbloom-charcoal ml-2 mb-2">Personalisation</Text>
                    <TouchableOpacity 
                        className="bg-white p-4 rounded-xl flex-row items-center justify-between shadow-sm mb-4"
                        onPress={() => navigation.navigate('Address')}
                    >
                        <View className="flex-row items-center">
                            <View className="bg-orange-100 p-2 rounded-full mr-4">
                                <MapPin size={20} color="#F97316" />
                            </View>
                            <Text className="font-medium text-lg text-artbloom-charcoal">My Address</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="bg-white p-4 rounded-xl flex-row items-center justify-between shadow-sm mb-6"
                        onPress={() => navigation.navigate('Favorites')}
                    >
                        <View className="flex-row items-center">
                            <View className="bg-pink-100 p-2 rounded-full mr-4">
                                <Heart size={20} color="#EC4899" />
                            </View>
                            <Text className="font-medium text-lg text-artbloom-charcoal">My Wish List</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>


                    <Text className="text-lg font-bold text-artbloom-charcoal ml-2 mb-2">My Account</Text>
                    


                    <TouchableOpacity 
                        className="bg-white p-4 rounded-xl flex-row items-center justify-between shadow-sm"
                        onPress={() => navigation.navigate('Orders')} 
                    >
                        <View className="flex-row items-center">
                            <View className="bg-blue-100 p-2 rounded-full mr-4">
                                <ShoppingBag size={20} color="#3B82F6" />
                            </View>
                            <Text className="font-medium text-lg text-artbloom-charcoal">My Orders</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="bg-white p-4 rounded-xl flex-row items-center justify-between shadow-sm"
                         onPress={() => navigation.navigate('Favorites')}
                    >
                        <View className="flex-row items-center">
                            <View className="bg-red-100 p-2 rounded-full mr-4">
                                <Heart size={20} color="#EF4444" />
                            </View>
                            <Text className="font-medium text-lg text-artbloom-charcoal">Favorites</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="bg-white p-4 rounded-xl flex-row items-center justify-between shadow-sm"
                        onPress={() => navigation.navigate('ManageUploads')}
                    >
                        <View className="flex-row items-center">
                            <View className="bg-gray-100 p-2 rounded-full mr-4">
                                <Settings size={20} color="#4B5563" />
                            </View>
                            <Text className="font-medium text-lg text-artbloom-charcoal">Manage Uploads</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="bg-white p-4 rounded-xl flex-row items-center justify-between shadow-sm mt-6"
                        onPress={handleLogout}
                    >
                        <View className="flex-row items-center">
                            <View className="bg-red-50 p-2 rounded-full mr-4">
                                <LogOut size={20} color="#EF4444" />
                            </View>
                            <Text className="font-medium text-lg text-red-500">Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;
