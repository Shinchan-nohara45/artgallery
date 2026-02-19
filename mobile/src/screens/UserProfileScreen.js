import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Mail } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../constants/config';

const UserProfileScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { userId } = route.params; // Get userId passed from navigation

    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [userArtworks, setUserArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth(); // Get current logged in user

    useEffect(() => {
        fetchUserData();
        fetchSocialData();
    }, [userId]);

    const fetchSocialData = async () => {
        try {
            const { data: followers } = await axios.get(`${API_URL}/users/${userId}/followers`);
            setFollowersCount(followers.length);
            if (currentUser) {
                const isFound = followers.some(f => f._id === currentUser._id);
                setIsFollowing(isFound);
            }
        } catch (error) {
            console.error('Error fetching social data:', error);
        }
    };

    const handleFollow = async () => {
        if (!currentUser) {
            // Navigate to login if not logged in
            navigation.navigate('Profile'); 
            return;
        }

        // Optimistic update
        const prevIsFollowing = isFollowing;
        const prevCount = followersCount;
        
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => !prevIsFollowing ? prev + 1 : prev - 1);

        try {
            const config = {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            };
            const { data } = await axios.post(`${API_URL}/users/${userId}/follow`, {}, config);
            
            // Sync with server response if needed, but optimistic is usually fine
            setIsFollowing(data.isFollowing); 
            
            // If the server response implies a different state than we predicted (rare), revert/fix
            // converting boolean back to count adjustment if needed is complex, so maybe just refetch
            if (data.isFollowing !== (!prevIsFollowing)) {
                 fetchSocialData();
            }

        } catch (error) {
            console.error('Error toggling follow:', error);
            // Revert on error
            setIsFollowing(prevIsFollowing);
            setFollowersCount(prevCount);
            Alert.alert('Error', 'Failed to update follow status');
        }
    };

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const artworksRes = await axios.get(`${API_URL}/artworks/user/${userId}`);
            setUserArtworks(artworksRes.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get passed params safely 
    const passedUser = route.params.user || {};

    const renderArtwork = ({ item }) => (
        <TouchableOpacity 
            className="w-[48%] mb-4 bg-white rounded-lg shadow-sm overflow-hidden"
            onPress={() => navigation.navigate('ArtworkDetail', { id: item._id })}
        >
            <Image 
                source={{ uri: item.imageUrl }} 
                className="w-full h-40"
                resizeMode="cover"
            />
            <View className="p-3">
                <Text className="font-playfair font-bold text-artbloom-charcoal text-base" numberOfLines={1}>{item.title}</Text>
                <Text className="font-bold text-artbloom-peach">${item.price}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream">
            <View className="flex-row items-center p-4 border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft size={24} color="#2C2C2C" />
                </TouchableOpacity>
                <Text className="text-xl font-playfair font-bold text-artbloom-charcoal">Artist Profile</Text>
            </View>

            <View className="p-6 bg-white mb-2 shadow-sm">
                <View className="flex-row items-center justify-between">
                    {/* Left Side: Info */}
                    <View className="flex-1 mr-4">
                        <Text className="text-2xl font-playfair font-bold text-artbloom-charcoal mb-0">{passedUser.name || 'Artist'}</Text>
                        {passedUser.username && <Text className="text-artbloom-peach font-medium mb-3">@{passedUser.username}</Text>}
                        
                        <View className="flex-row items-center space-x-6 mb-4 gap-6">
                            <View>
                                <Text className="font-bold text-lg text-artbloom-charcoal">{followersCount}</Text>
                                <Text className="text-xs text-gray-500 uppercase tracking-wide">Followers</Text>
                            </View>
                            <View>
                                <Text className="font-bold text-lg text-artbloom-charcoal">{userArtworks.length}</Text>
                                <Text className="text-xs text-gray-500 uppercase tracking-wide">Artworks</Text>
                            </View>
                        </View>

                        {currentUser && currentUser._id !== userId && (
                            <TouchableOpacity 
                                className={`px-6 py-2 rounded-full self-start ${isFollowing ? 'bg-gray-200' : 'bg-artbloom-peach'}`}
                                onPress={handleFollow}
                            >
                                <Text className={`font-bold ${isFollowing ? 'text-gray-700' : 'text-white'}`}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                     {/* Right Side: Image */}
                    <View className="self-start"> 
                        <Image 
                            source={{ uri: passedUser.imageUrl || 'https://via.placeholder.com/150' }} 
                            className="w-24 h-24 rounded-full border-2 border-artbloom-peach"
                        />
                    </View>
                </View>
            </View>

            <View className="flex-1 p-4">
                <Text className="text-lg font-bold text-artbloom-charcoal mb-4">Artworks</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#eb7d4a" />
                ) : (
                    <FlatList
                        data={userArtworks}
                        renderItem={renderArtwork}
                        keyExtractor={(item) => item._id}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="items-center py-10">
                                <Text className="text-gray-400">No artworks shared yet.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default UserProfileScreen;
