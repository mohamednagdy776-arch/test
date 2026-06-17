'use client';
import { useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

async function registerPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const { data: { data } } = await apiClient.get('/push/vapid-public-key');
    if (!data?.publicKey) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey) as unknown as BufferSource,
    });

    const key = subscription.getKey?.('p256dh');
    const auth = subscription.getKey?.('auth');
    if (!key || !auth) return;

    await apiClient.post('/push/subscribe', {
      endpoint: subscription.endpoint,
      p256dh: btoa(String.fromCharCode(...new Uint8Array(key))),
      authKey: btoa(String.fromCharCode(...new Uint8Array(auth))),
    });
  } catch {
    // Push setup is non-critical; ignore errors silently
  }
}

export function usePushNotifications() {
  useEffect(() => {
    registerPush();
  }, []);
}
