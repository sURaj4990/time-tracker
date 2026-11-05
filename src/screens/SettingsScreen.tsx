import { ComponentProps, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { Palette, ThemeMode } from "../theme/palettes";
import { resetAllData } from "../db/reset";
import { getDomains, DomainRow } from "../db/queries";
import { useAppSettings, WeekStart } from "../settings/AppSettings";
import TimePickerSheet from "../components/TimePickerSheet";
import React from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: IconName }[] = [
  { key: "light", label: "Light", icon: "sunny-outline" },
  { key: "dark", label: "Dark", icon: "moon-outline" },
  { key: "system", label: "System", icon: "phone-portrait-outline" },
];

const HOURS_0_TO_8 = Array.from({ length: 9 }, (_, i) => i);
const GOAL_MINUTES = [0, 15, 30, 45];
const HOURS_0_TO_23 = Array.from({ length: 24 }, (_, i) => i);
const REMINDER_MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

const pad = (n: number) => String(n).padStart(2, "0");

function goalText(minutes: number) {
  if (!minutes) return "Not set";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function SettingsScreen() {
  const { colors, mode, setMode, resetMode } = useTheme();
  const {
    weekStart,
    setWeekStart,
    goals,
    setGoal,
    reminder,
    setReminder,
    reload,
  } = useAppSettings();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [goalFor, setGoalFor] = useState<DomainRow | null>(null);
  const [timeOpen, setTimeOpen] = useState(false);

  const loadDomains = async () => {
    const all = await getDomains();
    setDomains(
      all
        .filter((d) => d.parent_id == null)
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const toggleReminder = async (enabled: boolean) => {
    const ok = await setReminder({ ...reminder, enabled });
    if (!ok) {
      Alert.alert(
        "Notifications are off",
        "Allow notifications for Time Tracker in your phone settings to get reminders.",
      );
    }
  };

  const doReset = async () => {
    try {
      await resetAllData();
      resetMode();
      await reload();
      await loadDomains();
      Alert.alert("All set", "The app has been reset to a fresh start.");
    } catch {
      Alert.alert("Reset failed", "Please try again.");
    }
  };

  const confirmReset = () =>
    Alert.alert(
      "Reset everything?",
      "This deletes all domains, topics, logged time, and settings, then restores the default setup. It cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: doReset },
      ],
    );

  const weekOptions: { key: WeekStart; label: string }[] = [
    { key: "mon", label: "Monday" },
    { key: "sun", label: "Sunday" },
  ];

  const goalMinutes = goalFor ? (goals[goalFor.id] ?? 0) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Appearance</Text>
      <View style={styles.card}>
        <View style={styles.iconRow}>
          {THEME_OPTIONS.map((o) => {
            const active = mode === o.key;
            return (
              <Pressable
                key={o.key}
                onPress={() => setMode(o.key)}
                accessibilityLabel={o.label}
                accessibilityState={{ selected: active }}
                style={[
                  styles.iconPill,
                  active && { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons
                  name={o.icon}
                  size={22}
                  color={active ? colors.onPrimary : colors.textMuted}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.section}>Calendar</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={colors.textMuted}
            style={styles.rowIcon}
          />
          <Text style={styles.rowLabel}>First day of week</Text>
        </View>
        <View style={styles.pills}>
          {weekOptions.map((o) => {
            const active = weekStart === o.key;
            return (
              <Pressable
                key={o.key}
                onPress={() => setWeekStart(o.key)}
                style={[
                  styles.pill,
                  active && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    active && { color: colors.onPrimary },
                  ]}
                >
                  {o.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.section}>Daily goals</Text>
      <View style={styles.card}>
        {domains.length === 0 && (
          <Text style={styles.empty}>No domains yet.</Text>
        )}
        {domains.map((d, i) => {
          const minutes = goals[d.id] ?? 0;
          return (
            <Pressable
              key={d.id}
              onPress={() => {
                setGoalFor(d);
                setTimeOpen(true);
              }}
              style={[styles.row, i < domains.length - 1 && styles.rowBorder]}
            >
              <View style={[styles.dot, { backgroundColor: d.color }]} />
              <Text style={[styles.rowLabel, { flex: 1 }]}>{d.name}</Text>
              <View
                style={[styles.valuePill, minutes === 0 && { opacity: 0.6 }]}
              >
                <Text style={styles.valueText}>{goalText(minutes)}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSubtle}
                style={{ marginLeft: 6 }}
              />
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>
        Tap a domain to set its daily goal. Choose 0h 0m to remove it.
      </Text>

      <Text style={styles.section}>Reminders</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.textMuted}
            style={styles.rowIcon}
          />
          <Text style={[styles.rowLabel, { flex: 1 }]}>Daily reminder</Text>
          <Switch
            value={reminder.enabled}
            onValueChange={toggleReminder}
            trackColor={{ false: colors.surfaceMuted, true: colors.primary }}
          />
        </View>
        {reminder.enabled && (
          <Pressable
            onPress={() => {
              setGoalFor(null);
              setTimeOpen(true);
            }}
            style={[styles.row, styles.rowBorderTop]}
          >
            <Ionicons
              name="time-outline"
              size={20}
              color={colors.textMuted}
              style={styles.rowIcon}
            />
            <Text style={[styles.rowLabel, { flex: 1 }]}>Remind me at</Text>
            <View style={styles.valuePill}>
              <Text style={styles.valueText}>
                {pad(reminder.hour)}:{pad(reminder.minute)}
              </Text>
            </View>
          </Pressable>
        )}
      </View>
      <Text style={styles.hint}>
        You'll get a reminder at this time on days nothing has been logged yet.
      </Text>

      <Text style={styles.section}>Data</Text>
      <Pressable style={styles.dangerCard} onPress={confirmReset}>
        <Ionicons name="refresh-outline" size={22} color={colors.danger} />
        <View style={styles.dangerText}>
          <Text style={styles.dangerTitle}>Reset app</Text>
          <Text style={styles.hint}>
            Clears all logs, domains, topics, and settings, and restores the
            default setup.
          </Text>
        </View>
      </Pressable>

      {/* Goal picker */}
      <TimePickerSheet
        visible={timeOpen && goalFor !== null}
        title={goalFor ? `Daily goal · ${goalFor.name}` : ""}
        hours={HOURS_0_TO_8}
        minutes={GOAL_MINUTES}
        initialHour={Math.floor(goalMinutes / 60)}
        initialMinute={goalMinutes % 60}
        formatHour={(h) => `${h}h`}
        formatMinute={(m) => `${m}m`}
        onClose={() => setTimeOpen(false)}
        onConfirm={(h, m) => {
          if (goalFor) setGoal(goalFor.id, h * 60 + m);
        }}
      />

      {/* Reminder time picker */}
      <TimePickerSheet
        visible={timeOpen && goalFor === null && reminder.enabled}
        title="Reminder time"
        hours={HOURS_0_TO_23}
        minutes={REMINDER_MINUTES}
        initialHour={reminder.hour}
        initialMinute={reminder.minute}
        formatHour={pad}
        formatMinute={pad}
        onClose={() => setTimeOpen(false)}
        onConfirm={(h, m) => setReminder({ ...reminder, hour: h, minute: m })}
      />
    </ScrollView>
  );
}

function createStyles(c: Palette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 20, paddingBottom: 48 },
    section: {
      fontSize: 13,
      fontWeight: "700",
      color: c.textSubtle,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: 20,
      marginBottom: 8,
    },
    card: { backgroundColor: c.surface, borderRadius: 14, overflow: "hidden" },
    row: { flexDirection: "row", alignItems: "center", padding: 16 },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    rowBorderTop: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    rowIcon: { marginRight: 12 },
    rowLabel: { fontSize: 16, color: c.text },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
    valuePill: {
      backgroundColor: c.surfaceMuted,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 10,
    },
    valueText: { fontSize: 14, fontWeight: "600", color: c.text },
    empty: { padding: 16, color: c.textSubtle },
    iconRow: { flexDirection: "row", gap: 8, padding: 8 },
    iconPill: {
      flex: 1,
      height: 52,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surfaceMuted,
    },
    pills: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    pill: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: c.surfaceMuted,
    },
    pillText: { fontSize: 15, fontWeight: "600", color: c.text },
    hint: {
      fontSize: 13,
      color: c.textSubtle,
      marginTop: 8,
      paddingHorizontal: 4,
    },
    dangerCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
    },
    dangerText: { flex: 1, marginLeft: 12 },
    dangerTitle: { fontSize: 16, fontWeight: "600", color: c.danger },
  });
}
