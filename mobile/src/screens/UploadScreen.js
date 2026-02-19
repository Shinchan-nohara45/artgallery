import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
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
    const [stock, setStock] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
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

        if (!title || !price || !image) {
            Alert.alert('Error', 'Please provide title, price, and image');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('price', price);
            const normalizedCategory = category.toLowerCase().trim().replace(/\s+/g, '_');
            formData.append('category', normalizedCategory);
            formData.append('stock', stock || '1');
            
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

            console.log('Uploading with headers:', config.headers);
            // console.log('FormData:', JSON.stringify(formData)); // FormData is hard to stringify correctly, skipping

            await axios.post(`${API_URL}/artworks`, formData, config);
            Alert.alert('Success', 'Artwork uploaded successfully!');
            // Reset form
            setTitle('');
            setDescription('');
            setPrice('');
            setCategory('');
            setStock('');
            setImage(null);
        } catch (error) {
            console.error('Upload error full:', error);
            console.error('Upload error response:', error.response);
            console.error('Upload error data:', error.response?.data);
            Alert.alert('Error', `Failed to upload: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream">
            <ScrollView className="p-4">
                <Text className="text-3xl font-playfair font-bold text-artbloom-charcoal mb-6">Sell Your Art</Text>

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
                        <Text className="mb-2 font-medium text-artbloom-charcoal">Category</Text>
                        <TextInput
                            className="w-full bg-white border border-gray-200 rounded-lg p-4 font-sans"
                            placeholder="e.g. Painting, Digital, Drawing, Sculpture, Water Painting, Sketch"
                            value={category}
                            onChangeText={setCategory}
                        />
                    </View>
                    
                    <View>
                        <Text className="mb-2 font-medium text-artbloom-charcoal">Stock</Text>
                        <TextInput
                            className="w-full bg-white border border-gray-200 rounded-lg p-4 font-sans"
                            placeholder="1"
                            value={stock}
                            onChangeText={setStock}
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
