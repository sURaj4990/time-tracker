import * as Notifications from 'expo-notifications';
import { getDb } from './db';
import { seedDomains } from './seed';

// Clears logs, domains, settings, and scheduled reminders, then restores the default domains.
export async function resetAllData(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM entries;
      DELETE FROM domains;
      DELETE FROM settings;
      DELETE FROM sqlite_sequence;
    `);
  });
  await Notifications.cancelAllScheduledNotificationsAsync();
  await seedDomains();
}