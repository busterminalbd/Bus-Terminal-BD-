export function trackMetaEvent(
  eventName: string,
  params?: Record<string, string | number | string[]>
) {
  if (typeof window === 'undefined') return;
  const fbq = (window as any).fbq;
  if (typeof fbq !== 'function') return;
  fbq('track', eventName, params || {});
}
