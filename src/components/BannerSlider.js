import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, View, Dimensions, StyleSheet } from "react-native";
import axios from "axios";
import SummaryApi from "../common/SummaryApi";

const screenWidth = Dimensions.get("window").width;

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(SummaryApi.get_banner.url);

        if (res.data.success) {
          console.log("✅ API Success:", res.data);
          setBanners(res.data.data); // ✅ only array
        }
      } catch (err) {
        console.log("❌ API Error:", err); // full error object
        console.log("📛 Error Message:", err.message); // specific error message
        if (err.response) {
          console.log("🚫 Backend Response:", err.response.data);
          console.log("🔢 Status Code:", err.response.status);
        }
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (banners.length > 0) {
        const nextIndex = (currentIndex + 1) % banners.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }
    }, 4000); // auto-slide every 3 sec

    return () => clearInterval(interval);
  }, [currentIndex, banners]);

  const renderItem = ({ item }) => (
    <Image
      source={{ uri: item.imageUrl }} // ✅ corrected here
      style={styles.bannerImage}
    />
  );
  console.log("✅ Banners:", banners);

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bannerImage: {
    width: screenWidth,
    height: 180,
    resizeMode: "cover",
  },
});

export default BannerSlider;
