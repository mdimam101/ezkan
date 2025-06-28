import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../store/userSlice'; // 🔁 adjust path if needed
import categoryReducer from '../store/categorySlice'; 
import productReducer from '../store/allProductSlice'

const store = configureStore({
  reducer: {
    userState: userReducer,
    categoryState: categoryReducer, // 🆕 category add
    productState:productReducer,
  },
});

export default store;