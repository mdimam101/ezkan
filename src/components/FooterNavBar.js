import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import Context from '../context';

const FooterNavBar = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state?.userState?.user);
  const { cartCountProduct } = useContext(Context);

  const redirectURL = user?._id ? 'Profile' : 'Login';

  console.log("✅ redirectURL", user?._id);
  

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <FontAwesome name="home" size={26} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Category')}>
        <MaterialCommunityIcons name="shape-outline" size={26} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('CartPage')} style={styles.cartWrapper}>
        <Ionicons name="cart-outline" size={26} color="#333" />
        {cartCountProduct > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCountProduct}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() =>  navigation.navigate(redirectURL)}>
        <Ionicons name="person-circle-outline" size={26} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fff',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    position: 'absolute',
    paddingBottom:10,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  cartWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: '#e91e63',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default FooterNavBar;
