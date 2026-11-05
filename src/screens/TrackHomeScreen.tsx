import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getDomains, getDayTotals, DomainRow } from "../db/queries";
import {
  addDomain,
  renameDomain,
  deleteDomain,
  hasEntriesUnder,
  assertUniqueName,
} from "../db/manageDomains";
import { toLocalDate } from "../lib/date";
import { fmtDuration } from "../lib/format";
import { TrackStackParamList } from "../navigation/types";
import { useAppSettings } from "../settings/AppSettings";
import { useTheme } from "../theme/ThemeContext";
import { Palette } from "../theme/palettes";
import NameModal from "../components/NameModal";
import AddTopicModal from "../components/AddTopicModal";

type Nav = NativeStackNavigationProp<TrackStackParamList, "TrackHome">;
type Sheet = "menu" | "domain" | "topic" | null;

export default function TrackHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { goals } = useAppSettings();

  const [roots, setRoots] = useState<DomainRow[]>([]);
  const [todaySeconds, setTodaySeconds] = useState<Record<number, number>>({});
  const [sheet, setSheet] = useState<Sheet>(null);
  const [renaming, setRenaming] = useState<DomainRow | null>(null);

  const load = useCallback(async () => {
    const [domains, totals] = await Promise.all([
      getDomains(),
      getDayTotals(toLocalDate(new Date())),
    ]);
    setRoots(
      domains
        .filter((d) => d.parent_id == null)
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    const map: Record<number, number> = {};
    for (const t of totals) map[t.rootId] = t.seconds;
    setTodaySeconds(map);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const chooseAdd = (kind: "topic" | "domain") => {
    if (kind === "topic" && roots.length === 0) {
      setSheet(null);
      Alert.alert(
        "No domains yet",
        "Create a domain first, then add topics under it.",
      );
      return;
    }
    setSheet(kind);
  };

  const confirmDelete = async (d: DomainRow) => {
    if (await hasEntriesUnder(d.id)) {
      Alert.alert(
        "Can't delete",
        `"${d.name}" has logged time, so it's kept to protect your history.`,
      );
      return;
    }
    Alert.alert("Delete domain", `Delete "${d.name}" and all its topics?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDomain(d.id);
          load();
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {roots.length === 0 ? (
          <Text style={styles.empty}>
            No domains yet. Tap + to get started.
          </Text>
        ) : (
          roots.map((d) => {
            const seconds = todaySeconds[d.id] ?? 0;
            const goalMin = goals[d.id] ?? 0;
            const pct = goalMin > 0 ? Math.min(1, seconds / (goalMin * 60)) : 0;
            return (
              <Pressable
                key={d.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("Session", {
                    domainId: d.id,
                    domainName: d.name,
                  })
                }
                onLongPress={() =>
                  Alert.alert(d.name, undefined, [
                    { text: "Rename", onPress: () => setRenaming(d) },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => confirmDelete(d),
                    },
                    { text: "Cancel", style: "cancel" },
                  ])
                }
                delayLongPress={400}
              >
                <View style={[styles.bar, { backgroundColor: d.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{d.name}</Text>
                  {goalMin > 0 ? (
                    <>
                      <Text style={styles.sub}>
                        {pct >= 1
                          ? "Goal reached"
                          : `${fmtDuration(seconds)} of ${fmtDuration(goalMin * 60)}`}
                      </Text>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.fill,
                            {
                              width: `${pct * 100}%`,
                              backgroundColor: d.color,
                            },
                          ]}
                        />
                      </View>
                    </>
                  ) : (
                    <Text style={styles.sub}>
                      {seconds > 0
                        ? `${fmtDuration(seconds)} today`
                        : "No time today"}
                    </Text>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => setSheet("menu")}
        accessibilityLabel="Add"
      >
        <View style={styles.plusH} />
        <View style={styles.plusV} />
      </Pressable>

      <Modal
        visible={sheet === "menu"}
        transparent
        animationType="fade"
        onRequestClose={() => setSheet(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSheet(null)}>
          <Pressable style={styles.menu} onPress={() => {}}>
            <Text style={styles.menuTitle}>What would you like to add?</Text>
            <Pressable
              style={styles.menuItem}
              onPress={() => chooseAdd("topic")}
            >
              <Text style={styles.menuItemTitle}>New topic</Text>
              <Text style={styles.menuItemSub}>
                A subtopic under an existing domain
              </Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => chooseAdd("domain")}
            >
              <Text style={styles.menuItemTitle}>New domain</Text>
              <Text style={styles.menuItemSub}>
                A top-level area like Learning or Fitness
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <NameModal
        visible={sheet === "domain"}
        title="New domain"
        placeholder="e.g. Side Projects"
        saveLabel="Create"
        showPalette
        onClose={() => setSheet(null)}
        onSubmit={async (name, color) => {
          await assertUniqueName(null, name);
          await addDomain(name, null, color);
          load();
        }}
      />

      <AddTopicModal
        visible={sheet === "topic"}
        domains={roots}
        onClose={() => setSheet(null)}
        onAdded={load}
      />

      <NameModal
        visible={renaming !== null}
        title="Rename domain"
        initialName={renaming?.name ?? ""}
        saveLabel="Rename"
        onClose={() => setRenaming(null)}
        onSubmit={async (name) => {
          if (!renaming) return;
          await assertUniqueName(null, name, renaming.id);
          await renameDomain(renaming.id, name);
          load();
        }}
      />
    </View>
  );
}

function createStyles(c: Palette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, paddingBottom: 100 },
    empty: { textAlign: "center", color: c.textSubtle, marginTop: 60 },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
    },
    bar: { width: 6, height: 40, borderRadius: 3, marginRight: 14 },
    name: { fontSize: 18, fontWeight: "600", color: c.text },
    sub: { fontSize: 14, color: c.textSubtle, marginTop: 2 },
    track: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.surfaceMuted,
      marginTop: 8,
      overflow: "hidden",
    },
    fill: { height: "100%", borderRadius: 3 },
    chevron: { fontSize: 26, color: c.textSubtle, marginLeft: 8 },

    fab: {
      position: "absolute",
      right: 24,
      bottom: 24,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: c.primary,
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    plusH: {
      position: "absolute",
      left: 18,
      top: 27.5,
      width: 22,
      height: 3,
      borderRadius: 2,
      backgroundColor: c.onPrimary,
    },
    plusV: {
      position: "absolute",
      left: 27.5,
      top: 18,
      width: 3,
      height: 22,
      borderRadius: 2,
      backgroundColor: c.onPrimary,
    },

    backdrop: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    menu: {
      width: "88%",
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 20,
    },
    menuTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
      color: c.text,
    },
    menuItem: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: c.surfaceMuted,
      marginBottom: 10,
    },
    menuItemTitle: { fontSize: 16, fontWeight: "600", color: c.text },
    menuItemSub: { fontSize: 13, color: c.textSubtle, marginTop: 2 },
  });
}
