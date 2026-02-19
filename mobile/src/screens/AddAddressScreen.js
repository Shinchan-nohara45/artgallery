import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../constants/config';
import { ArrowLeft, Home, Briefcase, MapPin } from 'lucide-react-native';

const AddAddressScreen = () => {
    const navigation = useNavigation();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const [label, setLabel] = useState('Home');
    const [customLabel, setCustomLabel] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    const labels = [
        { name: 'Home', icon: <Home size={18} color={label === 'Home' ? '#FFF' : '#4B5563'} /> },
        { name: 'Work', icon: <Briefcase size={18} color={label === 'Work' ? '#FFF' : '#4B5563'} /> },
        { name: 'Other', icon: <MapPin size={18} color={label === 'Other' ? '#FFF' : '#4B5563'} /> },
    ];

    const handleSave = async () => {
        // Validation
        if (!address || !city || !postalCode || !country) {
            Alert.alert('Error', 'Please fill in all address fields');
            return;
        }

        if (label === 'Other' && !customLabel.trim()) {
            Alert.alert('Error', 'Please name your Other address (e.g., "My Studio")');
            return;
        }

        // Check for duplicates
        if (user.addresses) {
            const existingHome = user.addresses.find(a => a.label === 'Home');
            const existingWork = user.addresses.find(a => a.label === 'Work');

            if (label === 'Home' && existingHome) {
                Alert.alert('Error', 'You already have a Home address saved. Please edit or delete it first.');
                return;
            }
            if (label === 'Work' && existingWork) {
                Alert.alert('Error', 'You already have a Work address saved. Please edit or delete it first.');
                return;
            }
        }

        setLoading(true);
        try {
            const finalLabel = label === 'Other' ? customLabel : label;
            
            const newAddress = {
                label: finalLabel,
                address,
                city,
                postalCode,
                country,
                isDefault
            };

            const { data } = await axios.put(`${API_URL}/users/profile`, {
                newAddress
            });
            
            // Update local context so Checkout knows about the new address immediately
            updateUser(data);

            Alert.alert('Success', 'Address added successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error saving address:', error);
            Alert.alert('Error', 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, value, onChange, placeholder) => (
        <View className="mb-4">
            <Text className="text-sm font-bold text-artbloom-charcoal mb-1">{label}</Text>
            <TextInput
                className="bg-white border border-gray-200 rounded-lg p-3 font-sans"
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
            />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream">
            <View className="flex-row items-center p-4 bg-white shadow-sm z-10 w-full">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft size={24} color="#000000ff" />
                </TouchableOpacity>
                <Text className="text-xl font-bold font-playfair text-artbloom-charcoal">Add New Address</Text>
            </View>

            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Label Selection */}
                <Text className="text-lg font-bold text-artbloom-charcoal mb-3">Label as</Text>
                <View className="flex-row mb-4 space-x-3 gap-3">
                    {labels.map((l) => (
                        <TouchableOpacity 
                            key={l.name}
                            className={`flex-row items-center px-4 py-2 rounded-full border ${label === l.name ? 'bg-artbloom-peach border-artbloom-peach' : 'bg-white border-gray-200'}`}
                            onPress={() => setLabel(l.name)}
                        >
                            {l.icon}
                            <Text className={`ml-2 font-medium ${label === l.name ? 'text-white' : 'text-gray-600'}`}>{l.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Custom Label Input for 'Other' */}
                {label === 'Other' && (
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-artbloom-charcoal mb-1">Name this address</Text>
                        <TextInput
                            className="bg-white border border-gray-200 rounded-lg p-3 font-sans"
                            value={customLabel}
                            onChangeText={setCustomLabel} // e.g., "Asif's Home"
                            placeholder="e.g., Vacation Home, Asif's Uni"
                        />
                    </View>
                )}

                {/* Form
                {renderInput("Address", address, setAddress, "123 Main St")}
                {renderInput("City", city, setCity, "New York")}
                <View className="flex-row justify-between">
                        <View className="w-[48%]">
                        {renderInput("Postal Code", postalCode, setPostalCode, "10001")}
                        </View>
                        <View className="w-[48%]">
                        {renderInput("Country", country, setCountry, "USA")}
                        </View>
                </View> */}

                {/* Default Switch */}
                <View className="flex-row items-center justify-between mb-8 bg-white p-4 rounded-lg shadow-sm">
                    <Text className="font-medium text-artbloom-charcoal">Set as default address?</Text>
                    <Switch
                        trackColor={{ true: '#dc5d21ff', false: '#D1D5DB' }}
                        thumbColor={isDefault ? '#FFFFFF' : '#F3F4F6'}
                        onValueChange={setIsDefault}
                        value={isDefault}
                    />
                </View>

                <TouchableOpacity
                    className="bg-artbloom-peach py-4 rounded-xl items-center shadow-lg active:opacity-90"
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text className="text-white font-bold text-lg">{loading ? 'Saving...' : 'Save Address'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddAddressScreen;
