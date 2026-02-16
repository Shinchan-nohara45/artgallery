import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle, Home } from 'lucide-react-native';

const OrderSuccessScreen = () => {
    const navigation = useNavigation();

    const handleGoHome = () => {
        // Reset navigation stack to Home so back button doesn't go to checkout
        navigation.reset({
            index: 0,
            routes: [
                {
                    name: 'MainTabs',
                    params: { screen: 'HomeTab' },
                },
            ],
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
            <View className="items-center mb-8">
                <View className="bg-green-100 p-6 rounded-full mb-6">
                    <CheckCircle size={64} color="#10B981" />
                </View>
                <Text className="text-3xl font-playfair font-bold text-artbloom-charcoal mb-2 text-center">Woohoo!</Text>
                <Text className="text-lg text-gray-600 text-center mb-1">Your order has been placed.</Text>
                <Text className="text-base text-gray-500 text-center">Find it in "My Orders".</Text>
            </View>

            <TouchableOpacity
                className="bg-artbloom-peach w-full py-4 rounded-xl items-center shadow-lg active:opacity-90"
                onPress={handleGoHome}
            >
                <Text className="text-white font-bold text-lg">Back to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="mt-4 py-3"
                onPress={() => {
                     navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name: 'MainTabs',
                                params: { screen: 'ProfileTab' },
                            },
                        ],
                    });
                }}
            >
                <Text className="text-artbloom-peach font-medium">View My Orders</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default OrderSuccessScreen;
