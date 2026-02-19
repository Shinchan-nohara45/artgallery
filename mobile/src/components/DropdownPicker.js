import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';

const DropdownPicker = ({ options, selectedValue, onValueChange, placeholder }) => {
    const [visible, setVisible] = useState(false);

    const toggleDropdown = () => {
        setVisible(!visible);
    };

    const handleSelect = (item) => {
        onValueChange(item);
        setVisible(false);
    };
    
    // Close modal when tapping outside content
    const handleOutsidePress = () => {
        setVisible(false);
    }

    return (
        <View>
            <TouchableOpacity
                onPress={toggleDropdown}
                className="w-full bg-white border border-gray-200 rounded-lg p-4 flex-row justify-between items-center"
                activeOpacity={0.7}
            >
                <Text 
                    className={`font-sans text-base ${selectedValue ? 'text-artbloom-charcoal' : 'text-gray-400'}`}
                >
                    {selectedValue || placeholder}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.overlay} 
                    activeOpacity={1} 
                    onPress={handleOutsidePress}
                >
                    <View className="w-[85%] bg-white rounded-xl overflow-hidden shadow-2xl m-auto" onStartShouldSetResponder={() => true}>
                         <View className="bg-artbloom-cream p-4 border-b border-gray-100 flex-row justify-between items-center">
                            <Text className="font-playfair font-bold text-lg text-artbloom-charcoal">Select Category</Text>
                            <TouchableOpacity onPress={() => setVisible(false)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                <X size={24} color="#eb7d4a" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={{ maxHeight: 300 }}>
                            <FlatList
                                data={options}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className={`p-4 border-b border-gray-50 flex-row justify-between items-center active:bg-gray-50 ${selectedValue === item ? 'bg-artbloom-cream/30' : ''}`}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text className={`font-sans text-base ${selectedValue === item ? 'text-artbloom-peach font-extrabold' : 'text-artbloom-charcoal font-medium'}`}>
                                            {item}
                                        </Text>
                                        {selectedValue === item && (
                                            <Check size={20} color="#eb7d4a" />
                                        )}
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={true}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    }
});

export default DropdownPicker;
