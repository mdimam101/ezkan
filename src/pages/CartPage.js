import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

import CartItem from "../components/CartItem";
import Context from "../context";
import SummaryApi from "../common/SummaryApi";
import UserProductCart from "../components/UserProductCart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";

const CartPage = () => {
  const navigation = useNavigation();
  // const { fetchUserAddToCart } = useContext(Context);

  const [cartItems, setCartItems] = useState([]);
  const [unselectedItems, setUnselectedItems] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);

  const user = useSelector((state) => state?.userState?.user);

  const fetchCartItems = async () => {
    try {
      const response = await axios({
        method: SummaryApi.getCartProduct.method,
        url: SummaryApi.getCartProduct.url,
        withCredentials: true,
      });
      if (response.data.success) {
        setCartItems(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch cart items:", err);
    }
  };

  // check latest product for quantity check
  const fetchLatestProducts = async () => {
    try {
      const response = await axios.get(SummaryApi.get_product.url);
      if (response.data.success) {
        setLatestProducts(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch latest products:", err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchCartItems();
    }

    fetchLatestProducts();
  }, []);

  const selectedItems = cartItems
    .map((item) => item._id)
    .filter((id) => !unselectedItems.includes(id));

  const totalAmount = cartItems
    .filter((item) => {
      const latest = latestProducts.find((p) => p._id === item.productId._id);
      if (!latest) return false;
      const variant = latest.variants.find(
        (v) => v.color.toLowerCase() === item.color.toLowerCase()
      );
      if (!variant) return false;
      const sizeObj = variant.sizes.find(
        (s) => s.size.toLowerCase() === item.size.toLowerCase()
      );
      if (!sizeObj || sizeObj.stock === 0) return false;
      return selectedItems.includes(item._id);
    })
    .reduce((acc, item) => {
      const price = item?.productId?.selling || item?.productId?.price || 0;
      return acc + price * item.Quantity;
    }, 0);

  const totalSaved = cartItems
    .filter((item) => {
      const latest = latestProducts.find((p) => p._id === item.productId._id);
      if (!latest) return false;
      const variant = latest.variants.find(
        (v) => v.color.toLowerCase() === item.color.toLowerCase()
      );
      const sizeObj = variant?.sizes.find(
        (s) => s.size.toLowerCase() === item.size.toLowerCase()
      );
      return sizeObj && sizeObj.stock > 0 && selectedItems.includes(item._id);
    })
    .reduce((acc, item) => {
      const original = item?.productId?.price || 0;
      const sell = item?.productId?.selling || 0;
      return acc + (original - sell) * item.Quantity;
    }, 0);

  const handleCheckout = () => {
    const selectedItemsDetails = cartItems.filter((item) => {
      const latestProduct = latestProducts.find(
        (p) => p._id === item.productId._id
      );
      if (!latestProduct) return false;
      const variant = latestProduct.variants.find(
        (v) => v.color.toLowerCase() === item.color.toLowerCase()
      );
      const sizeObj = variant?.sizes.find(
        (s) => s.size.toLowerCase() === item.size.toLowerCase()
      );
      if (!sizeObj || sizeObj.stock === 0) return false;
      return selectedItems.includes(item._id);
    });

    navigation.navigate("CheckoutPage", { selectedItemsDetails });
  };

  const toggleSelect = async (itemId) => {
    let updatedUnselected = [];

    if (unselectedItems.includes(itemId)) {
      updatedUnselected = unselectedItems.filter((id) => id !== itemId);
    } else {
      updatedUnselected = [...unselectedItems, itemId];
    }

    setUnselectedItems(updatedUnselected);
    await AsyncStorage.setItem(
      "unselected_cart_ids",
      JSON.stringify(updatedUnselected)
    );
  };

  const toggleSelectAll = () => {
    if (unselectedItems.length === 0) {
      const allIds = cartItems.map((item) => item._id);
      setUnselectedItems(allIds);
    } else {
      setUnselectedItems([]);
    }
  };

  useEffect(() => {
    const loadUnselectedFromStorage = async () => {
      const stored = await AsyncStorage.getItem("unselected_cart_ids");
      if (stored) {
        setUnselectedItems(JSON.parse(stored));
      }
    };

    loadUnselectedFromStorage();
     if (user?._id) {
      fetchCartItems();
    }
    fetchLatestProducts();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 Your Cart</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>
              Start shopping and fill it up!
            </Text>
            <View style={{ marginTop: 20 }}>
              <Text style={styles.heading}>🛍 Recommended</Text>
              <View style={styles.masonryContainer}>
                {latestProducts.slice(0, 8).map((item, index) => (
                  <View key={index} style={styles.cardWrapper}>
                    <UserProductCart productData={item} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          cartItems.map((item) => (
            <CartItem
              key={item._id}
              product={item}
              refreshCart={fetchCartItems}
              latestProducts={latestProducts}
              isSelected={!unselectedItems.includes(item._id)}
              toggleSelect={() => toggleSelect(item._id)}
            />
          ))
        )}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.heading}>🛍 Recommended</Text>
          <View style={styles.masonryContainer}>
            {latestProducts.slice(0, 20).map((item, index) => (
              <View key={index} style={styles.cardWrapper}>
                <UserProductCart productData={item} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.checkoutBar}>
          <TouchableOpacity
            onPress={toggleSelectAll}
            style={styles.selectAllRow}
          >
            <View
              style={[
                styles.checkbox,
                selectedItems.length !== 0 ? styles.checked : null,
              ]}
            >
              {selectedItems.length !== 0 && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={styles.checkText}>All</Text>
          </TouchableOpacity>

          <View style={styles.priceSummary}>
            <Text style={styles.totalText}>৳{totalAmount}</Text>
            <Text style={styles.saveText}>Saved: ৳{totalSaved}</Text>
          </View>

          {selectedItems.length > 0 && (
            <TouchableOpacity
              onPress={handleCheckout}
              style={styles.checkoutBtn}
            >
              <Text style={styles.checkoutText}>
                Checkout ({selectedItems.length})
              </Text>
              {/* <Text style={styles.checkoutNote}>⏳ Almost sold out!</Text> */}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default CartPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    backgroundColor: "#fff",
  },
  header: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginTop: 35,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  masonryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#777",
    marginBottom: 16,
    textAlign: "center",
  },

  checkoutBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    gap: 40,
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkIcon: {
    fontSize: 20,
    color: "#e53935",
    fontWeight: "bold",
  },
  checkText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  priceSummary: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  saveText: {
    fontSize: 14,
    color: "#e53935",
    fontWeight: "600",
  },
  checkoutBtn: {
    backgroundColor: "#ff2c55",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  //   checkoutNote: {
  //     fontSize: 12,
  //     color: '#fff',
  //     marginTop: 2,
  //   },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f44336",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checked: {
    backgroundColor: "#f44336",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 18,
  },
});
