import React from "react";
import { ScrollView } from "react-native";
import SelectionPill from "@/components/SelectionPill";

export default function CategoryPills({
  categories,
  selectedCategory,
  onPress,
}) {
  return (
    <ScrollView
      horizontal
      style={{ marginBottom: 20 }}
      contentContainerStyle={{ paddingHorizontal: 24 }}
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => (
        <SelectionPill
          key={category}
          title={category}
          isSelected={selectedCategory === category}
          onPress={() => onPress(category)}
        />
      ))}
    </ScrollView>
  );
}
