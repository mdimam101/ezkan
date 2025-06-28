import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import SummaryApi from "../common/SummaryApi";

const PLACEHOLDER_COLOR = "#999";

const SearchBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeQuery = route.params?.query;

  const [searchQuery, setSearchQuery] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (routeQuery) {
      setSearchQuery(decodeURIComponent(routeQuery));
      setIsUserTyping(false); // ✅ same as React logic
    }
  }, [routeQuery]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSuggestions([]);
    setIsUserTyping(false);
    Keyboard.dismiss();
    navigation.navigate("SearchResult", {
      query: encodeURIComponent(searchQuery.trim()),
    });
  };

  const handleSuggestionClick = (text) => {
    setSearchQuery(text);
    setSuggestions([]);
    setIsUserTyping(false);
    Keyboard.dismiss();
    navigation.navigate("SearchResult", {
      query: encodeURIComponent(text),
    });
  };

  useEffect(() => {
    if (!isUserTyping || !searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await axios.get(
          `${SummaryApi.searchSuggestion.url}?q=${searchQuery}`
        );
        if (res.data.success) {
          setSuggestions(res.data.data);
        }
      } catch (err) {
        console.error("Suggestion fetch error:", err.message);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isUserTyping]);

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          value={searchQuery}
          placeholder="Search..."
          placeholderTextColor={PLACEHOLDER_COLOR}
          onChangeText={(text) => {
            setSearchQuery(text);
            setIsUserTyping(true);
          }}
          onSubmitEditing={handleSearch}
          style={styles.input}
        />

        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearIcon}>
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
          <Ionicons name="search" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {suggestions.length > 0 && (
        <FlatList
          style={styles.suggestionList}
          data={suggestions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSuggestionClick(item.productName)}
              style={styles.suggestionItem}
            >
              <Ionicons name="search-outline" size={16} color="#333" />
              <Text style={styles.suggestionText}>{item.productName}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 99,
    padding: 6,
    // backgroundColor: "#fff",
    marginTop:-45
  },
  inputWrapper: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 40,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  clearIcon: {
    position: "absolute",
    right: 35,
    padding: 8,
  },
  searchIcon: {
    position: "absolute",
    right: 2,
    backgroundColor: "#333",
    padding: 7,
    borderRadius: 50,
  },
  suggestionList: {
    backgroundColor: "#fff",
    elevation: 3,
    borderRadius: 6,
    marginTop: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 8,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
    color: "#000",
  },
});

export default SearchBar;
