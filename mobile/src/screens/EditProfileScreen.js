import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';
import axios from 'axios';
import { API_URL } from '../constants/config';

const EditProfileScreen = () => {
    const { user, updateUser } = useAuth();
    const navigation = useNavigation();
    
    // Safety check for user
    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-artbloom-cream items-center justify-center">
                <Text>Please login to edit profile</Text>
            </SafeAreaView>
        );
    }

    const [name, setName] = useState(user.name || '');
    const [username, setUsername] = useState(user.username || '');
    const [image, setImage] = useState(user.imageUrl || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setUsername(user.username || '');
            setImage(user.imageUrl);
        }
    }, [user]);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('PickImage Error:', error);
            Alert.alert('Error', `Failed to open image picker: ${error.message}`);
        }
    };

    const handleSave = async () => {
        if (!name || !username) {
            Alert.alert('Error', 'Name and Username are required');
            return;
        }

        // Validate username format
        const usernameRegex = /^[a-z0-9._-]+$/;
        if (!usernameRegex.test(username)) {
             Alert.alert('Invalid Username', 'Username can only contain lowercase letters, numbers, underscores, dots, and dashes.');
             return;
        }
        
        // Single dash/dot check
        const dashCount = (username.match(/-/g) || []).length;
        const dotCount = (username.match(/\./g) || []).length;
        if (dashCount > 1 || dotCount > 1) {
             Alert.alert('Invalid Username', 'Username can contain at most one dash and one dot.');
             return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('username', username);

            if (image && image !== user.imageUrl) {
                // Determine file type from extension
                const uriParts = image.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append('profileImage', {
                    uri: image,
                    name: `profile.${fileType}`,
                    type: `image/${fileType}`,
                });
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`, // Fixed: use user.token
                },
            };

            const { data } = await axios.put(`${API_URL}/users/profile`, formData, config);
            
            // Update local user context
            if (updateUser) {
                 await updateUser(data); 
            }
            
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error('Update Error:', error);
            const message = error.response?.data?.message || 'Failed to update profile';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream">
            <View className="flex-row items-center p-4 border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft size={24} color="#2C2C2C" />
                </TouchableOpacity>
                <Text className="text-xl font-playfair font-bold text-artbloom-charcoal">Edit Profile</Text>
                <View className="flex-1" />
                {/* Save button in header */}
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#eb7d4a" /> : <Save size={24} color="#eb7d4a" />}
                </TouchableOpacity>
            </View>

            <ScrollView className="p-6">
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={pickImage} className="relative">
                        <Image 
                            source={image ? { uri: image } : { uri: 'https://via.placeholder.com/150' }} 
                            className="w-32 h-32 rounded-full border-4 border-white shadow-sm"
                        />
                        <View className="absolute bottom-0 right-0 bg-artbloom-peach p-2 rounded-full border-2 border-white">
                            <Camera size={20} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-artbloom-charcoal/60 mt-2 text-sm">Tap to change photo</Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-artbloom-charcoal font-medium mb-2 ml-1">Full Name</Text>
                        <TextInput
                            className="bg-white p-4 rounded-xl border border-gray-200 font-sans text-artbloom-charcoal"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                        />
                    </View>

                    <View>
                        <Text className="text-artbloom-charcoal font-medium mb-2 ml-1">Username</Text>
                        <TextInput
                            className="bg-white p-4 rounded-xl border border-gray-200 font-sans text-artbloom-charcoal"
                            value={username}
                            onChangeText={(text) => setUsername(text.toLowerCase())} // Enforce lowercase view
                            placeholder="username"
                            autoCapitalize="none"
                        />
                        <Text className="text-xs text-gray-500 mt-1 ml-1">
                            Lowercase, numbers, underscores, single dot/dash allowed.
                        </Text>
                    </View>
                </View>

                <TouchableOpacity 
                    className="bg-artbloom-peach py-4 rounded-xl items-center mt-8 shadow-sm active:opacity-90"
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text className="text-white font-bold text-lg">Save Changes</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfileScreen;
