import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, Search, Library, Diary, AlbumDetail, PlaylistDetail, ArtistDetail, FavoritesList } from '../screens';
import { Home as HomeIcon, Search as SearchIcon, Library as LibraryIcon, Book as DiaryIcon } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import BloomPlayer from '../components/BloomPlayer';
import { PlayerContext } from '../context/PlayerContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// PORTAL: Discovery Flow
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={Home} />
    <Stack.Screen name="AlbumDetail" component={AlbumDetail} />
    <Stack.Screen name="PlaylistDetail" component={PlaylistDetail} />
    <Stack.Screen name="ArtistDetail" component={ArtistDetail} />
  </Stack.Navigator>
);

// PORTAL: Search Matrix
const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={Search} />
    <Stack.Screen name="AlbumDetail" component={AlbumDetail} />
    <Stack.Screen name="PlaylistDetail" component={PlaylistDetail} />
    <Stack.Screen name="ArtistDetail" component={ArtistDetail} />
  </Stack.Navigator>
);

// PORTAL: Sovereign Vault
const LibraryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LibraryMain" component={Library} />
    <Stack.Screen name="FavoritesList" component={FavoritesList} />
    <Stack.Screen name="AlbumDetail" component={AlbumDetail} />
    <Stack.Screen name="PlaylistDetail" component={PlaylistDetail} />
    <Stack.Screen name="ArtistDetail" component={ArtistDetail} />
  </Stack.Navigator>
);

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={30} tint="dark" style={styles.tabBarBlur}>
        <View style={styles.tabBarInner}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel || route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const Icon = options.tabBarIcon;

            return (
              <TouchableOpacity
                key={index}
                onPress={onPress}
                style={styles.tabItem}
              >
                <Icon color={isFocused ? '#F1E5AC' : 'rgba(241, 229, 172, 0.4)'} size={24} />
                <Text style={[
                  styles.tabLabel,
                  { color: isFocused ? '#F1E5AC' : 'rgba(241, 229, 172, 0.4)' }
                ]}>
                  {label === 'HomeStack' ? 'Discovery' : (label === 'SearchStack' ? 'Search' : label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const TabNavigator = () => {
  const { currentTrack } = useContext(PlayerContext);
  const isPlayingSomething = currentTrack && currentTrack.id !== 'empty';

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="HomeStack" 
          component={HomeStack} 
          options={{ 
            tabBarLabel: 'Discovery',
            tabBarIcon: (props) => <HomeIcon {...props} /> 
          }} 
        />
        <Tab.Screen 
          name="SearchStack" 
          component={SearchStack} 
          options={{ 
            tabBarLabel: 'Search',
            tabBarIcon: (props) => <SearchIcon {...props} /> 
          }} 
        />
        <Tab.Screen 
          name="LibraryStack" 
          component={LibraryStack} 
          options={{ 
            tabBarLabel: 'Your library',
            tabBarIcon: (props) => <LibraryIcon {...props} /> 
          }} 
        />
        <Tab.Screen 
          name="Diary" 
          component={Diary} 
          options={{ 
            tabBarLabel: 'Diary',
            tabBarIcon: (props) => <DiaryIcon {...props} /> 
          }} 
        />
      </Tab.Navigator>
      {isPlayingSomething && <BloomPlayer />}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tabBarBlur: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(241, 229, 172, 0.2)',
  },
  tabBarInner: {
    flexDirection: 'row',
    height: 70,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(10, 25, 47, 0.5)',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  }
});

export default TabNavigator;
