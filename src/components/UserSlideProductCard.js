import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const UserSlideProductCard = ({ productData, isLast = false, onViewMorePress }) => {
  const navigation = useNavigation();

  if (isLast) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onViewMorePress}
      >
        <View style={styles.moreBox}>
          <Text style={styles.moreIcon}>→</Text>
          <Text style={styles.moreText}>View More</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
       onPress={() =>
  navigation.navigate("ProductDetails", { id: productData._id })
}
      style={styles.card}
    >
      <Image
        source={{ uri: productData?.productImg?.[0] }}
        style={styles.image}
      />
      <Text style={styles.price}>৳{productData?.selling}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 100,
    marginRight: 6,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 6,
    resizeMode: "cover",
  },
  price: {
    fontSize: 16,
    color: "#ff5722", // orange/red
    fontWeight: "bold",
    marginTop: 6,
    textAlign: "center",
  },
  moreBox: {
    width: "100%",
    height: 100,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  moreIcon: {
    fontSize: 28,
    color: "#999",
  },
  moreText: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
});

export default UserSlideProductCard;
