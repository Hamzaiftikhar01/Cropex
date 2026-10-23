/**
 * Cropex Phase 6 — SMS & Push Outbreak Alert Notification Engine
 * ==============================================================
 * Empowers Pakistani farmers with early disease warning broadcasts
 * via simulated SMS messaging and browser Web Push notifications.
 */

const SMS_SUBSCRIPTIONS_KEY = 'cropex_sms_alert_subscriptions';

/**
 * Validates a Pakistani mobile number (e.g. 03001234567, +923001234567, 0321-1234567).
 *
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPakistaniPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Matches 03XXXXXXXXX or +923XXXXXXXXX or 923XXXXXXXXX
  return /^(03|\+923|923)\d{9}$/.test(cleaned);
}

/**
 * Formats a phone number into standard Pakistani national format (03XX XXXXXXX).
 * @param {string} phone
 * @returns {string}
 */
export function formatPakistaniPhone(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+92')) return '0' + cleaned.slice(3);
  if (cleaned.startsWith('92')) return '0' + cleaned.slice(2);
  return cleaned;
}

/**
 * Retrieves all stored SMS alert subscriptions.
 * @returns {Array<object>}
 */
export function getStoredSubscriptions() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SMS_SUBSCRIPTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[smsAlertService] Error reading subscriptions:', err);
    return [];
  }
}

/**
 * Registers a new farmer for district-level outbreak emergency alerts.
 *
 * @param {object} param
 * @param {string} param.phone - Mobile number
 * @param {string} param.district - e.g. 'Faisalabad'
 * @param {string} param.crop - e.g. 'Wheat'
 * @param {string} [param.language='ur'] - 'ur' or 'en'
 * @returns {object} Subscription record
 */
export function subscribeToSmsAlerts({ phone, district, crop, language = 'ur' }) {
  const list = getStoredSubscriptions();
  const formattedPhone = formatPakistaniPhone(phone);

  const existingIndex = list.findIndex(
    (item) => item.phone === formattedPhone && item.district === district && item.crop === crop
  );

  const record = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    phone: formattedPhone,
    district,
    crop,
    language,
    createdAt: new Date().toISOString(),
    active: true,
  };

  if (existingIndex >= 0) {
    list[existingIndex] = record;
  } else {
    list.unshift(record);
  }

  try {
    localStorage.setItem(SMS_SUBSCRIPTIONS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('[smsAlertService] Error persisting subscription:', err);
  }

  return record;
}

/**
 * Unsubscribes a phone number from SMS alerts.
 * @param {string} phone
 */
export function unsubscribeFromSmsAlerts(phone) {
  const formattedPhone = formatPakistaniPhone(phone);
  const updated = getStoredSubscriptions().filter((sub) => sub.phone !== formattedPhone);
  try {
    localStorage.setItem(SMS_SUBSCRIPTIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[smsAlertService] Storage error:', err);
  }
}

/**
 * Formats a localized SMS broadcast message for district outbreaks.
 *
 * @param {object} params
 * @param {string} params.district - e.g. 'Faisalabad'
 * @param {string} params.crop - e.g. 'Wheat'
 * @param {string} params.disease - e.g. 'Yellow (Stripe) Rust'
 * @param {string} [params.riskLevel='High']
 * @param {string} [params.helpline='0800-15000']
 * @param {string} [params.language='ur']
 * @returns {string} SMS payload under 160 characters
 */
export function formatOutbreakSmsMessage({
  district,
  crop,
  disease,
  riskLevel = 'High',
  helpline = '0800-15000',
  language = 'ur',
}) {
  if (language === 'ur') {
    return `⚠️ کراپیکس ہنگامی الرٹ: ضلع ${district} میں ${crop} پر ${disease} کا ${riskLevel === 'High' ? 'شدید' : 'درمیانہ'} خطرہ ہے۔ فوری حفاظتی سپرے کریں۔ رہنمائی ہیلپ لائن: ${helpline}`;
  }

  return `⚠️ CROPEX ALERT: ${riskLevel} risk of ${disease} in District ${district} for ${crop}. Inspect field and take preventive action. Help: ${helpline}`;
}

/**
 * Requests browser permission for native Web Push notifications.
 * @returns {Promise<boolean>}
 */
export async function requestPushNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Triggers an instant native browser push notification for disease outbreaks.
 *
 * @param {object} params
 * @param {string} params.title
 * @param {string} params.body
 * @param {string} [params.icon='/icons/icon-192.png']
 * @returns {boolean}
 */
export function sendBrowserPushNotification({ title, body, icon = '/icons/icon-192.png' }) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
        vibrate: [200, 100, 200],
      });
      return true;
    } catch (err) {
      console.warn('[smsAlertService] Push notification error:', err);
      return false;
    }
  }

  return false;
}
