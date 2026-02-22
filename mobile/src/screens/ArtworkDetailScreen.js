import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ArrowLeft, ShoppingCart, Heart } from 'lucide-react-native';
import { API_URL } from '../constants/config';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import ImageViewing from "react-native-image-viewing";

const ArtworkDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params;
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLightboxVisible, setIsLightboxVisible] = useState(false);
    const { addToCart, cartItems } = useCart();

    useEffect(() => {
        fetchArtworkDetails();
    }, [id]);

    const fetchArtworkDetails = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/artworks/${id}`);
            setArtwork(data);
        } catch (error) {
            console.error('Error details:', error);
            Alert.alert('Error', 'Failed to load artwork details');
        } finally {
            setLoading(false);
        }
    };

    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (user) {
            checkIfFavorite();
        }
    }, [user, id]);

    const checkIfFavorite = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/users/favorites`);
            // Check if current artwork/id is in the user's favorites list
            // Favorites endpoint returns full objects, so we compare _id
            const isFav = data.some(fav => fav._id === id);
            setIsFavorite(isFav);
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    };

    const toggleFavorite = async () => {
        if (!user) {
            Alert.alert('Login Required', 'Please login to add favorites');
            return;
        }

        try {
            if (isFavorite) {
                await axios.delete(`${API_URL}/users/favorites/${id}`);
                setIsFavorite(false);
            } else {
                await axios.post(`${API_URL}/users/favorites/${id}`);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            Alert.alert('Error', 'Failed to update favorite status');
        }
    };
    
    // Check if item is already in cart
    const isInCart = cartItems.some(item => item._id === id);

    const handleCartAction = () => {
        if (isInCart) {
            navigation.navigate('MainTabs', { screen: 'CartTab' }); // Go to Cart (Nested)
        } else {
            addToCart(artwork);
            Alert.alert('Success', 'Added to cart');
        }
    };

    if (loading) {
        return <View className="flex-1 items-center justify-center bg-artbloom-cream"><ActivityIndicator size="large" color="#F2A684" /></View>;
    }

    if (!artwork) {
        return <View className="flex-1 items-center justify-center bg-artbloom-cream"><Text>Artwork not found</Text></View>;
    }
    
    const isFree = ['digital_art', 'photography', 'drawing', 'Water Painting'].includes(artwork.category) || parseFloat(artwork.price) === 0;

    return (
        <View className="flex-1 bg-artbloom-cream">
            {!isLightboxVisible && (
                <SafeAreaView className="absolute top-0 left-0 right-0 z-10" edges={['top']}>
                    <View className="flex-row justify-between w-full px-4 pt-2">
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()}
                            className="bg-white p-3 rounded-full shadow-md items-center justify-center border border-gray-100"
                        >
                             <ArrowLeft color="#2C2C2C" size={20} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            onPress={toggleFavorite}
                            className="bg-white p-3 rounded-full shadow-md items-center justify-center border border-gray-100"
                        >
                             <Heart 
                                color={isFavorite ? "#EF4444" : "#2C2C2C"} 
                                fill={isFavorite ? "#EF4444" : "transparent"} 
                                size={20} 
                             />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}

            <ScrollView className="bg-artbloom-cream" bounces={false} showsVerticalScrollIndicator={false}>
                <View className="w-full pt-10 pb-4">
                    <TouchableOpacity activeOpacity={0.9} onPress={() => setIsLightboxVisible(true)}>
                        <Image 
                            source={{ uri: artwork.imageUrl }} 
                            className="w-full h-[400px]"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
                
                <View className="p-6 bg-artbloom-cream -mt-8 rounded-t-[32px] shadow-sm pb-12">
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-1 pr-4">
                            <Text className="text-3xl font-playfair font-bold text-artbloom-charcoal mb-1">{artwork.title}</Text>
                            <Text className="text-artbloom-charcoal/70 text-lg">by {artwork.artist?.name || 'Unknown Artist'}</Text>
                        </View>
                        <View className="flex-shrink-0 items-end">
                            {isFree ? (
                                <Text className="text-xl font-bold text-gray-400 italic mt-1">Free</Text>
                            ) : (
                                <Text className="text-3xl font-bold text-artbloom-peach mt-1">${artwork.price}</Text>
                            )}
                        </View>
                    </View>

                    <View className="border-t border-gray-200 py-4 mb-4">
                        <Text className="font-bold text-artbloom-charcoal mb-2">Description</Text>
                        <Text className="text-gray-600 leading-6">{artwork.description}</Text>
                    </View>

                    <View className="flex-row justify-between items-center mb-6 mt-2">
                        <View>
                            <Text className="text-gray-500 text-xs">Category</Text>
                            <Text className="font-medium text-artbloom-charcoal capitalize">{artwork.category.replace(/_/g, ' ')}</Text>
                        </View>
                        {!isFree && (
                            <View>
                                <Text className="text-gray-500 text-xs">Stock</Text>
                                <Text className="font-medium text-artbloom-charcoal">{artwork.stock > 0 ? 'In Stock' : 'Sold Out'}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
            
            <ImageViewing
                images={[{ uri: artwork.imageUrl }]}
                imageIndex={0}
                visible={isLightboxVisible}
                onRequestClose={() => setIsLightboxVisible(false)}
            />

            <View className="p-4 bg-white shadow-lg border-t border-gray-100 flex-row justify-between">
                {isFree ? (
                    <TouchableOpacity 
                        className="flex-1 flex-row items-center justify-center py-4 rounded-xl bg-artbloom-peach active:opacity-90"
                        onPress={() => setIsLightboxVisible(true)}
                    >
                        <Text className="text-white font-bold text-lg">View Artwork</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity 
                            className="flex-[0.8] flex-row items-center justify-center py-4 rounded-xl bg-white border border-gray-200 active:opacity-90 mr-3 shadow-sm"
                            onPress={() => setIsLightboxVisible(true)}
                        >
                            <Text className="text-artbloom-charcoal font-bold text-lg">View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            className={`flex-[1.2] flex-row items-center justify-center py-4 rounded-xl active:opacity-90 ${isInCart ? 'bg-green-500' : 'bg-artbloom-peach'}`}
                            onPress={handleCartAction}
                        >
                            <ShoppingCart color="white" size={20} className="mr-2" />
                            <Text className="text-white font-bold text-lg ml-2">
                                {isInCart ? 'Go to Cart' : 'Add to Cart'}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

export default ArtworkDetailScreen;
