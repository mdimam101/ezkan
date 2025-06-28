// ✅ React Native version of UserProfile page with professional avatar styling
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import SummaryApi from "../common/SummaryApi";
import { setUserDetails } from "../store/userSlice";
import Toast from "react-native-toast-message";

import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfilePage = () => {
  const user = useSelector((state) => state.userState.user);
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const fetchUserOrders = async () => {
    const response = await axios.get(SummaryApi.get_user_orders.url, {
      withCredentials: true,
    });
    if (response.data.success) {
      setOrders(response.data.data);
    }
  };

  const handleCancelOrder = async (orderId) => {
    Alert.alert("Confirm", "Cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          const res = await axios.delete(
            `${SummaryApi.cancel_user_order.url}/${orderId}`,
            {
              withCredentials: true,
            }
          );
          if (res.data.success) {
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
          } else {
            Toast.show({ type: "error", text1: "Cancel failed" });
          }
        },
      },
    ]);
  };

  const handleReturnOrder = async (orderId) => {
    Alert.alert("Confirm", "Return this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          const res = await axios.put(
            `${SummaryApi.return_user_order.url}/${orderId}`,
            {},
            {
              withCredentials: true,
            }
          );
          if (res.data.success) {
            setOrders((prev) =>
              prev.map((o) =>
                o._id === orderId ? { ...o, status: "Return" } : o
              )
            );
          } else {
            Toast.show({ type: "error", text1: "Return failed" });
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    const res = await axios({
      method: SummaryApi.logout_user.method,
      url: SummaryApi.logout_user.url,
      withCredentials: true,
    });

    if (res.data.success) {
      dispatch(setUserDetails(null));
      Toast.show({ type: "success", text1: res.data.message });
      navigation.navigate("Home");
    } else {
      Toast.show({ type: "error", text1: res.data.message });
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "?";


const StatusBar = ({ currentStatus }) => {
  const steps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <View style={styles.statusContainer}>
      <LottieView
        source={require('../../assets/animations/delivery.json')}
        autoPlay
        loop
        style={{ width: 80, height: 80, alignSelf: 'center' }}
      />
      <View style={styles.statusRow}>
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <View key={step} style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                isCompleted && { backgroundColor: '#4caf50' },
                isActive && { borderColor: '#1976d2', borderWidth: 2 }
              ]}>
                {isCompleted ? (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                ) : (
                  <Text style={{ fontSize: 10, color: '#999' }}>{index + 1}</Text>
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                isActive && { color: '#1976d2', fontWeight: 'bold' }
              ]}>{step}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
      </View>

      <TouchableOpacity
        style={styles.orderBtn}
        onPress={() => setShowOrders(!showOrders)}
      >
        <Text style={{ color: "#fff" }}>
          {showOrders ? "Hide Orders" : "Your Orders"}
        </Text>
      </TouchableOpacity>

      {showOrders && (
        <View style={styles.ordersSection}>
          {orders.length === 0 && <Text>No orders found.</Text>}
          {orders.map((order, idx) => {
            const orderDate = new Date(order.createdAt);
            const now = new Date();
            const diffInDays = Math.floor(
              (now - orderDate) / (1000 * 60 * 60 * 24)
            );

            return (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderSummary}>
                  <Text style={styles.orderTitle}>
                    Order #{idx + 1} <Text style={{ color: '#1976d2' }}>({order.status})</Text>
                  </Text>
                  <Text style={styles.orderInfo}>Order ID: <Text style={styles.infoValue}>{order._id}</Text></Text>
                  <Text style={styles.orderInfo}>Shipping: <Text style={styles.infoValue}>{order.shippingDetails.address}, {order.shippingDetails.district}</Text></Text>
                  <Text style={styles.orderInfo}>Phone: <Text style={styles.infoValue}>{order.shippingDetails.phone}</Text></Text>
                  <Text style={styles.orderInfo}>Total: <Text style={styles.infoValue}>৳{order.totalAmount}</Text></Text>
                  <Text style={styles.orderInfo}>Ordered At: <Text style={styles.infoValue}>{new Date(order.createdAt).toLocaleString()}</Text></Text>
                </View>

                {/* <StatusBar currentStatus={order.status} /> */}
                
                {order.items.map((item) => (
                  <View key={item._id} style={styles.itemCard}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.img} />
                    ) : (
                      <View style={styles.noImg}><Text>No Image</Text></View>
                    )}
                    <View style={styles.itemDetails}>
                      <Text style={styles.productName}>{item.productName}</Text>
                      <Text style={styles.itemText}>Color: {item.color}</Text>
                      <Text style={styles.itemText}>Size: {item.size}</Text>
                      <Text style={styles.itemText}>Qty: {item.quantity}</Text>
                    </View>
                  </View>
                ))}

                {order.status === "Pending" && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelOrder(order._id)}>
                    <Text style={{ color: "#fff" }}>Cancel Order</Text>
                  </TouchableOpacity>
                )}

                {(order.status === "Delivered" || order.status === "Shipped") && diffInDays <= 15 && (
                  <TouchableOpacity style={styles.returnBtn} onPress={() => handleReturnOrder(order._id)}>
                    <Text style={{ color: "#fff" }}>Return Order</Text>
                  </TouchableOpacity>
                )}

                {order.status === "Confirmed" && (
                  <TouchableOpacity
                    style={styles.returnBtn}
                    onPress={() => {
                      setSelectedOrder(order);
                      setShowTrackModal(true);
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Track Order</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={{ color: "#fff" }}>Logout</Text>
      </TouchableOpacity>

      <Modal
        visible={showTrackModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTrackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tracking Order</Text>
           {selectedOrder && (
  <StatusBar currentStatus={selectedOrder.status} />
)}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowTrackModal(false)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// keep StatusBar as it is from before

export default ProfilePage;


const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1976d2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  orderBtn: {
    backgroundColor: "#1976d2",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  ordersSection: {
    marginTop: 20,
  },
  // Add these to your styles:
orderSummary: {
  backgroundColor: '#fefefe',
  padding: 10,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.05)',
  marginBottom: 10,
},
orderTitle: {
  fontSize: 16,
  fontWeight: '700',
  marginBottom: 6,
  color: '#333',
},
orderInfo: {
  fontSize: 14,
  color: '#555',
  marginBottom: 2,
},
infoValue: {
  color: '#111',
  fontWeight: '500',
},
  orderCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    elevation: 1,
  },
  itemDetails: {
    marginLeft: 10,
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontWeight: "600",
    marginBottom: 2,
    color: "#333",
  },
  itemText: {
    color: "#666",
    fontSize: 13,
  },
  img: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  noImg: {
    width: 60,
    height: 60,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    marginLeft: 10,
    flex: 1,
  },
  cancelBtn: {
    backgroundColor: "#d32f2f",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },
  returnBtn: {
    backgroundColor: "#ffa000",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },
  logoutBtn: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 20,
  width: '90%',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 12,
},
closeBtn: {
  backgroundColor: '#1976d2',
  marginTop: 16,
  padding: 10,
  borderRadius: 6,
  alignItems: 'center',
},
statusContainer: {
  paddingVertical: 12,
},
statusRow: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  marginTop: 12,
},
stepItem: {
  alignItems: 'center',
  flex: 1,
},
stepCircle: {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: '#ccc',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 4,
},
stepLabel: {
  fontSize: 12,
  color: '#888',
},
});
