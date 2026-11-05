import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import NameModal from "./NameModal";
import { DomainRow } from "../db/queries";
import {
  addDomain,
  assertUniqueName,
  hasDirectEntries,
} from "../db/manageDomains";
import { useTheme } from "../theme/ThemeContext";
import { Palette } from "../theme/palettes";

type Props = {
  visible: boolean;
  domains: DomainRow[];
  fixedParentId?: number;
  onClose: () => void;
  onAdded: () => void;
};

export default function AddTopicModal({
  visible,
  domains,
  fixedParentId,
  onClose,
  onAdded,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [parentId, setParentId] = useState<number | null>(null);

  useEffect(() => {
    if (visible) setParentId(fixedParentId ?? domains[0]?.id ?? null);
  }, [visible, fixedParentId]);

  return (
    <NameModal
      visible={visible}
      title="New topic"
      placeholder="e.g. Deep Learning"
      saveLabel="Add topic"
      onClose={onClose}
      onSubmit={async (name) => {
        if (parentId == null) throw new Error("Choose a domain first.");
        const parent = domains.find((d) => d.id === parentId);
        if (!parent) throw new Error("That domain no longer exists.");
        if (await hasDirectEntries(parentId)) {
          throw new Error(
            `"${parent.name}" already has time logged directly to it, so topics can't be added under it.`,
          );
        }
        await assertUniqueName(parentId, name);
        await addDomain(name, parentId, parent.color);
        onAdded();
      }}
    >
      {fixedParentId == null && (
        <>
          <Text style={styles.label}>Under which domain?</Text>
          <View style={styles.chips}>
            {domains.map((d) => {
              const selected = d.id === parentId;
              return (
                <Pressable
                  key={d.id}
                  onPress={() => setParentId(d.id)}
                  style={[
                    styles.chip,
                    { borderColor: d.color },
                    selected && { backgroundColor: d.color },
                  ]}
                >
                  <Text
                    style={[styles.chipText, selected && { color: "#fff" }]}
                  >
                    {d.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </NameModal>
  );
}

function createStyles(c: Palette) {
  return StyleSheet.create({
    label: { fontSize: 14, color: c.textMuted, marginBottom: 8 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
    chip: {
      borderWidth: 1.5,
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    chipText: { fontSize: 14, fontWeight: "600", color: c.text },
  });
}
