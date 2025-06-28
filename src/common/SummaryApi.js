const BASE_URL = "https://ecommerce-project-mbcd.vercel.app"//"http://192.168.3.12:8080"; // ✅ port 8080 now
;

const SummaryApi = {
  signUp: {
    url: `${BASE_URL}/api/signup`,
    method: "post",
  },
  signIn: {
    url: `${BASE_URL}/api/signin`,
    method: "post",
  },
  current_user: {
    url: `${BASE_URL}/api/user-details`,
    method: "get",
  },
  logout_user: {
    url: `${BASE_URL}/api/userLogout`,
    method: "get",
  },
  all_users: {
    url: `${BASE_URL}/api/all-users`,
    method: "get",
  },
  get_product: {
    url: `${BASE_URL}/api/get-product`,
    method: "get",
  },
  category_product: {
    url: `${BASE_URL}/api/get-categoryProduct`,
    method: "get",
  },
  category_wish_product: {
    url: `${BASE_URL}/api/category-wish-product`,
    method: "post",
  },
  product_details: {
    url: `${BASE_URL}/api/product-details`,
    method: "post",
  },
  addToCartProduct: {
    url: `${BASE_URL}/api/addtocart`,
    method: "post",
  },
  count_AddToCart_Product: {
    url: `${BASE_URL}/api/countAddToCartProduct`,
    method: "get",
  },
  getCartProduct: {
    url: `${BASE_URL}/api/get-cart-products`,
    method: "get"
  },
  increaseQuantity: {
    url: `${BASE_URL}/api/increase-quantity`,
    method: "post",
  },
  decreaseQuantityProduct: {
    url: `${BASE_URL}/api/decrease-quantity`,
    method: "post",
  },
  removeFromCart: {
    url: `${BASE_URL}/api/remove`, 
    method: 'DELETE',
  },
  searchProduct: {
    url: `${BASE_URL}/api/search`,
    method: "get",
  },
  searchSuggestion: {
    url: `${BASE_URL}/api/search-suggestions`,
    method: "get"
  },
  get_banner: {
    url: `${BASE_URL}/api/banner`,
   method: "get",
  },
  upload_banner: {
    url: `${BASE_URL}/api/upload-banner`,
   method: "post",
  },
  delete_banner: {
    url: `${BASE_URL}/api/delete-banner`,
   method: "DELETE",
  },
  orders: {
    url: `${BASE_URL}/api/orders`,
   method: "post",
  },
  get_all_orders: {
    url: `${BASE_URL}/api/all-orders`,
    method: "get",
  },
  get_user_orders: {
    url: `${BASE_URL}/api/user-all-ordrs`,
    method: "get",
  },
  cancel_user_order: {
    url: `${BASE_URL}/api/cancel`,
    method: "DELETE"
  },
  return_user_order: {
    url: `${BASE_URL}/api/return`, // PUT `/return/:orderId`
    method: "put",
  }
};

export default SummaryApi;
