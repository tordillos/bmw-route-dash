import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { searchPlaces } from "@/services/mapbox";
import { darkTheme } from "@/styles/theme";
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
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + darkTheme.space(2) },
      ]}
    >
      <View style={styles.inputRow}>
        <MaterialIcons
          name="search"
          size={20}
          color={darkTheme.colors.mutedForeground}
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search destination..."
          placeholderTextColor={darkTheme.colors.input}
          value={query}
          onChangeText={setQuery}
          onFocus={onFocus}
          returnKeyType="search"
        />
        {isSearching && (
          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <MaterialIcons
              name="close"
              size={20}
              color={darkTheme.colors.mutedForeground}
            />
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
                color={darkTheme.colors.primary}
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

const styles = StyleSheet.create((t) => ({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: t.zIndex[10],
    paddingHorizontal: t.space(3),
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.colors.card,
    borderRadius: t.radius.xl,
    paddingHorizontal: t.space(3),
    height: t.size(11),
  },
  searchIcon: {
    marginRight: t.space(2),
  },
  input: {
    flex: 1,
    color: t.colors.cardForeground,
    fontSize: t.fontSize.base,
  },
  cancelButton: {
    marginLeft: t.space(2),
    padding: t.space(1),
  },
  resultsList: {
    backgroundColor: t.colors.card,
    borderRadius: t.radius.xl,
    marginTop: t.space(1),
    maxHeight: t.size(62),
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: t.space(3),
    paddingHorizontal: t.space(3),
    borderBottomWidth: 0.5,
    borderBottomColor: t.colors.border,
  },
  resultIcon: {
    marginRight: t.space(2.5),
  },
  resultText: {
    color: t.colors.cardForeground,
    fontSize: t.fontSize.sm,
    flex: 1,
  },
}));
