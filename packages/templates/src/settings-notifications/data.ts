import { notificationChannels, notificationDefaults, notificationEvents, type NotificationChannel, type NotificationEvent, type NotificationMatrixValue } from '@gntik-ai/blocks';

export const channels: NotificationChannel[] = notificationChannels;
export const events: NotificationEvent[] = notificationEvents;
export const preferences: NotificationMatrixValue = notificationDefaults;
