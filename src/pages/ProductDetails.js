// ✅ Final best-practice version with scroll-to-top and slide-in behavior + shipping info
import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Button,
  Alert,
  Animated,
  Pressable,
} from "react-native";
import axios from "axios";
import Context from "../context";
import SummaryApi from "../common/SummaryApi";
import addToCart from "../helper/addToCart";
import UserProductCart from "../components/UserProductCart";
import { useNavigation } from "@react-navigation/native";
import { Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";

const { width: screenWidth } = Dimensions.get("window");
const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

const ProductDetails = ({ route }) => {
  const { id } = route.params;
  const { fetchUserAddToCart } = useContext(Context);
  const navigation = useNavigation();

  const [data, setData] = useState({
    productName: "",
    brandName: "",
    category: "",
    subCategory: "",
    variants: [],
    description: "",
    price: 0,
    selling: 0,
  });
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState({
    title: "",
    detail: "",
  });

  const user = useSelector((state) => state?.userState?.user);

  const imageSliderRef = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios({
          method: SummaryApi.product_details.method,
          url: SummaryApi.product_details.url,
          headers: { "Content-Type": "application/json" },
          data: { productId: id },
        });
        if (res.data.success) {
          const result = res.data.data;
          setData(result);
          setSelectedVariantIndex(0);
          setSelectedSize(null);
          const images = result.variants.flatMap((v) => v.images || []);
          setAllImages(images);
          setSelectedImg(images[0] || null);

          // 🔁 Fetch recommendation based on category
          const reco = await axios({
            method: SummaryApi.category_wish_product.method,
            url: SummaryApi.category_wish_product.url,
            headers: { "Content-Type": "application/json" },
            data: { category: result.category },
          });
          if (reco.data.success) {
            setRecommendedProducts(reco.data.data || []);
          }
        }
      } catch (error) {
        console.error("Product fetch error", error);
      }
    };
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [id]);

  const selectedVariant = data.variants[selectedVariantIndex] || {};
  const variantSizes = selectedVariant.sizes || [];

  const getStockBySize = (size) => {
    const sizeObjWithStk = variantSizes.find((s) => s.size === size);
    return sizeObjWithStk ? sizeObjWithStk.stock : 0;
  };

  const discount =
    data.price && data.selling
      ? Math.floor(((data.price - data.selling) / data.price) * 100)
      : 0;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      Alert.alert("Please select a size.");
      return;
    }
    await addToCart({
      productId: data._id,
      size: selectedSize,
      color: selectedVariant.color,
      image: selectedImg,
    });
     if (user?._id){
      fetchUserAddToCart();
    }
  };

  const openCommitmentModal = (title, detail) => {
    setSelectedCommitment({ title, detail });
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={styles.container} ref={scrollRef} contentContainerStyle={{ paddingBottom: 60 }}>
      <View>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          snapToInterval={screenWidth}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          ref={imageSliderRef}
          onMomentumScrollEnd={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / screenWidth);
            const currentImage = allImages[index];
            setSelectedImg(currentImage);
            setCurrentIndex(index);

            const variantIndex = data.variants.findIndex((v) =>
              v.images.includes(currentImage)
            );
            if (variantIndex !== -1 && variantIndex !== selectedVariantIndex) {
              setSelectedVariantIndex(variantIndex);
              setSelectedSize(null);
            }
          }}
        >
          {allImages.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img }}
              style={styles.sliderImage}
            />
          ))}
        </Animated.ScrollView>
        <Text style={styles.imageCountText}>
          {currentIndex + 1}/{allImages.length}
        </Text>
      </View>

      <Text style={styles.variantCounter}>
        Variant {selectedVariantIndex + 1}/{data.variants.length}
      </Text>

      <View style={styles.priceContainer}>
        <Text style={styles.sellingPrice}>৳{data.selling}</Text>
        {discount > 0 && <Text style={styles.discount}>Save {discount}%</Text>}
        <Text style={styles.originalPrice}>৳{data.price}</Text>
      </View>

      <Text style={styles.productName}>{data.productName}</Text>

      {selectedVariant.color && (
        <Text style={styles.colorInfo}>Color: {selectedVariant.color}</Text>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thumbnailRow}
      >
        {data.variants.map((variant, idx) => {
          const thumbImage = variant.images?.[0];
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setSelectedVariantIndex(idx);
                setSelectedSize(null);
                const newImages = variant.images || [];
                const newImg = newImages[0];
                setSelectedImg(newImg);
                const imgIndex = allImages.findIndex((img) => img === newImg);
                if (imgIndex !== -1 && imageSliderRef.current) {
                  setTimeout(() => {
                    imageSliderRef.current.scrollTo({
                      x: screenWidth * imgIndex,
                      animated: true,
                    });
                  }, 100);
                }
              }}
              style={[
                styles.thumbnailBox,
                idx === selectedVariantIndex && styles.activeThumbnailBox,
              ]}
            >
              {thumbImage && (
                <Image
                  source={{ uri: thumbImage }}
                  style={styles.thumbnailImage}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sizeLabel}>Select Size</Text>
      <View style={styles.sizeOptions}>
        {ALL_SIZES.map((size) => {
          const stock = getStockBySize(size);
          const disabled = stock === 0;
          return (
            <TouchableOpacity
              key={size}
              onPress={() => !disabled && setSelectedSize(size)}
              disabled={disabled}
              style={[
                styles.sizeBox,
                selectedSize === size && styles.activeSizeBox,
                disabled && styles.disabledBox,
              ]}
            >
              <Text>{size}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.stockInfo}>
        {selectedSize
          ? getStockBySize(selectedSize) > 0
            ? `In Stock: ${getStockBySize(selectedSize)}`
            : "Out of Stock"
          : "Please select a size"}
      </Text>

      <View>
        <View style={styles.commitHeaderWrapper}>
          <LinearGradient
            colors={["#FFF39C", "#fffce5"]} // উপরে গাঢ়, নিচে হালকা
            style={styles.commitHeaderWrapper}
          >
            <Text style={styles.commitHeaderText}>EgTake Commitment</Text>
          </LinearGradient>
        </View>

        <View style={styles.policyCard}>
          {/* Shipping */}
          <TouchableOpacity
            style={styles.policyItem}
            onPress={() =>
              openCommitmentModal(
                "Free Shipping",
                "Free delivery in Narayanganj"
              )
            }
          >
            <View>
              <View style={styles.policyRowJustify}>
                <Text style={styles.policyTitle}>
                  🚚 Free Delivery over ৳1,500
                </Text>
                <Text style={styles.arrow}>›</Text>
              </View>
              <Text style={styles.policySubText}>
                Delivery by{" within 6 hours "}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Delivery Commitment */}
          <TouchableOpacity
            style={styles.policyItem}
            onPress={() =>
              openCommitmentModal(
                "Delivery Commitment",
                `✓ 150円 coupon code if delayed\n✓ Refund if items damaged\n✓ Refund if package lost\n✓ Refund if no delivery`
              )
            }
          >
            <View>
              <View style={styles.policyRowJustify}>
                <Text style={styles.policyTitle}>📦 Delivery Commitment</Text>
                <Text style={styles.arrow}>›</Text>
              </View>
              <View style={styles.policyRow}>
                <Text style={styles.policyCheck}>
                  <Text style={{ color: "green" }}>✓</Text> ৳150 coupon code if delayed
                </Text>
                <Text style={styles.policyCheck}>
                  <Text style={{ color: "green" }}>✓</Text> Refund if items damaged
                </Text>
              </View>
              <View style={styles.policyRow}>
                <Text style={styles.policyCheck}>
                  <Text style={{ color: "green" }}>✓</Text> Refund if wrong items delivery
                </Text>
                <Text style={styles.policyCheck}>
                  <Text style={{ color: "green" }}>✓</Text> Refund if no delivery
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Return Policy */}
          <TouchableOpacity
            style={styles.policyItem}
            onPress={() =>
              openCommitmentModal(
                "Return Policy",
                "You can return items within 15 days of receiving your order."
              )
            }
          >
            <View style={styles.policyRowJustify}>
              <Text style={styles.policyTitle}>
                🔁 Returns within 15 days
              </Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedCommitment.title}</Text>
            <Text style={styles.modalDetail}>{selectedCommitment.detail}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

     
  <Text style={styles.descLabel}>Product Details</Text>
   <TouchableOpacity onPress={() => openCommitmentModal("Product Details", data.description)}>
         <View style={styles.policyRowJustify}>
          <Text style={{paddingTop:10, color:"green"}}>Specification ›</Text>
   </View>
</TouchableOpacity>



      {recommendedProducts.length > 0 && (
        <View style={{ marginTop: 40 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
            Recommended Products
          </Text>
          <View style={styles.masonryContainer}>
            {recommendedProducts.map((item, index) => (
              <View key={index} style={styles.cardWrapper}>
                <UserProductCart
                  productData={item}
                  onPress={() =>
                    navigation.push("ProductDetails", { id: item._id })
                  }
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
        {/* ✅ Fixed Add to Cart Button */}
 <View style={styles.fixedAddToCartWrapper}>
    <Button
      title={
        !selectedSize
          ? "Select Size"
          : getStockBySize(selectedSize) > 0
          ? "Add to Cart"
          : "Out of Stock"
      }
      onPress={handleAddToCart}
      color="#ff5722"
      disabled={!selectedSize || getStockBySize(selectedSize) <= 0}
    />
  </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", marginBottom:0},
  sliderImage: {
    width: screenWidth,
    height: 500,
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  imageCountText: {
    position: "absolute",
    bottom: 15,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 14,
  },
  variantCounter: { textAlign: "center", marginVertical: 6, color: "#444" },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  sellingPrice: { fontSize: 22, fontWeight: "bold", color: "#222" },
  discount: {
    backgroundColor: "#e53935",
    color: "#fff",
    fontSize: 12,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  originalPrice: { textDecorationLine: "line-through", color: "#888" },
  productName: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  colorInfo: { fontSize: 14, marginTop: 4, color: "#555" },
  thumbnailRow: { flexDirection: "row", marginTop: 12 },
  thumbnailBox: {
    width: 50,
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 12,
    overflow: "hidden",
  },
  activeThumbnailBox: { borderColor: "#ff5722", borderWidth: 2 },
  thumbnailImage: { width: "100%", height: "100%", resizeMode: "cover" },
  sizeLabel: { fontSize: 16, fontWeight: "600", marginTop: 20 },
  sizeOptions: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  sizeBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
    marginBottom: 10,
  },
  activeSizeBox: { borderColor: "#000", borderWidth: 2 },
  disabledBox: { opacity: 0.4 },
  stockInfo: { fontWeight: "bold", fontSize: 14, marginTop: 8 },
  descLabel: { fontSize: 16, fontWeight: "600", marginTop: 20 },
  description: { fontSize: 14, marginTop: 8, color: "#555" },
  addToCartWrapper: { marginTop: 24, marginBottom: 40 },
  fixedAddToCartWrapper: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: 10,
  borderTopWidth: 1,
  borderTopColor: "#ccc",
  backgroundColor: "#F9F9F9",//"#ff2c55",
    // borderRadius: 8,
    alignItems: "center",
    // marginBottom: -12,
    zIndex: 999,
},
  masonryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 20,
  },
  cardWrapper: {
    width: "48%",
  },

  //delivery return style
  commitHeaderWrapper: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  commitHeaderText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  policyCard: {
    marginTop: -20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 2,
    gap: 0,
    paddingBottom:0
  },
  policyItem: {
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 12,
    marginBottom: 12,
  },
  policyTitle: {
    fontSize: 14,
    // fontWeight: "bold",
    color: "#3BAF4E",
  },
  policySubText: {
    color: "#444",
    fontSize: 12,
    marginTop: 4,
  },
  boldText: {
    fontWeight: "bold",
    color: "#000",
  },
  policyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  policyCheck: {
    color: "gray",
    fontSize: 10.7,
    flex: 1,
  },
  arrow: {
    fontSize: 20,
    color: "#888",
    marginLeft: 10,
  },

  policyRowJustify: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // modal style
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalDetail: { fontSize: 16, marginBottom: 20 },
  modalButton: {
    backgroundColor: "#ff5722",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: { fontWeight: "bold", color: "#fff", fontSize: 16 },
});

export default ProductDetails;
