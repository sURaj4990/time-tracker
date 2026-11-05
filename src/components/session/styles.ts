import { StyleSheet } from "react-native";
import { Palette } from "../../theme/palettes";

export function createSessionStyles(c: Palette) {
  return StyleSheet.create({
    clock: {
      fontSize: 56,
      fontWeight: "700",
      textAlign: "center",
      marginVertical: 16,
      color: c.text,
    },
    phase: { fontSize: 18, textAlign: "center", color: c.textMuted },
    meta: { textAlign: "center", color: c.textSubtle, marginBottom: 8 },
    hint: {
      textAlign: "center",
      color: c.textSubtle,
      fontSize: 13,
      marginTop: 12,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      justifyContent: "center",
      marginVertical: 16,
    },
    btn: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      minWidth: 120,
      alignItems: "center",
    },
    primary: { backgroundColor: c.primary },
    primaryText: { color: c.onPrimary, fontSize: 16, fontWeight: "600" },
    secondary: { backgroundColor: c.surfaceMuted },
    secondaryText: { color: c.text, fontSize: 16, fontWeight: "600" },
    label: { fontSize: 14, color: c.textMuted, marginTop: 16, marginBottom: 8 },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: c.text,
      backgroundColor: c.surface,
    },
    disabled: { opacity: 0.4 },
  });
}
