import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const UserProductCart = ({ productData }) => {
  const navigation = useNavigation();
  const demoNews = ["Free Delivery", "Premium", "New Arrival", "Hot Offer"];
  const totalItem = demoNews.length;

  const [visibleIndex, setVisibleIndex] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (visibleIndex + 1) % totalItem;
      setVisibleIndex(nextIndex);
      Animated.timing(animatedValue, {
        toValue: -nextIndex * 20,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 3000);

    return () => clearInterval(interval);
  }, [visibleIndex]);

    const mainImage = productData?.productImg?.[0];

    console.log("mainImage....> ", mainImage );
    

  return (
    <TouchableOpacity
      style={styles.card}
     onPress={() =>
  navigation.navigate("ProductDetails", { id: productData._id })
}
    >
      <Image source={{ uri: mainImage }} style={styles.image} />

      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.name}>
          {productData?.productName}
        </Text>
        <Text style={styles.price}>
          <Text style={styles.tkIcon}>৳</Text>
          {productData?.selling}
        </Text>
      </View>

      {/* 📰 News Box */}
      <View style={styles.newsBox}>
        <Animated.View
          style={[
            styles.newsContainer,
            { transform: [{ translateY: animatedValue }] },
          ]}
        >
          {demoNews.map((news, index) => (
            <View key={index} style={styles.newsSlide}>
              <Text style={styles.newsText}>{news}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    // backgroundColor: "#f7f3f3",
    backgroundColor:"#fff",
    borderRadius: 8,
    // margin: 6,
    padding: 0,
    elevation: 2,
  },
 image: {
  width: "100%",
  height: undefined,
  aspectRatio: 0.9, // try 0.8 ~ 1.2 for variation
  borderRadius: 6,
  backgroundColor: "#f5f5f5",
  resizeMode: "cover",
},
  info: {
    marginTop: 8,
    paddingLeft:5
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
     marginBottom: 4, // add this for spacing
    // height: 38,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e91e63",
  },
  tkIcon: {
    fontSize: 16,
    fontWeight: "normal",
    marginRight: 2,
  },

  // 📰 News Box Styles
  newsBox: {
    height: 20,
    overflow: "hidden",
    marginTop: 6,
    paddingLeft:5
  },
  newsContainer: {
    flexDirection: "column",
  },
  newsSlide: {
    height: 20,
    justifyContent: "flex-start",
  },
  newsText: {
    fontSize: 12,
    color: "#333",
  },
});

export default UserProductCart;
