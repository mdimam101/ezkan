import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import SummaryApi from "../common/SummaryApi";
import BannerSlider from "../components/BannerSlider";
import UserSlideProductCard from "../components/UserSlideProductCard";
import UserProductCart from "../components/UserProductCart";
import SearchBar from "../components/SearchBar";
import CategoryListBar from "../components/CategoryListBar";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { setAllProductList } from "../store/allProductSlice";

const screenWidth = Dimensions.get("window").width;

const HomePage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [columnLeft, setColumnLeft] = useState([]);
  const [columnRight, setColumnRight] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [slideAnim] = useState(new Animated.Value(0)); // slide animation value
  const [prevCategory, setPrevCategory] = useState(null); // keep track of last category

  const getProductFromStore = useSelector((state) => state.productState.productList);
  const dispatch = useDispatch();

  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(SummaryApi.get_product.url);
      if (res.data.success) {
        const products = res.data.data || [];
        // store all product
        dispatch(setAllProductList(products));
        setAllProducts(products);

        // 🧱 Split allProducts into two columns for masonry grid
        const left = [],
          right = [];
        products.forEach((item, index) => {
          (index % 2 === 0 ? left : right).push(item);
        });

        setColumnLeft(left);
        setColumnRight(right);
      }
    } catch (err) {
      console.log("Fetch Error:", err.message);
    }
  };

  useEffect(() => {
    // if have no product in store
    if (getProductFromStore.length === 0) {
      fetchAllProducts();
    } else {
      setAllProducts(getProductFromStore);
    }
  }, []);

  const trendingProducts = allProducts.filter((p) => p.trandingProduct);
  const productsBelow99 = allProducts.filter((p) => p.selling <= 99);

  const filteredProducts = selectedCategory
    ? selectedCategory === "_trending"
      ? trendingProducts
      : selectedCategory === "_below99"
      ? productsBelow99
      : allProducts.filter(
          (item) =>
            item.category?.toLowerCase() === selectedCategory.toLowerCase()
        )
    : allProducts;

  const renderTrending = () => {
    const displayList = [...trendingProducts, { isLast: true }];
    return (
      <FlatList
        data={displayList}
        renderItem={({ item }) => (
          <UserSlideProductCard
            productData={item}
            isLast={item.isLast}
            onViewMorePress={() => setSelectedCategory("_trending")}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    );
  };

  const renderShopUnder99 = () => {
    const displayList = [...productsBelow99, { isLast: true }];
    return (
      <FlatList
        data={displayList}
        renderItem={({ item }) => (
          <UserSlideProductCard
            productData={item}
            isLast={item.isLast}
            onViewMorePress={() => setSelectedCategory("_below99")}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    );
  };

  console.log("filteredProducts", filteredProducts);

  useEffect(() => {
    let isGoingBackToAll = !selectedCategory && prevCategory;
    let isGoingToCategory = selectedCategory && !prevCategory;

    // প্রথমবার app load এ animation না চালাতে
    if (prevCategory === null && selectedCategory === null) return;

    if (isGoingBackToAll) {
      slideAnim.setValue(-300); // 👉 from left
    } else if (isGoingToCategory || selectedCategory) {
      slideAnim.setValue(300); // 👉 from right
    }

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    setPrevCategory(selectedCategory);
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <SearchBar />

      {selectedCategory === "_trending" || selectedCategory === "_below99" ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingBottom: 12,
            paddingTop: 8,
            backgroundColor: "#f9f9f9",
            borderBottomWidth: 1,
            borderColor: "#e0e0e0",
          }}
        >
          <TouchableOpacity onPress={() => setSelectedCategory(null)}>
            <Text
              style={{
                fontSize: 16,
                color: "#007BFF",
                fontWeight: "600",
              }}
            >
              ← Back to All
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#333",
            }}
          >
            {selectedCategory === "_trending"
              ? "🔥 All Trending Products"
              : "💸 All 0~99 Products"}
          </Text>
        </View>
      ) : (
        <CategoryListBar onSelectCategory={setSelectedCategory} />
      )}

      {/* ✅ Controlled from here when selected category or in tranding slide view more*/}
      {selectedCategory ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              styles.masonryContainer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            {(selectedCategory ? filteredProducts : allProducts).map(
              (item, index) => (
                <View key={index} style={styles.cardWrapper}>
                  <UserProductCart productData={item} />
                </View>
              )
            )}
          </Animated.View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              styles.masonryContainer,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <BannerSlider />

            {/* tranding product slide */}
            <LinearGradient
              colors={["#F8FFB3", "#FDFFE2"]} // উপরে গাঢ়, নিচে হালকা
              style={styles.commitHeaderWrapper}
            >
              <Text style={styles.commitHeaderText}>🔥 Trending</Text>
            </LinearGradient>
            {renderTrending()}

            {/* 0~99 shop product slide */}
            <LinearGradient
              colors={["#F2E6E0", "#fffce5"]}
              style={styles.commitHeaderWrapper}
            >
              <Text style={styles.commitHeaderText}>💸 0~99 Shop</Text>
            </LinearGradient>
            {renderShopUnder99()}

            {/* All products list */}
            <LinearGradient
              colors={["#BEE4C8", "#FFF8F5"]}
              style={styles.commitHeaderWrapper}
            >
              <Text style={styles.commitHeaderText}>🛍 All Products</Text>
            </LinearGradient>
            <View style={styles.masonryContainer}>
              {allProducts.map((item, index) => (
                <View key={index} style={styles.cardWrapper}>
                  <UserProductCart productData={item} />
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 95,
    // backgroundColor: "#fff",
    backfaceVisibility: "#fff",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    paddingHorizontal: 12,
  },
  commitHeaderWrapper: {
    width: "100%",
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 2,
  },
  commitHeaderText: {
    fontWeight: "bold",
    fontSize: 16.7,
    color: "#222",
  },
  scrollContent: {
    // paddingBottom: 80,
    paddingHorizontal: 10,
    // marginTop:10,
    paddingTop: 35,
  },
  scrollContentForSlideProduct: {
    // paddingBottom: 80,
    paddingHorizontal: 10,
    // marginTop:10,
    paddingTop: 5,
  },
  masonryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  cardWrapper: {
    width: "49%",
    marginBottom: 7,
  },
});

export default HomePage;
