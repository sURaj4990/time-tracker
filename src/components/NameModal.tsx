import React, { ReactNode, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { PALETTE } from "../db/manageDomains";
import { useTheme } from "../theme/ThemeContext";
import { Palette } from "../theme/palettes";

type Props = {
  visible: boolean;
  title: string;
  initialName?: string;
  placeholder?: string;
  saveLabel?: string;
  showPalette?: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string) => Promise<void>;
  children?: ReactNode;
};

export default function NameModal({
  visible,
  title,
  initialName = "",
  placeholder = "Name",
  saveLabel = "Save",
  showPalette = false,
  onClose,
  onSubmit,
  children,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(PALETTE[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setColor(PALETTE[0]);
    }
  }, [visible, initialName]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Name required", "Give it a short name.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(trimmed, color);
      onClose();
    } catch (e) {
      Alert.alert(
        "Couldn't save",
        e instanceof Error ? e.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.center}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>

            {children}

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={placeholder}
              placeholderTextColor={colors.placeholder}
              style={styles.input}
              autoFocus
              maxLength={40}
            />

            {showPalette && (
              <View style={styles.palette}>
                {PALETTE.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    style={[
                      styles.swatch,
                      { backgroundColor: c },
                      color === c && styles.swatchSelected,
                    ]}
                  />
                ))}
              </View>
            )}

            <View style={styles.buttons}>
              <Pressable style={styles.cancel} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.save, saving && { opacity: 0.5 }]}
                disabled={saving}
                onPress={save}
              >
                <Text style={styles.saveText}>{saveLabel}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(c: Palette) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: c.overlay },
    center: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
    card: {
      width: "88%",
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 24,
    },
    title: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: c.text },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      marginTop: 4,
      color: c.text,
      backgroundColor: c.background,
    },
    palette: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
    swatch: { width: 32, height: 32, borderRadius: 16 },
    swatchSelected: { borderWidth: 3, borderColor: c.text },
    buttons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 20,
    },
    cancel: { paddingVertical: 10, paddingHorizontal: 16 },
    cancelText: { color: c.textMuted, fontSize: 16, fontWeight: "600" },
    save: {
      backgroundColor: c.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    saveText: { color: c.onPrimary, fontSize: 16, fontWeight: "600" },
  });
}
