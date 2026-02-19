import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, MapPin, Home, Briefcase, Check } from 'lucide-react-native';
import axios from 'axios';
import { API_URL } from '../constants/config';

const AddressScreen = ({ route }) => {
    const navigation = useNavigation();
    const { user, loading: authLoading } = useAuth();
    const isFocused = useIsFocused();
    const [addresses, setAddresses] = useState([]);
    
    // Check if we are in selection mode (from Checkout)
    const selectMode = route.params?.selectMode || false;

    useEffect(() => {
        if (isFocused) {
            fetchAddresses();
        }
    }, [isFocused]);

    const fetchAddresses = async () => {
        if (!user) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`${API_URL}/users/profile`, config);
            setAddresses(data.addresses || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            // Optional: Handle 401 specifically to logout or refresh?
        }
    };

    const handleSelectAddress = (address) => {
        if (selectMode) {
            // Navigate back to Checkout with the selected address
            navigation.navigate('Checkout', { selectedAddress: address });
        }
    };

    const getIcon = (label) => {
        switch(label) {
            case 'Home': return <Home size={20} color="#dc5d21ff" />;
            case 'Work': return <Briefcase size={20} color="#3B82F6" />;
            default: return <MapPin size={20} color="#9CA3AF" />;
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            className={`bg-white p-4 rounded-xl mb-3 shadow-sm flex-row items-center justify-between border ${selectMode ? 'border-artbloom-peach' : 'border-gray-100'}`}
            onPress={() => handleSelectAddress(item)}
            disabled={!selectMode}
        >
            <View className="flex-row items-center flex-1">
                <View className="bg-gray-50 p-3 rounded-full mr-3">
                    {getIcon(item.label)}
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-artbloom-charcoal text-base mb-1">{item.label}</Text>
                    <Text className="text-gray-600">{item.address}, {item.city}</Text>
                    <Text className="text-gray-500 text-xs">{item.postalCode}, {item.country}</Text>
                </View>
            </View>
            {item.isDefault && (
                <View className="bg-green-100 px-2 py-1 rounded-full mr-2">
                    <Text className="text-green-600 text-xs font-bold">Default</Text>
                </View>
            )}
            {selectMode && (
                <View className="bg-artbloom-peach/10 p-2 rounded-full">
                   <Check size={16} color="#dc5d21ff" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream">
            <View className="flex-row items-center p-4 bg-white shadow-sm z-10 w-full">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft size={24} color="#000000ff" />
                </TouchableOpacity>
                <Text className="text-xl font-bold font-playfair text-artbloom-charcoal">
                    {selectMode ? 'Select Address' : 'My Addresses'}
                </Text>
            </View>

            <View className="flex-1 p-4">
                {addresses.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <MapPin size={48} color="#D1D5DB" />
                        <Text className="text-gray-500 mt-4 text-center">No saved addresses found.{'\n'}Add one to get started!</Text>
                    </View>
                ) : (
                    <FlatList
                        data={addresses}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}

                <TouchableOpacity
                    className="absolute bottom-6 left-4 right-4 bg-artbloom-peach py-4 rounded-xl flex-row items-center justify-center shadow-lg active:opacity-90"
                    onPress={() => navigation.navigate('AddAddress')}
                >
                    <Plus size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Add New Address</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default AddressScreen;
