import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import axios from 'axios';
import { API_URL } from '../constants/config';

const UserListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { type, userId } = route.params; // type: 'followers' | 'following'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const title = type === 'followers' ? 'Followers' : 'Following';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const endpoint = type === 'followers' 
                ? `${API_URL}/users/${userId}/followers` 
                : `${API_URL}/users/${userId}/following`;
            
            const { data } = await axios.get(endpoint);
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            className="flex-row items-center p-4 bg-white border-b border-gray-100"
            onPress={() => navigation.push('UserProfile', { userId: item._id, user: item })}
        >
            <Image 
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
                className="w-12 h-12 rounded-full bg-gray-200"
            />
            <View className="ml-4 flex-1">
                <Text className="text-artbloom-charcoal font-bold text-base">{item.name}</Text>
                {item.username && (
                    <Text className="text-gray-500 text-sm">@{item.username}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream">
            <View className="flex-row items-center p-4 bg-white shadow-sm border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft size={24} color="#2C2C2C" />
                </TouchableOpacity>
                <Text className="text-xl font-playfair font-bold text-artbloom-charcoal">{title}</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#eb7d4a" />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center p-8 mt-10">
                            <Text className="text-gray-500 text-lg text-center">No {type} found.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default UserListScreen;
