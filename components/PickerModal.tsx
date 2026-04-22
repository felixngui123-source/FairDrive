import { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import { colors, fonts, spacing, radius } from "@/constants/theme";

type PickerOption = {
  label: string;
  value: string;
};

type PickerModalProps = {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

export default function PickerModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: PickerModalProps) {
  const renderItem = useCallback(
    ({ item }: { item: PickerOption }) => {
      const isSelected = item.value === selectedValue;
      return (
        <Pressable
          style={[styles.option, isSelected && styles.optionSelected]}
          onPress={() => {
            onSelect(item.value);
            onClose();
          }}
        >
          <Text
            style={[styles.optionText, isSelected && styles.optionTextSelected]}
          >
            {item.label}
          </Text>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>
      );
    },
    [selectedValue, onSelect, onClose]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.closeButton}>Done</Text>
          </Pressable>
        </View>
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.text,
  },
  closeButton: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.accent,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  optionSelected: {
    backgroundColor: colors.accentLight,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  optionText: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    fontFamily: fonts.sansMedium,
    color: colors.accent,
  },
  checkmark: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    color: colors.accent,
  },
});
