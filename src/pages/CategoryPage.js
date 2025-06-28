import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Context from "../context";
import { useSelector } from "react-redux";
import SearchBar from "../components/SearchBar";

const screenWidth = Dimensions.get("window").width;

const CategoryPage = () => {
  const navigation = useNavigation();
  const { setCartCountProduct } = useContext(Context);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const getProductFromStore = useSelector(
    (state) => state.productState.productList
  );

  const categoryList = useSelector((state) => state.categoryState.categoryList);

  useEffect(() => {
    setAllProducts(getProductFromStore);
  }, [getProductFromStore]); // 🔁 Effect will rerun if products from Redux store change

  // 🔵 Filtering logic (same as web)
  let filteredCategories = [];

  if (selectedCategory === "All") {
    const subCategories = allProducts
      .map((item) => item.subCategory)
      .filter((item) => item !== "");
    const uniqueSub = [...new Set(subCategories)];
    filteredCategories = uniqueSub.map((subCat) =>
      allProducts.find((p) => p.subCategory === subCat)
    );
  } else {
    const filteredProducts = allProducts.filter(
      (item) => item.category === selectedCategory
    );
    const subCategories = filteredProducts
      .map((item) => item.subCategory)
      .filter((item) => item !== "");
    const uniqueSub = [...new Set(subCategories)];
    filteredCategories = uniqueSub.map((subCat) =>
      allProducts.find((p) => p.subCategory === subCat)
    );
  }

  return (
    <View style={styles.mainContainer}>
      <SearchBar />
      {/* <View style={styles.headerTitle}> */}
      <Text style={styles.title}>Chose Category</Text>
      {/* </View> */}
      <View style={styles.container}>
        {/* 🔵 Sidebar like category */}
        <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setSelectedCategory("All")}>
            <Text
              style={[
                styles.sidebarItem,
                selectedCategory === "All" && styles.activeItem,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categoryList.map((cat, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCategory(cat.category)}
            >
              <Text
                style={[
                  styles.sidebarItem,
                  selectedCategory === cat.category && styles.activeItem,
                ]}
              >
                {cat.category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 🔵 Grid for subcategories */}
        <ScrollView contentContainerStyle={styles.gridWrapper}>
          {filteredCategories.map((subcat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() =>
                navigation.navigate("SubCategoryWise", {
                  subCategory: subcat.subCategory,
                })
              }
            >
              {subcat?.productImg?.length > 0 ? (
                <Image
                  source={{ uri: subcat.productImg[0] }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>
                    {subcat?.subCategory?.[0] || "X"}
                  </Text>
                </View>
              )}
              <Text style={styles.label}>{subcat.subCategory}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    // padding: 10,
    // flex: 1,
    // marginTop: 10,
    flex: 1,
    paddingTop: 95,
    backgroundColor: "#fff",
  },
  container: {
    flexDirection: "row",
    marginBottom: 40,
  },
  headerTitle: {
    // height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 10,
    paddingTop: 0,
    marginTop: 0,
    position: "fixed",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginTop: 5,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 10,
    paddingTop: 0,
    // marginTop:0,
    position: "fixed",
  },
  sidebar: {
    width: 160,
    // paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  sidebarItem: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: "#333",
  },
  activeItem: {
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
  },
  gridWrapper: {
    paddingHorizontal: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: (screenWidth - 160) / 2, // approx 2 cols minus sidebar width
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  placeholder: {
    width: 60,
    height: 60,
    backgroundColor: "#ccc",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
  },
  label: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default CategoryPage;
