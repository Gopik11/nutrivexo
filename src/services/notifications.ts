import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const WEEKLY_DIGEST_IDENTIFIER = 'nutrivexo-weekly-digest';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Nutrivexo',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  await ensureAndroidChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.granted;
}

/** Schedules (or reschedules) a weekly Monday-morning insights reminder. */
export async function scheduleWeeklyDigest(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(WEEKLY_DIGEST_IDENTIFIER).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_DIGEST_IDENTIFIER,
    content: {
      title: 'Your weekly Nutrivexo digest',
      body: 'See how this week’s scans stack up against your goals.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 2, // Monday (1 = Sunday)
      hour: 9,
      minute: 0,
    },
  });
}

export async function cancelWeeklyDigest(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(WEEKLY_DIGEST_IDENTIFIER).catch(() => {});
}

/** Fires immediately — used right after saving a scan with a "contains" allergen alert. */
export async function sendHighConcernAlert(productName: string, reason: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Heads up about ${productName}`,
      body: reason,
    },
    trigger: null,
  });
}
