import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import axios from "axios";
import SummaryApi from "../common/SummaryApi";
import { useDispatch, useSelector } from "react-redux";
import { setCategoryList } from "../store/categorySlice";

const CategoryListBar = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const categoryList = useSelector((state) => state.categoryState.categoryList);
  const dispatch = useDispatch()

  const fetchCategories = async () => {
    try {
      const res = await axios.get(SummaryApi.category_product.url);
      if (res.data.success) {
        const categoryList = res.data.data || [];
        // setCategory in store
        dispatch(setCategoryList(res.data?.data));
        // 1st time
        setCategories([{ category: "All" }, ...categoryList]); // ✅ prepend All
        
      }
    } catch (err) {
      console.log("❌ Category fetch error:", err.message);
    }
  };

  useEffect(() => {
    if (categoryList.length === 0) {
      fetchCategories();
    }
     setCategories([{ category: "All" }, ...categoryList]);
  }, []);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryItem}
            onPress={() =>
              cat.category === "All"
                ? onSelectCategory(null)
                : onSelectCategory(cat.category)
            }
          >
            <Text style={styles.text}>{cat.category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 95,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "#fff",
    paddingVertical: 5,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  scrollContainer: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#f3f3f3",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    color: "#333",
  },
});

export default CategoryListBar;
