import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const OrdersScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/orders/myorders`);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const renderOrderItem = ({ item }) => (
        <View className="flex-row items-center mb-2">
            <Image 
                source={{ uri: item.imageUrl }} 
                className="w-12 h-12 rounded bg-gray-200 mr-3"
            />
            <View className="flex-1">
                <Text className="font-playfair text-artbloom-charcoal text-sm font-bold">{item.name}</Text>
                <Text className="text-xs text-gray-500">Qty: {item.qty} x ${item.price}</Text>
            </View>
        </View>
    );

    const renderOrder = ({ item }) => (
        <View className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100">
                <View>
                    <Text className="text-xs text-gray-400">Order Placed</Text>
                    <Text className="text-artbloom-charcoal font-medium">{formatDate(item.createdAt)}</Text>
                </View>
                <View className="items-end">
                    <Text className="text-xs text-gray-400">Total</Text>
                    <Text className="text-artbloom-peach font-bold text-lg">${item.totalPrice}</Text>
                </View>
            </View>

            {/* Address Display */}
            {item.shippingAddress && (
                <View className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <View className="flex-row items-center mb-1">
                        <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shipping To</Text>
                    </View>
                    <Text className="text-sm text-gray-700">{item.shippingAddress.address}, {item.shippingAddress.city}, {item.shippingAddress.postalCode}, {item.shippingAddress.country}</Text>
                </View>
            )}

            <View>
                {item.orderItems.map((orderItem, index) => (
                    <React.Fragment key={index}>
                        {renderOrderItem({ item: orderItem })}
                    </React.Fragment>
                ))}
            </View>
            
            <View className="mt-2 pt-2 border-t border-gray-50 flex-row justify-between">
                 <Text className="text-xs text-gray-400">Status</Text>
                 <Text className={`text-xs font-bold ${item.isDelivered ? 'text-green-500' : 'text-blue-500'}`}>
                    {item.isDelivered ? 'Delivered' : 'Processing'}
                 </Text>
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
                    <Text className="text-lg text-artbloom-charcoal">← Back</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-playfair font-bold text-artbloom-charcoal">My Orders</Text>
            </View>

            {orders.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500 text-lg">No orders found.</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrder}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

export default OrdersScreen;
