export interface GateNotification {
  id: string;
  title: string;
  date?: string;
  link?: string;
  category?: 'exam' | 'result' | 'admit-card' | 'notification' | 'general';
  isNew: boolean;
  fetchedAt: string;
}

export interface GateNotificationResponse {
  notifications: GateNotification[];
  lastUpdated: string;
  source: string;
}
