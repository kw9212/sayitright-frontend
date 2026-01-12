const ACCESS_TOKEN_KEY = 'access_token';

export const tokenStore = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clearAccessToken() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
