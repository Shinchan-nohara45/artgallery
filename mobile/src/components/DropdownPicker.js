import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Animated } from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';

const DropdownPicker = ({ options, selectedValue, onValueChange, placeholder }) => {
    const [visible, setVisible] = useState(false);
    const [listHeight, setListHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const scrollY = useRef(new Animated.Value(0)).current;

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

    // Calculate indicator height
    const indicatorHeight = listHeight && contentHeight && contentHeight > listHeight
        ? Math.max((listHeight / contentHeight) * listHeight, 20) // min height 20
        : 0;

    // Calculate indicator translate Y
    const indicatorTranslateY = scrollY.interpolate({
        inputRange: [0, Math.max(0, contentHeight - listHeight)],
        outputRange: [0, Math.max(0, listHeight - indicatorHeight)],
        extrapolate: 'clamp',
    });

    const isScrollable = contentHeight > listHeight;

    return (
        <View>
            <TouchableOpacity
                onPress={toggleDropdown}
                className="w-full bg-white border border-gray-200 rounded-lg p-4 flex-row justify-between items-center"
                activeOpacity={0.7}
            >
                <Text 
                    className={`font-sans text-base ${selectedValue ? 'text-artbloom-peach' : 'text-gray-400'}`}
                >
                    {selectedValue || placeholder}
                </Text>
                <ChevronDown size={20} color="#eb7d4aff" />
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
                         <View className="bg-artbloom-cream p-4 border-b border-gray-100 flex-row justify-between items-center z-10">
                            <Text className="font-playfair font-bold text-lg text-artbloom-charcoal">Select Category</Text>
                            <TouchableOpacity onPress={() => setVisible(false)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                <X size={24} color="#eb7d4aff" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={{ maxHeight: 300, flexDirection: 'row' }}>
                            <FlatList
                                data={options}
                                keyExtractor={(item) => item}
                                showsVerticalScrollIndicator={false}
                                onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
                                onContentSizeChange={(w, h) => setContentHeight(h)}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                    { useNativeDriver: false }
                                )}
                                scrollEventThrottle={16}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className={`p-4 border-b border-artbloom-peach flex-row justify-between items-center active:bg-gray-50 ${selectedValue === item ? 'bg-artbloom-cream/30' : ''}`}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text className={`font-sans text-base ${selectedValue === item ? 'text-artbloom-peach font-extrabold' : 'text-artbloom-peach font-medium'}`}>
                                            {item}
                                        </Text>
                                        {selectedValue === item && (
                                            <Check size={20} color="#eb7d4aff" />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                            {/* Custom Scrollbar */}
                            {isScrollable && (
                                <View style={styles.scrollbarContainer}>
                                    <Animated.View 
                                        style={[
                                            styles.scrollbarIndicator, 
                                            { 
                                                height: indicatorHeight, 
                                                transform: [{ translateY: indicatorTranslateY }] 
                                            }
                                        ]} 
                                    />
                                </View>
                            )}
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
    },
    scrollbarContainer: {
        width: 6,
        backgroundColor: '#f3f4f6', 
        borderRadius: 4,
        marginVertical: 4,
        marginRight: 4,
    },
    scrollbarIndicator: {
        width: 6,
        backgroundColor: '#eb7d4aff',
        borderRadius: 4,
    }
});

export default DropdownPicker;
