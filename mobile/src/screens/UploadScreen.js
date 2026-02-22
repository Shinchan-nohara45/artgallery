import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants/config';
import { Upload } from 'lucide-react-native';

const UploadScreen = () => {
    const { user, isAuthenticated } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    // Stock defaults to 1 internally, no UI needed as per request
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);

    // Categories that are "Safe for Price" (High Effort)
    const PAID_CATEGORIES = ['painting', 'sculpture', 'sketch'];
    // Categories that must be free
    const FREE_CATEGORIES = ['digital_art', 'photography','drawing', 'Water Painting'];

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true, // Keep editing enabled for cropping if user wants, but remove fixed aspect
                quality: 1,
            });

            console.log('ImagePicker Result:', result);

            if (!result.canceled) {
                setImage(result.assets[0]);
            }
        } catch (error) {
             console.error('ImagePicker Error:', error);
             Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleUpload = async () => {
        if (!isAuthenticated) {
            Alert.alert('Error', 'You must be logged in to upload artwork');
            return;
        }

        const normalizedCategory = category.toLowerCase().trim().replace(/\s+/g, '_');
        const isFreeCategory = FREE_CATEGORIES.some(c => normalizedCategory.includes(c));

        // Validation for Price logic
        if (isFreeCategory && parseFloat(price) > 0) {
             Alert.alert('Pricing Policy', 'Digital Art and Photography must be free. Only physical/high-effort artworks can have a price.');
             setPrice('0');
             return;
        }

        if (!title || !image) {
            Alert.alert('Error', 'Please provide title and image');
            return;
        }
        
        // If price is missing for paid category, warn. If free category, default to 0.
        if (!price && !isFreeCategory) {
             Alert.alert('Error', 'Please provide a price for this artwork.');
             return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('price', isFreeCategory ? '0' : price);
            formData.append('category', normalizedCategory);
            formData.append('stock', '1'); // Default to 1, no stock update allowed
            
            // Image upload
            const uriParts = image.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append('artworkImage', {
                uri: image.uri,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                   // Authorization header is already set globally in axios defaults by AuthContext
                },
            };

            await axios.post(`${API_URL}/artworks`, formData, config);
            Alert.alert('Success', 'Artwork uploaded successfully!');
            // Reset form
            setTitle('');
            setDescription('');
            setPrice('');
            setCategory('');
            setImage(null);
        } catch (error) {
            console.error('Upload error full:', error);
            const message = error.response?.data?.message || error.message;
            Alert.alert('Error', `Failed to upload: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream">
            <ScrollView className="p-4">
                <View className="bg-white rounded-xl shadow-sm p-4 mb-6 items-center border border-gray-100">
                    <Text className="text-2xl font-playfair font-bold text-artbloom-charcoal">Sell Your Art </Text>
                </View>

                <View className="space-y-4 mb-8">
                    <View>
                        <Text className="mb-2 font-medium text-artbloom-charcoal">Artwork Title</Text>
                        <TextInput
                            className="w-full bg-white border border-gray-200 rounded-lg p-4 font-sans"
                            placeholder="e.g. Sunset Dreams"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View>
                        <Text className="mb-2 font-medium text-artbloom-charcoal">Category</Text>
                        
                        <TouchableOpacity 
                            onPress={() => setOpenDropdown(true)}
                            className="w-full bg-white border border-gray-200 rounded-lg p-4 flex-row justify-between items-center active:bg-gray-50"
                        >
                            <Text className={`font-sans ${category ? "text-artbloom-charcoal" : "text-gray-400"}`}>
                                {category ? category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Select Category"}
                            </Text>
                            <Text className="text-gray-400">▼</Text>
                        </TouchableOpacity>

                        <Modal
                            visible={openDropdown}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setOpenDropdown(false)}
                        >
                             <TouchableOpacity 
                                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
                                activeOpacity={1}
                                onPress={() => setOpenDropdown(false)}
                             >
                                <View style={{ width: '85%', maxHeight: '60%', backgroundColor: 'white', borderRadius: 20, overflow: 'hidden' }}>
                                    <View className="p-4 border-b border-artbloom-peach bg-gray-50 flex-row justify-between items-center">
                                        <Text className="text-lg font-playfair font-bold text-artbloom-charcoal">Select Category</Text>
                                        <TouchableOpacity onPress={() => setOpenDropdown(false)}>
                                            <Text className="text-bold text-black font-bold">✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView bounces={false}>
                                        {[...PAID_CATEGORIES, ...FREE_CATEGORIES].map((item, index) => (
                                            <TouchableOpacity 
                                                key={item} 
                                                className={`p-4 border-b border-gray-100 flex-row justify-between items-center ${category === item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ? 'bg-artbloom-peach/10' : ''}`}
                                                onPress={() => {
                                                    const formatted = item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                    setCategory(formatted);
                                                    setOpenDropdown(false);
                                                }}
                                            >
                                                <Text className={`text-base font-sans ${category === item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ? 'text-artbloom-peach font-bold' : 'text-gray-700'}`}>
                                                    {item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </Text>
                                                {category === item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) && (
                                                    <Text className="text-artbloom-peach">✓</Text>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                             </TouchableOpacity>
                        </Modal>

                        <Text className="text-xs text-gray-500 mt-1">
                            Note: Digital Art & Photography must be free ($0).
                        </Text>
                    </View>

                    <View>
                        <Text className="mb-2 font-medium text-artbloom-charcoal">Price ($)</Text>
                        <TextInput
                            className="w-full bg-white border border-gray-200 rounded-lg p-4 font-sans"
                            placeholder="0.00"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                    </View>

                    <View>
                        <Text className="mb-2 font-medium text-artbloom-charcoal">Description</Text>
                        <TextInput
                            className="w-full bg-white border border-gray-200 rounded-lg p-4 font-sans"
                            placeholder="Tell us about this piece..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            style={{ textAlignVertical: 'top' }}
                        />
                    </View>

                    <TouchableOpacity 
                        className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center mt-2"
                        onPress={pickImage}
                    >
                        {image ? (
                            <Image source={{ uri: image.uri }} className="w-full h-48 rounded-lg" resizeMode="contain" />
                        ) : (
                            <>
                                <Upload size={32} color="#9CA3AF" />
                                <Text className="text-gray-400 mt-2">Tap to upload image</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    className={`bg-artbloom-peach py-4 rounded-xl items-center mb-10 ${loading ? 'opacity-70' : ''}`}
                    onPress={handleUpload}
                    disabled={loading}
                >
                    {loading ? (
                         <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Upload Artwork</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default UploadScreen;
