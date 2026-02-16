import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, Plus, ChevronRight, Home, Briefcase } from 'lucide-react-native';
import axios from 'axios';
import { API_URL } from '../constants/config';

const CheckoutScreen = ({ route }) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { cartItems, getTotal, clearCart } = useCart();
    const { user, updateUser } = useAuth(); // Ensure we have updateUser to refresh if needed
    
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const total = getTotal();

    // Effect to set initial address or refresh when coming back
    useEffect(() => {
         if (isFocused) {
            // Check if we came back with a selected address
            if (route.params?.selectedAddress) {
                setSelectedAddress(route.params.selectedAddress);
                // Clear param so it doesn't stick forever if we just refresh
                navigation.setParams({ selectedAddress: null });
            } else if (user) {
                // Only load default if we didn't just pick one manually
                 // Optimization: only if selectedAddress is null? Or always revert to default on fresh focus?
                 // Let's keep it simple: if no manual selection yet, load default.
                 // But wait, isFocused triggers on back.
                 // If we had a selectedAddress, we should keep it unless user changed profile.
                 // But route params will handle the manual change.
                 // If no route param, we should retain current state OR load default if null.
                 if (!selectedAddress) {
                     loadAddress();
                 }
            }
        }
    }, [isFocused, user, route.params?.selectedAddress]);

    const loadAddress = () => {
        if (user.addresses && user.addresses.length > 0) {
            // Prefer default, otherwise first
            const defaultAddr = user.addresses.find(a => a.isDefault);
            setSelectedAddress(defaultAddr || user.addresses[0]);
        } else {
            setSelectedAddress(null);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
             Alert.alert(
                 'Address Required', 
                 'Please add a shipping address to proceed.',
                 [
                     { text: 'Cancel', style: 'cancel' },
                     { text: 'Add Address', onPress: () => navigation.navigate('AddAddress') }
                 ]
             );
             return;
        }

        setLoading(true);
        try {
            // Construct order object
            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.title,
                    qty: item.quantity,
                    imageUrl: item.imageUrl,
                    price: item.price,
                    artwork: item._id || item.id,
                })),
                shippingAddress: { 
                    address: selectedAddress.address, 
                    city: selectedAddress.city, 
                    postalCode: selectedAddress.postalCode, 
                    country: selectedAddress.country 
                },
                paymentMethod: 'PayPal', // Mock
                itemsPrice: total,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: total,
            };

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.post(`${API_URL}/orders`, orderData, config);
            
            // Success - Navigate to Success Screen
            clearCart();
            navigation.replace('OrderSuccess');

        } catch (error) {
             console.error('Order creation error:', error);
             Alert.alert('Error', 'Failed to place order. ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (label) => {
        switch(label) {
            case 'Home': return <Home size={20} color="#F2A684" />;
            case 'Work': return <Briefcase size={20} color="#3B82F6" />;
            default: return <MapPin size={20} color="#9CA3AF" />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-artbloom-cream">
            {/* Header */}
            <View className="flex-row items-center p-4 bg-white shadow-sm w-full">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft size={24} color="#2C2C2C" />
                </TouchableOpacity>
                <Text className="text-xl font-bold font-playfair text-artbloom-charcoal">Checkout</Text>
            </View>

            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
                
                {/* 1. Delivery Address Section */}
                <Text className="text-lg font-bold text-artbloom-charcoal mb-3">Delivery Address</Text>
                
                {selectedAddress ? (
                    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-2">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-row items-center mb-2">
                                <View className="bg-gray-50 p-2 rounded-full mr-3">
                                    {getIcon(selectedAddress.label)}
                                </View>
                                <Text className="font-bold text-artbloom-charcoal text-base capitalize">{selectedAddress.label}</Text>
                            </View>
                            {selectedAddress.isDefault && (
                                <View className="bg-green-100 px-2 py-0.5 rounded">
                                    <Text className="text-green-700 text-xs font-bold">Default</Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-gray-700 text-base mb-1">{selectedAddress.address}</Text>
                        <Text className="text-gray-500">{selectedAddress.city}, {selectedAddress.postalCode}, {selectedAddress.country}</Text>
                    </View>
                ) : (
                    <View className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-gray-300 items-center mb-2">
                        <Text className="text-gray-500 mb-2">No address selected</Text>
                    </View>
                )}

                {/* Change / Add Address Buttons */}
                <View className="flex-row gap-3 mb-6">
                     <TouchableOpacity 
                        className="flex-1 bg-white border border-gray-200 py-3 rounded-lg flex-row items-center justify-center"
                        onPress={() => navigation.navigate('Address', { selectMode: true })}
                     >
                        <Text className="font-medium text-artbloom-charcoal">Change Address</Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity 
                        className="flex-1 bg-white border border-artbloom-peach py-3 rounded-lg flex-row items-center justify-center"
                        onPress={() => navigation.navigate('AddAddress')}
                     >
                        <Plus size={16} color="#F2A684" />
                        <Text className="font-medium text-artbloom-peach ml-1">Add New</Text>
                     </TouchableOpacity>
                </View>


                {/* 2. Order Summary */}
                <Text className="text-lg font-bold text-artbloom-charcoal mb-3">Order Summary</Text>
                <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
                    {cartItems.map((item) => (
                        <View key={item._id} className="flex-row items-center mb-4 last:mb-0">
                             <Image 
                                source={{ uri: item.imageUrl }} 
                                className="w-12 h-12 rounded bg-gray-200 mr-3"
                            />
                            <View className="flex-1">
                                <Text className="font-medium text-artbloom-charcoal" numberOfLines={1}>{item.title}</Text>
                                <Text className="text-gray-500 text-xs">Qty: {item.quantity}</Text>
                            </View>
                            <Text className="font-bold text-artbloom-peach">${(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View className="border-t border-gray-100 my-3" />
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">Subtotal</Text>
                        <Text className="font-medium text-artbloom-charcoal">${total.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">Shipping</Text>
                        <Text className="font-medium text-artbloom-charcoal">Free</Text>
                    </View>
                    <View className="flex-row justify-between pt-2">
                        <Text className="text-lg font-bold text-artbloom-charcoal">Total</Text>
                        <Text className="text-lg font-bold text-artbloom-peach">${total.toFixed(2)}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Button */}
            <View className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-top rounded-t-3xl border-t border-gray-50">
                <TouchableOpacity 
                    className={`py-4 rounded-xl items-center shadow-lg active:opacity-90 ${loading ? 'bg-gray-400' : 'bg-artbloom-peach'}`}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    <Text className="text-white font-bold text-lg">{loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default CheckoutScreen;
