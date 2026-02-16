import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus } from 'lucide-react-native';
import axios from 'axios';
import { API_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const CartScreen = () => {
  const navigation = useNavigation();
  const { cartItems, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const total = getTotal();

  // import axios from 'axios'; // Imports moved to top
  // import { API_URL } from '../constants/config';
  // import { useAuth } from '../context/AuthContext';

  // const { user } = useAuth(); // Removed duplicate

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigation.navigate('Checkout');
  };

  const renderItem = ({ item }) => (
    <View className="flex-row bg-white p-3 rounded-lg mb-3 shadow-sm items-center">
      <Image 
        source={{ uri: item.imageUrl }} 
        className="w-20 h-20 rounded-md" 
        resizeMode="cover"
      />
      <View className="flex-1 ml-3">
        <Text className="font-playfair font-bold text-artbloom-charcoal text-base" numberOfLines={1}>{item.title}</Text>
        <Text className="text-xs text-gray-500 mb-2">by {item.artist?.name || 'Artist'}</Text>
        <Text className="font-bold text-artbloom-peach">${(item.price * item.quantity).toFixed(2)}</Text>
      </View>
      
      <View className="items-center mr-3">
        <View className="flex-row items-center bg-gray-100 rounded-lg p-1 mb-2">
            <TouchableOpacity onPress={() => updateQuantity(item._id, -1)} className="p-1">
                <Minus size={14} color="#2C2C2C" />
            </TouchableOpacity>
            <Text className="mx-2 font-medium">{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item._id, 1)} className="p-1">
                <Plus size={14} color="#2C2C2C" />
            </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => removeFromCart(item._id)}>
            <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-artbloom-cream p-4">
      <Text className="text-3xl font-playfair font-bold text-artbloom-charcoal mb-6">Shopping Cart</Text>
      
      {cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center">
             <Text className="text-artbloom-charcoal/50 text-lg">Your cart is empty</Text>
        </View>
      ) : (
        <>
            <FlatList
                data={cartItems}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
            
            <View className="absolute bottom-0 left-0 right-0 bg-white p-6 rounded-t-3xl shadow-lg">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500">Subtotal</Text>
                    <Text className="font-bold text-artbloom-charcoal">${total.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-500">Shipping</Text>
                    <Text className="font-bold text-artbloom-charcoal">$0.00</Text>
                </View>
                 <View className="border-t border-gray-100 my-2" />
                <View className="flex-row justify-between mb-6">
                    <Text className="text-xl font-bold text-artbloom-charcoal">Total</Text>
                    <Text className="text-xl font-bold text-artbloom-peach">${total.toFixed(2)}</Text>
                </View>
                
                <TouchableOpacity 
                    className="bg-artbloom-peach py-4 rounded-xl items-center active:opacity-90"
                    onPress={handleCheckout}
                >
                    <Text className="text-white font-bold text-lg">Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;
