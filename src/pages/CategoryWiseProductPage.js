import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import axios from "axios";
import SummaryApi from "../common/SummaryApi";
import UserProductCart from "../components/UserProductCart";

const screenWidth = Dimensions.get("window").width;

const CategoryWiseProductPage = ({ route }) => {
  const { categoryName } = route.params;
  const [wishProductList, setWishProductList] = useState([]);

  const fetchWishCategoryProduct = async () => {
    try {
      const res = await axios({
        method: SummaryApi.category_wish_product.method,
        url: SummaryApi.category_wish_product.url,
        data: { category: categoryName },
        headers: { "content-type": "application/json" },
      });

      if (res.data.success) {
        setWishProductList(res.data.data || []);
      }
    } catch (error) {
      console.log("❌ Error fetching category product:", error.message);
    }
  };

  useEffect(() => {
    fetchWishCategoryProduct();
  }, [categoryName]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Category: {categoryName}</Text>

      <View style={styles.grid}>
        {wishProductList.length === 0 ? (
          <Text style={styles.empty}>No products found</Text>
        ) : (
          wishProductList.map((product, idx) => (
            <View key={idx} style={styles.card}>
              <UserProductCart productData={product} />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#fff",
    backfaceVisibility:"#fff",
    padding: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: (screenWidth - 30) / 2,
    marginBottom: 10,
  },
  empty: {
    textAlign: "center",
    padding: 20,
    color: "#777",
  },
});

export default CategoryWiseProductPage;
