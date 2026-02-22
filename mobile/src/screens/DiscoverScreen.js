import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../constants/config';
import { Search } from 'lucide-react-native';

const DiscoverScreen = () => {
  const navigation = useNavigation();
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchArtworks();
      fetchArtists();
    }, [search])
  );

  const fetchArtists = async () => {
      try {
          const query = search ? `?search=${search}` : '';
          const { data } = await axios.get(`${API_URL}/users/public${query}`);
          setArtists(data);
      } catch (error) {
          console.error('Error fetching artists:', error);
      }
  };

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      // Basic search implementation
      const query = search ? `?keyword=${search}` : '';
      const { data } = await axios.get(`${API_URL}/artworks${query}`);
      setArtworks(data.artworks);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      className="flex-1 m-2 bg-white rounded-xl shadow-sm overflow-hidden"
      onPress={() => navigation.navigate('ArtworkDetail', { id: item._id })}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="font-playfair font-bold text-artbloom-charcoal text-lg" numberOfLines={1}>{item.title}</Text>
        <Text className="text-artbloom-charcoal/70 text-sm mb-2" numberOfLines={1}>
            by {item.artist?.username ? `@${item.artist.username}` : (item.artist?.name || 'Unknown')}
        </Text>
        <View className="flex-row justify-between items-center">
            {['digital_art', 'photography', 'drawing', 'Water Painting'].includes(item.category) || parseFloat(item.price) === 0 ? (
                <Text className="font-bold text-gray-400 text-base italic">Free</Text>
            ) : (
                <Text className="font-bold text-artbloom-peach text-lg">${item.price}</Text>
            )}
            <View className="bg-artbloom-clay/20 px-2 py-1 rounded">
                <Text className="text-xs text-artbloom-charcoal">{item.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
            </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-artbloom-cream">
      <View className="p-4 bg-white shadow-sm z-10">
        <Text className="text-3xl font-playfair font-bold text-artbloom-charcoal mb-4">Discover</Text>
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3 mb-4">
            <Search color="#000000ff" size={20} />
            <TextInput 
                className="flex-1 ml-3 font-sans"
                placeholder="Search artworks..."
                value={search}
                onChangeText={setSearch}
            />
            {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                    <Text className="text-gray-400 font-bold px-2">✕</Text>
                </TouchableOpacity>
            )}
        </View>

        {/* Artists Section */}
        <View>
            <Text className="text-lg font-playfair font-bold text-artbloom-charcoal mb-2">
                {search ? 'Matching Artists' : 'Featured Artists'}
            </Text>
            <FlatList 
                data={artists}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        className="mr-4 items-center"
                        onPress={() => navigation.navigate('UserProfile', { userId: item._id, user: item })}
                    >
                        <Image 
                            source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
                            className="w-16 h-16 rounded-full border-2 border-artbloom-peach mb-1"
                        />
                        <Text className="text-xs font-medium text-artbloom-charcoal text-center w-20" numberOfLines={1}>
                            {item.username ? `@${item.username}` : item.name}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
             <ActivityIndicator size="large" color="#F2A684" />
        </View>
      ) : (
        <FlatList
          data={artworks}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-10">
                <Text className="text-artbloom-charcoal/50">No artworks found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default DiscoverScreen;
