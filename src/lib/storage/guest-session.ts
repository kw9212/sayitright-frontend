const GUEST_SESSION_KEY = 'guest_session_id';

function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getGuestSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem(GUEST_SESSION_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }

  return sessionId;
}

export function clearGuestSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(GUEST_SESSION_KEY);
}

export function hasGuestSession(): boolean {
  if (typeof window === 'undefined') return false;
  return !!sessionStorage.getItem(GUEST_SESSION_KEY);
}
