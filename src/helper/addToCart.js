import axios from 'axios';
import SummaryApi from '../common/SummaryApi';
import { ToastAndroid, Platform, Alert } from 'react-native';

const showToast = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Notification', message);
  }
};

const addToCart = async ({ productId, size, color, image }) => {
  try {
    const response = await axios({
      method: SummaryApi.addToCartProduct.method,
      url: SummaryApi.addToCartProduct.url,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Send cookies for auth
      data: { productId, size, color, image },
    });

    const result = response.data;

    if (result.success) {
      showToast(result.message);
    } else if (result.error) {
      showToast(result.message);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    showToast('Something went wrong!');
  }
};

export default addToCart;