import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, Edit } from 'lucide-react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/config';
import { useNavigation } from '@react-navigation/native';

const ManageUploadsScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUserArtworks = async () => {
        try {
            const response = await axios.get(`${API_URL}/artworks/user/${user._id}`);
            setArtworks(response.data);
        } catch (error) {
            console.error('Error fetching uploads:', error);
            Alert.alert('Error', 'Failed to load your artworks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserArtworks();
        }
    }, [user]);

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Artwork',
            'Are you sure you want to delete this artwork?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_URL}/artworks/${id}`);
                            setArtworks(prev => prev.filter(art => art._id !== id));
                            Alert.alert('Success', 'Artwork deleted');
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Failed to delete artwork');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View className="flex-row bg-white p-4 mb-4 rounded-xl shadow-sm items-center">
            <Image 
                source={{ uri: item.imageUrl }} 
                className="w-20 h-20 rounded-lg bg-gray-200"
            />
            <View className="flex-1 ml-4">
                <Text className="font-playfair font-bold text-lg text-artbloom-charcoal" numberOfLines={1}>{item.title}</Text>
                <Text className="text-gray-500 font-medium">${item.price}</Text>
                <Text className="text-gray-400 text-xs mt-1">Stock: {item.stock}</Text>
            </View>
            <View className="flex-row space-x-3">
                 {/* Edit functionality to be implemented fully later, for now just placeholder or simple alert */}
                <TouchableOpacity onPress={() => navigation.navigate('EditArtwork', { artwork: item })}> 
                    <Edit size={20} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                    <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
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
                    <Text className="text-lg text-black">← Back</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-playfair font-bold text-artbloom-charcoal">My Uploads</Text>
            </View>

            {artworks.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500 text-lg">You haven't uploaded any art yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={artworks}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

export default ManageUploadsScreen;
