import { GateNotification, GateNotificationResponse } from '@/types/gate';

const STORAGE_KEY = 'gate_notifications';
const LAST_CHECK_KEY = 'gate_last_check';
const GATE_URL = 'https://gate2026.iitg.ac.in/notifications.html';
const CORS_PROXY = 'https://api.allorigins.win/raw?url='; // Free CORS proxy

/**
 * Fetch GATE notifications from official website
 * Uses CORS proxy to bypass browser restrictions
 */
export const fetchGateNotifications = async (): Promise<GateNotificationResponse> => {
  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(GATE_URL)}`, {
      headers: {
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const html = await response.text();
    const notifications = parseNotifications(html);

    // Mark new notifications
    const stored = getStoredNotifications();
    const storedIds = new Set(stored.map(n => n.id));
    
    const enrichedNotifications = notifications.map(notif => ({
      ...notif,
      isNew: !storedIds.has(notif.id),
    }));

    // Save to localStorage
    saveNotifications(enrichedNotifications);
    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());

    return {
      notifications: enrichedNotifications,
      lastUpdated: new Date().toISOString(),
      source: GATE_URL,
    };
  } catch (error) {
    console.error('Error fetching GATE notifications:', error);
    
    // Return stored notifications as fallback
    const stored = getStoredNotifications();
    return {
      notifications: stored,
      lastUpdated: localStorage.getItem(LAST_CHECK_KEY) || new Date().toISOString(),
      source: GATE_URL,
    };
  }
};

/**
 * Parse HTML to extract notifications from the table
 */
const parseNotifications = (html: string): GateNotification[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Find the table with notifications
  const table = doc.querySelector('table.table-bordered, table.table-striped, table.table');
  
  if (!table) {
    console.warn('Notification table not found');
    return [];
  }

  const notifications: GateNotification[] = [];
  const rows = table.querySelectorAll('tr');

  rows.forEach((row, index) => {
    // Skip header row
    if (index === 0 && row.querySelector('th')) return;

    const cells = row.querySelectorAll('td');
    if (cells.length === 0) return;

    let title = '';
    let date = '';
    let link = '';

    // Try to extract date (usually first column)
    if (cells.length >= 2) {
      date = cells[0]?.textContent?.trim() || '';
      title = cells[1]?.textContent?.trim() || '';
      
      // Check for link in second column
      const anchor = cells[1]?.querySelector('a');
      if (anchor) {
        link = anchor.getAttribute('href') || '';
        // Make relative URLs absolute
        if (link && !link.startsWith('http')) {
          link = `https://gate2026.iitg.ac.in/${link.replace(/^\//, '')}`;
        }
      }
    } else {
      // Single column - just title
      title = cells[0]?.textContent?.trim() || '';
      const anchor = cells[0]?.querySelector('a');
      if (anchor) {
        link = anchor.getAttribute('href') || '';
        if (link && !link.startsWith('http')) {
          link = `https://gate2026.iitg.ac.in/${link.replace(/^\//, '')}`;
        }
      }
    }

    if (title) {
      const category = categorizeNotification(title);
      const id = generateId(title, date);
      
      notifications.push({
        id,
        title,
        date: date || undefined,
        link: link || undefined,
        category,
        isNew: false,
        fetchedAt: new Date().toISOString(),
      });
    }
  });

  return notifications;
};

/**
 * Categorize notification based on title keywords
 */
const categorizeNotification = (title: string): GateNotification['category'] => {
  const lower = title.toLowerCase();
  
  if (lower.includes('result') || lower.includes('score')) return 'result';
  if (lower.includes('admit') || lower.includes('hall ticket')) return 'admit-card';
  if (lower.includes('exam') || lower.includes('schedule') || lower.includes('date')) return 'exam';
  if (lower.includes('notification') || lower.includes('important')) return 'notification';
  
  return 'general';
};

/**
 * Generate unique ID for notification
 */
const generateId = (title: string, date: string): string => {
  const str = `${title}-${date}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `gate_${Math.abs(hash)}`;
};

/**
 * Get stored notifications from localStorage
 */
export const getStoredNotifications = (): GateNotification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Save notifications to localStorage
 */
const saveNotifications = (notifications: GateNotification[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = (): void => {
  const notifications = getStoredNotifications();
  const updated = notifications.map(n => ({ ...n, isNew: false }));
  saveNotifications(updated);
};

/**
 * Get count of new notifications
 */
export const getNewNotificationsCount = (): number => {
  const notifications = getStoredNotifications();
  return notifications.filter(n => n.isNew).length;
};

/**
 * Get last check timestamp
 */
export const getLastCheckTime = (): string | null => {
  return localStorage.getItem(LAST_CHECK_KEY);
};

/**
 * Clear all stored notifications
 */
export const clearNotifications = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_CHECK_KEY);
};
