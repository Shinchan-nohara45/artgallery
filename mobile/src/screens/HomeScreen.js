import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../constants/config';

const { width } = Dimensions.get('window');

const CAROUSEL_IMAGES = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    title: "Art That Blooms",
    subtitle: "Discover unique artworks"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    title: "Abstract Harmony",
    subtitle: "Find your perfect piece"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    title: "Creative Process",
    subtitle: "Support independent artists"
  },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [featuredArtworks, setFeaturedArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchFeaturedArtworks();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeSlide < CAROUSEL_IMAGES.length - 1) {
        flatListRef.current?.scrollToIndex({ index: activeSlide + 1, animated: true });
        setActiveSlide(activeSlide + 1);
      } else {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
        setActiveSlide(0);
      }
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(interval);
  }, [activeSlide]);

  const fetchFeaturedArtworks = async () => {
    try {
      console.log('Fetching featured artworks from:', `${API_URL}/artworks`);
      const { data } = await axios.get(`${API_URL}/artworks`);
      
      if (data && data.artworks) {
        // Just taking the first 4 as featured. 
        // Yes, newly uploaded artworks will appear here if the backend returns them in the list.
        setFeaturedArtworks(data.artworks.slice(0, 4));
      } else {
        console.warn('No artworks data received:', data);
        setFeaturedArtworks([]);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCarouselItem = ({ item }) => (
    <View style={{ width, height: 384 }}>
        <Image 
            source={{ uri: item.src }} 
            className="w-full h-full"
            resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/30 flex items-center justify-center p-6 bg-opacity-40">
            <Text className="text-white text-4xl font-playfair font-bold text-center mb-2 shadow-sm">
                {item.title}
            </Text>
            <Text className="text-white text-lg text-center mb-6 font-sans shadow-sm">
                {item.subtitle}
            </Text>
            <TouchableOpacity 
                className="bg-artbloom-peach px-8 py-3 rounded-full shadow-lg"
                onPress={() => navigation.navigate('DiscoverTab')}
            >
                <Text className="text-white font-bold text-lg">Explore Collection</Text>
            </TouchableOpacity>
        </View>
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveSlide(viewableItems[0].index);
    }
  }).current;

  return (
    <SafeAreaView className="flex-1 bg-artbloom-cream">
      <ScrollView>
        {/* Hero Carousel */}
        <View className="h-96 relative">
          <FlatList
            ref={flatListRef}
            data={CAROUSEL_IMAGES}
            renderItem={renderCarouselItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            scrollEventThrottle={16}
            onScroll={(event) => {
                const slideSize = event.nativeEvent.layoutMeasurement.width;
                const index = event.nativeEvent.contentOffset.x / slideSize;
                const roundIndex = Math.round(index);
                if (activeSlide !== roundIndex) {
                    setActiveSlide(roundIndex);
                }
            }}
          />
          {/* Pagination Dots */}
          <View className="absolute bottom-4 flex-row justify-center w-full space-x-2 gap-2">
            {CAROUSEL_IMAGES.map((_, index) => (
                <View 
                    key={index} 
                    className={`h-2 w-2 rounded-full ${index === activeSlide ? 'bg-white w-4' : 'bg-white/50'}`}
                />
            ))}
          </View>
        </View>

        {/* Featured Section */}
        <View className="p-6">
          <Text className="text-2xl font-playfair font-bold text-artbloom-charcoal mb-4">Featured Artworks</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#F2A684" />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {featuredArtworks.length > 0 ? (
                  featuredArtworks.map((artwork) => (
                    <TouchableOpacity 
                      key={artwork._id}
                      className="w-[48%] mb-4 bg-white rounded-lg shadow-sm overflow-hidden"
                      onPress={() => navigation.navigate('ArtworkDetail', { id: artwork._id })}
                    >
                      <Image 
                        source={{ uri: artwork.imageUrl }} 
                        className="w-full h-40"
                        resizeMode="cover"
                      />
                      <View className="p-3">
                        <Text className="font-playfair font-bold text-artbloom-charcoal text-base" numberOfLines={1}>{artwork.title}</Text>
                        <Text className="text-artbloom-charcoal/70 text-xs mb-1" numberOfLines={1}>by {artwork.artist?.name || 'Artist'}</Text>
                        <Text className="font-bold text-artbloom-peach">${artwork.price}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
              ) : (
                  <Text className="text-center text-gray-500 w-full mt-4">No artworks found. Upload some to see them here!</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
