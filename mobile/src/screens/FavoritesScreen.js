import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const FavoritesScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        if (!user || !user.token) return; 

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const response = await axios.get(`${API_URL}/users/favorites`, config);
            setFavorites(response.data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [])
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            className="flex-row bg-white p-4 mb-4 rounded-xl shadow-sm items-center"
            onPress={() => navigation.navigate('ArtworkDetail', { id: item._id })}
        >
            <Image 
                source={{ uri: item.imageUrl }} 
                className="w-20 h-20 rounded-lg bg-gray-200"
            />
            <View className="flex-1 ml-4">
                <Text className="font-playfair font-bold text-lg text-artbloom-charcoal" numberOfLines={1}>{item.title}</Text>
                <Text className="text-gray-500 font-medium">${item.price}</Text>
                {/* <Text className="text-gray-400 text-xs mt-1">Artist: {item.artist?.name}</Text> */}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
         return (
             <SafeAreaView className="flex-1 bg-artbloom-cream justify-center items-center">
                 <ActivityIndicator size="large" color="#F2A684" />
             </SafeAreaView>
         );
     }

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream px-4">
            <View className="flex-row items-center mb-6 mt-2">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <Text className="text-lg text-artbloom-charcoal">← Back</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-playfair font-bold text-artbloom-charcoal">Favorites</Text>
            </View>

            {favorites.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500 text-lg">No favorites yet.</Text>
                    <Text className="text-gray-400 mt-2">Go explore and heart some art!</Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

export default FavoritesScreen;
