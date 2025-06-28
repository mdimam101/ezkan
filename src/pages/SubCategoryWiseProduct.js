import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import SummaryApi from '../common/SummaryApi';
import UserProductCart from '../components/UserProductCart';
import CategoryListBar from '../components/CategoryListBar'; // same as homepage top bar
import SearchBar from '../components/SearchBar';

const { width: screenWidth } = Dimensions.get('window');

const SubCategoryWiseProduct = ({ route }) => {
  const { subCategory } = route.params; // ✅ React Native equivalent of useParams()
  const [wishProductList, setWishProductList] = useState([]);

  const fetchWishCategoryProduct = async () => {
    try {
      const response = await axios({
        url: SummaryApi.category_wish_product.url,
        method: SummaryApi.category_wish_product.method,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          subCategory: subCategory,
        },
      });

      if (response.data.success) {
        setWishProductList(response.data.data || []);
      }
    } catch (error) {
      console.log('Error fetching sub category product:', error.message);
    }
  };

  useEffect(() => {
    fetchWishCategoryProduct();
  }, [subCategory]);

  return (
    <View style={styles.container}>
      <SearchBar />
      {/* 🔹 Top fixed category bar */}
      {/* <View style={styles.fixedCategoryBar}> */}
        <CategoryListBar />
      {/* </View> */}

      {/* 🔹 Product grid section */}
     <ScrollView contentContainerStyle={styles.gridContainer}>
  {wishProductList.length > 0 ? (
    <View style={styles.masonryContainer}>
      {wishProductList.map((item, index) => (
        <View key={index} style={styles.cardWrapper}>
          <UserProductCart productData={item} />
        </View>
      ))}
    </View>
  ) : (
    <Text style={styles.noProductText}>
      No products found in this category
    </Text>
  )}
</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
        backfaceVisibility:"#fff",
    paddingTop: 90,
    
  },
  // fixedCategoryBar: {
  //   position: 'absolute',
  //   top: 0,
  //   zIndex: 1000,
  //   width: '100%',
  //   backgroundColor: '#fff',
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#eee',
  //   paddingVertical: 8,
  // },
  gridContainer: {
    paddingTop: 40,
    paddingHorizontal: 10,
    // paddingBottom: 80,
  },
  masonryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '49%', // two columns with gap
    marginBottom: 7,
  },
  noProductText: {
    textAlign: 'center',
    padding: 16,
    fontSize: 16,
    color: '#555',
  },
});


export default SubCategoryWiseProduct;
