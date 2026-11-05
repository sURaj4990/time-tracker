import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getRangeTotals } from "../db/queries";
import { toLocalDate, formatDay } from "../lib/date";
import { fmtDuration } from "../lib/format";
import { useAppSettings, WeekStart } from "../settings/AppSettings";
import { useTheme } from "../theme/ThemeContext";
import { Palette } from "../theme/palettes";

const WEEKS = 12;
const GAP = 3;
const LABEL_WIDTH = 28;
const LABELS_MON = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
const LABELS_SUN = ["Sun", "", "Tue", "", "Thu", "", "Sat"];

function levelFor(minutes: number, levels: string[]) {
  if (minutes <= 0) return levels[0];
  if (minutes < 30) return levels[1];
  if (minutes < 60) return levels[2];
  if (minutes < 120) return levels[3];
  return levels[4];
}

// Builds WEEKS columns of 7 days. Columns start on the chosen first day,
// and the last column is the week containing today.
function buildGrid(today: Date, weekStart: WeekStart): string[][] {
  const offset =
    weekStart === "mon" ? (today.getDay() + 6) % 7 : today.getDay();
  const weekStartDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - offset,
  );
  const anchor = new Date(
    weekStartDate.getFullYear(),
    weekStartDate.getMonth(),
    weekStartDate.getDate() - (WEEKS - 1) * 7,
  );

  const columns: string[][] = [];
  for (let c = 0; c < WEEKS; c++) {
    const col: string[] = [];
    for (let r = 0; r < 7; r++) {
      col.push(
        toLocalDate(
          new Date(
            anchor.getFullYear(),
            anchor.getMonth(),
            anchor.getDate() + c * 7 + r,
          ),
        ),
      );
    }
    columns.push(col);
  }
  return columns;
}

export default function HeatmapScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { weekStart } = useAppSettings();

  const cell = Math.floor((width - 48 - LABEL_WIDTH) / WEEKS) - GAP;
  const [minutesByDate, setMinutesByDate] = useState<Map<string, number>>(
    new Map(),
  );
  const [selected, setSelected] = useState<string | null>(null);

  const today = new Date();
  const todayStr = toLocalDate(today);
  const columns = buildGrid(today, weekStart);
  const rangeStart = columns[0][0];
  const dayLabels = weekStart === "mon" ? LABELS_MON : LABELS_SUN;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const rows = await getRangeTotals(rangeStart, todayStr);
        const secondsByDate = new Map<string, number>();
        for (const r of rows) {
          secondsByDate.set(
            r.entry_date,
            (secondsByDate.get(r.entry_date) ?? 0) + r.seconds,
          );
        }
        const minutes = new Map<string, number>();
        secondsByDate.forEach((s, date) =>
          minutes.set(date, Math.round(s / 60)),
        );
        setMinutesByDate(minutes);
      })();
    }, [rangeStart, todayStr]),
  );

  const totalMinutes = [...minutesByDate.values()].reduce((a, b) => a + b, 0);
  const activeDays = [...minutesByDate.values()].filter((m) => m > 0).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.summary}>
        {fmtDuration(totalMinutes * 60)} across {activeDays}{" "}
        {activeDays === 1 ? "day" : "days"} · last {WEEKS} weeks
      </Text>

      <View style={styles.grid}>
        <View style={{ width: LABEL_WIDTH }}>
          {dayLabels.map((label, i) => (
            <Text key={i} style={[styles.dayLabel, { height: cell + GAP }]}>
              {label}
            </Text>
          ))}
        </View>

        {columns.map((col, c) => (
          <View key={c} style={{ marginRight: GAP }}>
            {col.map((date) => {
              const future = date > todayStr;
              const minutes = minutesByDate.get(date) ?? 0;
              const isSelected = selected === date;
              return (
                <Pressable
                  key={date}
                  disabled={future}
                  onPress={() => setSelected(date)}
                  style={{
                    width: cell,
                    height: cell,
                    marginBottom: GAP,
                    borderRadius: 3,
                    backgroundColor: future
                      ? "transparent"
                      : levelFor(minutes, colors.heat),
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: colors.text,
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.detail}>
        {selected ? (
          <Text style={styles.detailText}>
            {formatDay(selected)}:{" "}
            {fmtDuration((minutesByDate.get(selected) ?? 0) * 60)}
          </Text>
        ) : (
          <Text style={styles.hint}>Tap a day to see its total</Text>
        )}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {colors.heat.map((color) => (
          <View
            key={color}
            style={[styles.legendBox, { backgroundColor: color }]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </ScrollView>
  );
}

function createStyles(c: Palette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 24, paddingTop: 16 },
    summary: {
      fontSize: 14,
      color: c.textSubtle,
      textAlign: "center",
      marginBottom: 24,
    },
    grid: { flexDirection: "row", justifyContent: "center" },
    dayLabel: { fontSize: 10, color: c.textSubtle, lineHeight: 12 },
    detail: {
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    detailText: { fontSize: 16, fontWeight: "600", color: c.text },
    hint: { fontSize: 14, color: c.textSubtle },
    legend: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    legendBox: { width: 12, height: 12, borderRadius: 2 },
    legendText: { fontSize: 11, color: c.textSubtle, marginHorizontal: 4 },
  });
}
