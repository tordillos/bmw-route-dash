import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { searchPlaces } from "@/services/mapbox";
import type { Coordinate, GeocodingFeature } from "@/types/navigation";

interface SearchBarProps {
  proximity: Coordinate | null;
  onSelect: (feature: GeocodingFeature) => void;
  onFocus: () => void;
  onCancel: () => void;
  isSearching: boolean;
}

export default function SearchBar({
  proximity,
  onSelect,
  onFocus,
  onCancel,
  isSearching,
}: SearchBarProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingFeature[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const features = await searchPlaces(query, proximity ?? undefined);
        setResults(features);
      } catch {
        setResults([]);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, proximity]);

  const handleCancel = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.blur();
    onCancel();
  };

  const handleSelect = (feature: GeocodingFeature) => {
    setQuery(feature.place_name);
    setResults([]);
    inputRef.current?.blur();
    onSelect(feature);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.inputRow}>
        <MaterialIcons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search destination..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
          onFocus={onFocus}
          returnKeyType="search"
        />
        {isSearching && (
          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <MaterialIcons name="close" size={20} color="#999" />
          </Pressable>
        )}
      </View>

      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          style={styles.resultsList}
          renderItem={({ item }) => (
            <Pressable
              style={styles.resultItem}
              onPress={() => handleSelect(item)}
            >
              <MaterialIcons
                name="place"
                size={20}
                color="#1a73e8"
                style={styles.resultIcon}
              />
              <Text style={styles.resultText} numberOfLines={2}>
                {item.place_name}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  cancelButton: {
    marginLeft: 8,
    padding: 4,
  },
  resultsList: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 250,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  resultIcon: {
    marginRight: 10,
  },
  resultText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
});
