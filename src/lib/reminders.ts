import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { getEntryDates } from "../db/queries";
import { toLocalDate } from "./date";

const CHANNEL_ID = "reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureReminderPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function syncReminders(reminder: {
  enabled: boolean;
  hour: number;
  minute: number;
}): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!reminder.enabled) return;

  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Daily reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const loggedDates = new Set(await getEntryDates());
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const when = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + i,
      reminder.hour,
      reminder.minute,
    );
    if (when <= now) continue;
    if (loggedDates.has(toLocalDate(when))) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to log",
        body: "Nothing tracked yet today. Log a session to keep your streak going.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        channelId: CHANNEL_ID,
      },
    });
  }
}
