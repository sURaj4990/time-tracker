import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { TrackStackParamList } from "../navigation/types";
import { getDomains, DomainRow } from "../db/queries";
import {
  renameDomain,
  deleteDomain,
  hasEntriesUnder,
  assertUniqueName,
} from "../db/manageDomains";
import { usePomodoro } from "../hooks/usePomodoro";
import { useStopwatch } from "../hooks/useStopwatch";
import NameModal from "../components/NameModal";
import AddTopicModal from "../components/AddTopicModal";
import TimerPanel from "../components/session/TimerPanel";
import PomodoroPanel from "../components/session/PomodoroPanel";
import ManualPanel from "../components/session/ManualPanel";
import { topicLabel } from "../lib/format";
import { useAppSettings } from "../settings/AppSettings";
import { useTheme } from "../theme/ThemeContext";
import { Palette } from "../theme/palettes";

type Mode = "timer" | "pomodoro" | "manual";

const MODES: { key: Mode; label: string }[] = [
  { key: "timer", label: "Timer" },
  { key: "pomodoro", label: "Pomodoro" },
  { key: "manual", label: "Manual" },
];

type Nav = NativeStackNavigationProp<TrackStackParamList, "Session">;

export default function SessionScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<TrackStackParamList, "Session">>();
  const { domainId } = params;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { pomodoro, setPomodoro } = useAppSettings();

  const [domain, setDomain] = useState<DomainRow | null>(null);
  const [subtopics, setSubtopics] = useState<DomainRow[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("timer");
  const [timerNote, setTimerNote] = useState("");
  const [pomoNote, setPomoNote] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addingTopic, setAddingTopic] = useState(false);
  const [renaming, setRenaming] = useState<DomainRow | null>(null);

  const load = useCallback(async () => {
    const all = await getDomains();
    setDomain(all.find((d) => d.id === domainId) ?? null);
    setSubtopics(
      all
        .filter((d) => d.parent_id === domainId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
  }, [domainId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Logs to the selected subtopic. With none selected, falls back to the first one,
  // or to the domain itself when it has no subtopics.
  const activeSub =
    subtopics.find((s) => s.id === selectedId) ?? subtopics[0] ?? null;
  const targetId = activeSub?.id ?? domainId;
  const label = domain
    ? activeSub
      ? topicLabel({ name: activeSub.name, parentName: domain.name })
      : domain.name
    : params.domainName;

  const timer = useStopwatch(targetId);
  const pomo = usePomodoro(targetId, pomodoro, pomoNote);
  const busy = timer.isActive || pomo.status !== "idle";

  const stopTimer = async () => {
    const res = await timer.stop(timerNote);
    setTimerNote("");
    if (!res.saved && res.seconds > 0) {
      Alert.alert("Not saved", "Sessions under one minute are not logged.");
    }
  };

  const stopAll = async () => {
    if (timer.isActive) await timer.stop(timerNote);
    if (pomo.status !== "idle") pomo.stop();
  };

  // Saves a running session instead of losing it when the user goes back.
  useEffect(() => {
    return navigation.addListener("beforeRemove", (e) => {
      if (!busy) return;
      e.preventDefault();
      Alert.alert("Session in progress", "Save what you have and leave?", [
        { text: "Keep going", style: "cancel" },
        {
          text: "Save & leave",
          onPress: async () => {
            await stopAll();
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });
  }, [navigation, busy, timerNote, pomoNote]);

  // Closes the sheet first, then runs the action, so two modals never overlap.
  const afterSheet = (fn: () => void) => {
    setSheetOpen(false);
    setTimeout(fn, 300);
  };

  const confirmDeleteTopic = async (t: DomainRow) => {
    if (await hasEntriesUnder(t.id)) {
      Alert.alert(
        "Can't delete",
        `"${t.name}" has logged time, so it's kept to protect your history.`,
      );
      return;
    }
    Alert.alert("Delete topic", `Delete "${t.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDomain(t.id);
          if (selectedId === t.id) setSelectedId(null);
          load();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable
        style={[styles.topicBox, busy && styles.disabled]}
        disabled={busy}
        onPress={() => setSheetOpen(true)}
      >
        <Text style={styles.topicHint}>Logging to</Text>
        <Text style={styles.topicName}>{label} ▾</Text>
      </Pressable>

      <View style={styles.segment}>
        {MODES.map((m) => {
          const active = mode === m.key;
          return (
            <Pressable
              key={m.key}
              disabled={busy}
              onPress={() => setMode(m.key)}
              style={[styles.segBtn, active && styles.segActive]}
            >
              <Text style={[styles.segText, active && styles.segTextActive]}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {mode === "timer" && (
        <TimerPanel
          timer={timer}
          note={timerNote}
          onNoteChange={setTimerNote}
          onStop={stopTimer}
        />
      )}
      {mode === "pomodoro" && (
        <PomodoroPanel
          pomo={pomo}
          durations={pomodoro}
          onChangeDurations={setPomodoro}
          note={pomoNote}
          onNoteChange={setPomoNote}
        />
      )}
      {mode === "manual" && <ManualPanel topicId={targetId} label={label} />}

      <Modal
        visible={sheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Topics in {domain?.name}</Text>

            <ScrollView style={{ maxHeight: 340 }}>
              {subtopics.length === 0 && (
                <Text style={styles.sheetEmpty}>
                  No topics yet. Add one below, or log straight to{" "}
                  {domain?.name}.
                </Text>
              )}

              {subtopics.map((t) => {
                const selected = t.id === targetId;
                return (
                  <View
                    key={t.id}
                    style={[
                      styles.topicRow,
                      selected && { borderColor: t.color, borderWidth: 2 },
                    ]}
                  >
                    <Pressable
                      style={styles.topicMain}
                      onPress={() => {
                        setSelectedId(t.id);
                        setSheetOpen(false);
                      }}
                    >
                      <View
                        style={[styles.dot, { backgroundColor: t.color }]}
                      />
                      <Text style={styles.topicName2}>{t.name}</Text>
                    </Pressable>

                    <Pressable
                      hitSlop={10}
                      style={styles.iconBtn}
                      accessibilityLabel={`Edit ${t.name}`}
                      onPress={() => afterSheet(() => setRenaming(t))}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </Pressable>

                    <Pressable
                      hitSlop={10}
                      style={styles.iconBtn}
                      accessibilityLabel={`Delete ${t.name}`}
                      onPress={() => afterSheet(() => confirmDeleteTopic(t))}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colors.danger}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>

            <Pressable
              style={styles.addBtn}
              onPress={() => afterSheet(() => setAddingTopic(true))}
            >
              <Text style={styles.addText}>+ New topic</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <AddTopicModal
        visible={addingTopic}
        domains={domain ? [domain] : []}
        fixedParentId={domainId}
        onClose={() => setAddingTopic(false)}
        onAdded={load}
      />

      <NameModal
        visible={renaming !== null}
        title="Rename topic"
        initialName={renaming?.name ?? ""}
        saveLabel="Rename"
        onClose={() => setRenaming(null)}
        onSubmit={async (name) => {
          if (!renaming) return;
          await assertUniqueName(domainId, name, renaming.id);
          await renameDomain(renaming.id, name);
          load();
        }}
      />
    </ScrollView>
  );
}

function createStyles(c: Palette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 20, paddingBottom: 48 },
    disabled: { opacity: 0.4 },

    topicBox: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      alignItems: "center",
    },
    topicHint: { fontSize: 13, color: c.textSubtle },
    topicName: { fontSize: 18, fontWeight: "600", marginTop: 2, color: c.text },

    segment: {
      flexDirection: "row",
      backgroundColor: c.surfaceMuted,
      borderRadius: 12,
      padding: 4,
      marginBottom: 8,
    },
    segBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 9,
      alignItems: "center",
    },
    segActive: { backgroundColor: c.primary },
    segText: { fontSize: 15, color: c.textMuted, fontWeight: "500" },
    segTextActive: { color: c.onPrimary, fontWeight: "700" },
    backdrop: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    sheet: {
      width: "90%",
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 20,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
      color: c.text,
    },
    sheetEmpty: {
      color: c.textSubtle,
      textAlign: "center",
      paddingVertical: 16,
    },
    topicRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.background,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 8,
    },
    topicMain: { flex: 1, flexDirection: "row", alignItems: "center" },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    topicName2: { fontSize: 16, fontWeight: "500", color: c.text },
    iconBtn: { marginLeft: 16 },
    addBtn: {
      marginTop: 12,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: c.primary,
      alignItems: "center",
    },
    addText: { color: c.onPrimary, fontSize: 15, fontWeight: "600" },
  });
}
