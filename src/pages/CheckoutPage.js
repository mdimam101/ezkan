// ✅ Updated CheckoutPage with Custom Dropdown for District (Fully compatible with Expo)

import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import SummaryApi from "../common/SummaryApi";
import CheckoutItemCard from "../components/CheckoutItemCard";
import SuccessModal from "../components/SuccessModal";
import Context from "../context";
import CustomDropdown from "../components/CustomDropdown"; // ✅ Import custom dropdown
import deleteCartItemWhenOrderplace from "../helper/deleteCartItemWhenOrderplace";

const PLACEHOLDER_COLOR = "#999";

const CheckoutPage = () => {
  const navigation = useNavigation();
  const { fetchUserAddToCart } = useContext(Context);
  const route = useRoute();
  const selectedItems = route.params?.selectedItemsDetails || [];

    // শুধু _id গুলা নিয়ে নতুন array বানানো:
  let idArray = selectedItems.map((item) => item._id);

  console.log("se✅lectedItems99", idArray);


  const [errors, setErrors] = useState({}); // 🔴 error state

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    district: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const processingFee = 1;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getDeliveryCharge = (district) => {
    if (district === "Narayanganj") return 0;
    if (district === "Dhaka") return 40;
    if (district === "Outside") return 130;
    return 0;
  };

  const baseTotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const price = item?.productId?.selling || 0;
      return acc + price * item.Quantity;
    }, 0);
  }, [selectedItems]);

  const deliveryCharge = getDeliveryCharge(formData.district);
  const handlingCharge = useMemo(() => {
    if (formData.district === "Narayanganj" && baseTotal < 200) {
      return 19;
    }
    return 9;
  }, [formData.district, baseTotal]);

  const saveMoney = baseTotal > 1500 ? 150 : 0;
  const Subtotal =
    baseTotal +
    deliveryCharge +
    handlingCharge +
    processingFee -
    discount -
    saveMoney;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "SAVE50") {
      setDiscount(50);
      Toast.show({ type: "success", text1: "৳50 discount applied" });
    } else if (code === "SAVE10") {
      setDiscount(10);
      Toast.show({ type: "success", text1: "৳10 discount applied" });
    } else if (code === "SAVE10P") {
      const percent = Math.floor(baseTotal * 0.1);
      setDiscount(percent);
      Toast.show({
        type: "success",
        text1: `10% discount (৳${percent}) applied`,
      });
    } else {
      setDiscount(0);
      Toast.show({ type: "error", text1: "Invalid coupon code" });
    }
  };

  const handleSubmitOrder = async () => {
    const { name, phone, address, district } = formData;
    const newErrors = {};

    if (!name) newErrors.name = "Full name is required";
    if (!phone) newErrors.phone = "Phone number is required";
    if (!district) newErrors.district = "Please select your district";
    if (!address) newErrors.address = "Full address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear errors if all good

    const orderPayload = {
      items: selectedItems.map((item) => ({
        productId: item.productId._id,
        productName: item.productId.productName,
        quantity: item.Quantity,
        size: item.size,
        color: item.color,
        image: item.image,
      })),
      shippingDetails: { name, phone, address, district },
      deliveryType: "district-based",
      totalAmount: Subtotal,
      discount,
      couponCode,
      saveMoney,
    };

    try {
      const response = await axios.post(SummaryApi.orders.url, orderPayload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.data.success) {
        Toast.show({ type: "success", text1: "Order Placed!" });
        // fetchUserAddToCart();
        handleRemove(idArray)
        setModalVisible(true);
      } else {
        Toast.show({ type: "error", text1: "Order failed" });
      }
    } catch (err) {
      console.log("Order error:", err);
      Toast.show({ type: "error", text1: "Something went wrong" });
    }
  };
    const handleRemove = async (productId) => {
    console.log("productId-------", productId);

    const result = await deleteCartItemWhenOrderplace(productId);
    if (result?.success ) {
      fetchUserAddToCart();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerTitle}>
        <Text style={styles.title}>Checkout</Text>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <Text style = {{paddingTop:10, fontWeight:'bold'}}>Order Items({selectedItems.length})</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.productScroll}
        >
          {selectedItems.map((item, index) => (
            <CheckoutItemCard key={index} item={item} />
          ))}
        </ScrollView>

        <View style={styles.shippingSection}>
          <Text style={styles.sectionTitle}>🚚 Shipping Details</Text>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={formData.name}
            onChangeText={(val) => handleInputChange("name", val)}
            style={[styles.input, errors.name && styles.inputError]}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          <TextInput
            placeholder="Phone"
            placeholderTextColor={PLACEHOLDER_COLOR}
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(val) => handleInputChange("phone", val)}
            style={[styles.input, errors.phone && styles.inputError]}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          {/* ✅ Custom Dropdown */}
          <CustomDropdown
            selected={formData.district}
            onSelect={(val) => handleInputChange("district", val)}
            style={[styles.input, errors.district && styles.inputError]}
          />
          {errors.district && (
            <Text style={styles.errorText}>{errors.district}</Text>
          )}

          <TextInput
            placeholder="Full Address"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={formData.address}
            onChangeText={(val) => handleInputChange("address", val)}
            style={[styles.input, errors.address && styles.inputError]}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>

        <View style={styles.couponSection}>
          <TextInput
            placeholder="Enter coupon"
            placeholderTextColor={PLACEHOLDER_COLOR}
            value={couponCode}
            onChangeText={setCouponCode}
            style={styles.couponInput}
          />
          <TouchableOpacity
            style={styles.couponBtn}
            onPress={handleApplyCoupon}
          >
            <Text style={{ color: "#fff" }}>Apply</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.labelText}>Item(s) Total</Text>
            <Text style={styles.amountText}>৳{baseTotal}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.labelText}>Item(s) Discount</Text>
            <Text style={styles.amountText}>
              -৳
              {selectedItems.reduce((acc, item) => {
                const original = item.productId?.price || 0;
                const selling = item.productId?.selling || 0;
                return acc + (original - selling) * item.Quantity;
              }, 0)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.labelText}>Delivery Charge</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              {formData.district === "Narayanganj" ? (
                <>
                  {" "}
                  <Text style={styles.oldAmount}>৳150</Text>
                  <Text style={[styles.amountText, { color: "green" }]}>
                    FREE
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.oldAmount}>৳150</Text>
                  <Text style={styles.amountText}>
                    ৳{formData.district === "Dhaka" ? 60 : 150}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.labelText}>Handling Charge</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={styles.oldAmount}>৳25</Text>
              <Text style={styles.amountText}>৳{handlingCharge}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.labelText}>Processing Fee</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={styles.oldAmount}>৳5</Text>
              <Text style={styles.amountText}>৳{processingFee}</Text>
            </View>
          </View>

          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.labelText, { color: "green" }]}>Coupon</Text>
              <Text style={[styles.amountText, { color: "green" }]}>
                -৳{discount}
              </Text>
            </View>
          )}

          {saveMoney > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.labelText, { color: "green" }]}>
                ৳150 OFF
              </Text>
              <Text style={[styles.amountText, { color: "green" }]}>
                -৳{saveMoney}
              </Text>
            </View>
          )}

          <View style={[styles.summaryRow, { marginTop: 10 }]}>
            <Text
              style={[styles.labelText, { fontWeight: "bold", color: "red" }]}
            >
              Subtotal
            </Text>
            <Text style={styles.subtotalText}>৳{Subtotal}</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.orderBtn} onPress={handleSubmitOrder}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Place Order</Text>
      </TouchableOpacity>

      <SuccessModal
        visible={isModalVisible}
        onClose={() => {
          setModalVisible(false);
          navigation.navigate("Home");
        }}
      />
    </View>
  );
};

export default CheckoutPage;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: "#fff" },
  headerTitle: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#222", marginTop: 35 },
  productScroll: { flexDirection: "row", marginBottom: 16, marginTop:15 },
  formSection: { marginBottom: 20 },
  shippingSection: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
    paddingBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },

  inputError: {
    borderColor: "red",
  },
  couponSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
  },
  couponBtn: {
    backgroundColor: "#006400",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  summaryBox: {
    padding: 16,
    backgroundColor: "#fffdf5",
    borderRadius: 8,
    borderColor: "#eee",
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  labelText: {
    fontSize: 14,
    color: "#555",
  },

  amountText: {
    fontSize: 14,
    fontWeight: "bold",
  },

  oldAmount: {
    textDecorationLine: "line-through",
    color: "#999",
    fontSize: 13,
    marginRight: 4,
    opacity: 0.6,
  },

  subtotalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
  },
  totalText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
  },

  orderBtn: {
    backgroundColor: "#ff2c55",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: -12,
    bottom: 0,
    zIndex: 999,
  },
});
