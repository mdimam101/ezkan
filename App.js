import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import axios from "axios";

import store from "./src/store/store";
import Context from "./src/context";
import CartProvider from "./src/context/CartContext";
import SummaryApi from "./src/common/SummaryApi";
import { setUserDetails } from "./src/store/userSlice";

// Pages
import HomePage from "./src/pages/HomePage";
import ProductDetails from "./src/pages/ProductDetails";
import CategoryPage from "./src/pages/CategoryPage";
import CategoryWiseProductPage from "./src/pages/CategoryWiseProductPage";
import SubCategoryWiseProduct from "./src/pages/SubCategoryWiseProduct";
import SearchResultScreen from "./src/pages/SearchResultScreen";
// import SignupPage from './src/pages/SignupPage';
import LoginPage from "./src/pages/LoginPage";
import ForgotPasswordPage from "./src/pages/ForgotPasswordPage";

// Components
import FooterNavBar from "./src/components/FooterNavBar";
import Toast from "react-native-toast-message";
import SignupPage from "./src/pages/Signup";
import ProfilePage from "./src/pages/ProfilePage";
import CartPage from "./src/pages/CartPage";
import CheckoutPage from "./src/pages/CheckoutPage";

const Stack = createNativeStackNavigator();

const AppWrapper = () => {
  const dispatch = useDispatch();
  const [cartCountProduct, setCartCountProduct] = useState(0);
  const [cartListData, setCartListData] = useState([]);
    const user = useSelector((state) => state?.userState?.user);

  const fetchUserDetails = async () => {
    try {
      const response = await axios({
        method: SummaryApi.current_user.method,
        url: SummaryApi.current_user.url,
        withCredentials: true,
      });

      const result = response.data;
      console.log("◆ ✅◆◆current_user◆◆◆◆", result);
      if (result.success) {
        console.log("current_user", result.data);

        dispatch(setUserDetails(result.data)); // redux e user set
        setCartListData(result.data); // for cart info
      }
    } catch (error) {
      console.log("◆ ✅◆◆current_user◆◆error◆◆");
    }
  };

  const fetchUserAddToCart = async () => {
    try {
      const response = await axios({
        method: SummaryApi.count_AddToCart_Product.method,
        url: SummaryApi.count_AddToCart_Product.url,
        withCredentials: true,
      });

      const result = response.data;
      setCartCountProduct(result?.data?.count || 0);
    } catch (err) {
       console.log("◆ ✅✅✅✅✅✅✅✅◆◆current_user◆◆error◆◆",);
      console.error("◆1◆Cart count error:", err);
    }
  };

  useEffect(() => {
    if (!user?._id) {
fetchUserDetails();
    } 
    if (user?._id){
      fetchUserAddToCart();
    }
    
    
  }, []);

  console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅");

  return (
    <Context.Provider
      value={{
        fetchUserDetails,
        cartCountProduct,
        fetchUserAddToCart,
        cartListData,
      }}
    >
      <NavigationContainer>
        <View style={styles.wrapper}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomePage} />
            <Stack.Screen name="ProductDetails" component={ProductDetails} />
            <Stack.Screen name="Category" component={CategoryPage} />
            <Stack.Screen
              name="CategoryWise"
              component={CategoryWiseProductPage}
            />
            <Stack.Screen
              name="SubCategoryWise"
              component={SubCategoryWiseProduct}
            />
            <Stack.Screen name="SearchResult" component={SearchResultScreen} />
            <Stack.Screen name="Signup" component={SignupPage} />
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordPage}
            />
            <Stack.Screen name="Profile" component={ProfilePage} />
            <Stack.Screen name="CartPage" component={CartPage} />
            <Stack.Screen name="CheckoutPage" component={CheckoutPage} />
          </Stack.Navigator>
          <FooterNavBar />
        </View>
        <Toast />
      </NavigationContainer>
    </Context.Provider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <CartProvider>
        <AppWrapper />
      </CartProvider>
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingBottom: 60, // FooterNavBar space
    backgroundColor: "#fff",
  },
});
