import { useState, useEffect } from 'react';

const CLIENT_ID: string | undefined = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
const CLIENT_SECRET: string | undefined = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET;

const REDIRECT_URI =
  import.meta.env.NODE_ENV === 'production'
    ? import.meta.env.VITE_REDIRECT_URI
    : window.location.origin;

// youtube.force-ssl jest wymagany do usuwania subskrypcji (operacje zapisu na YouTube API).
// YouTube API nie oferuje bardziej granularnego scope'a — to minimum dla zarządzania subskrypcjami.
const SCOPES: string = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

// --- PKCE helpers ---

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(36).padStart(2, '0'))
    .join('')
    .substring(0, length);
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// --- Typy ---

interface UserInfo {
  name: string;
  email: string;
  picture: string;
  id: string;
  locale: string;
  [key: string]: any;
}

export interface UseAuthResult {
  accessToken: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  handleLogin: () => void;
  handleLogout: () => void;
}

// --- Funkcje pomocnicze ---

/**
 * Waliduje token przez endpoint userinfo — token w nagłówku Authorization, nie w URL
 */
const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Pobiera informacje o użytkowniku
 */
const fetchUserInfo = async (token: string): Promise<UserInfo | null> => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Wymienia kod autoryzacyjny na access token (Authorization Code Flow z PKCE)
 */
const exchangeCodeForToken = async (
  code: string,
  codeVerifier: string
): Promise<string> => {
  const body: Record<string, string> = {
    code,
    client_id: CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  };

  // Dla OAuth klientów typu "Web application" — client_secret jest wymagany
  if (CLIENT_SECRET) {
    body.client_secret = CLIENT_SECRET;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error_description ||
        errorData.error ||
        `Token exchange failed: ${response.status}`
    );
  }

  const tokenData = await response.json();
  if (!tokenData.access_token) {
    throw new Error('Brak access_token w odpowiedzi');
  }

  return tokenData.access_token;
};

// --- Hook ---

const useAuth = (): UseAuthResult => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!CLIENT_ID) {
      setError(
        'VITE_YOUTUBE_CLIENT_ID nie jest ustawione. Sprawdź plik .env w katalogu głównym projektu.'
      );
    }
  }, []);

  const clearAuthData = (): void => {
    sessionStorage.removeItem('youtube_access_token');
    sessionStorage.removeItem('youtube_user_info');
    // Migracja: wyczyść stare dane z localStorage (jeśli istnieją)
    localStorage.removeItem('youtube_access_token');
    localStorage.removeItem('youtube_user_info');
    setAccessToken(null);
    setUserInfo(null);
  };

  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      setIsLoading(true);

      // Authorization Code Flow — kod przychodzi w query params (?code=...&state=...)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const oauthError = urlParams.get('error');

      // Obsługa błędów z OAuth
      if (oauthError) {
        const errorDescription = urlParams.get('error_description') || '';
        let errorMessage = 'Błąd autentykacji: ' + oauthError;

        if (oauthError === 'redirect_uri_mismatch') {
          errorMessage = `Błąd konfiguracji redirect_uri. URI przekierowania (${REDIRECT_URI}) nie jest zarejestrowane w Google Cloud Console.`;
        } else if (oauthError === 'access_denied') {
          errorMessage =
            'Dostęp został odrzucony. Musisz zaakceptować uprawnienia.';
        } else if (errorDescription) {
          errorMessage += ' ' + decodeURIComponent(errorDescription);
        }

        setError(errorMessage);
        clearAuthData();
        window.history.replaceState({}, '', window.location.pathname);
        setIsLoading(false);
        return;
      }

      // Obsługa callback z kodem autoryzacyjnym
      if (code) {
        // Weryfikacja parametru state (ochrona CSRF)
        const savedState = sessionStorage.getItem('oauth_state');
        if (!state || state !== savedState) {
          setError(
            'Nieprawidłowy parametr state — potencjalny atak CSRF. Spróbuj zalogować się ponownie.'
          );
          clearAuthData();
          sessionStorage.removeItem('oauth_state');
          sessionStorage.removeItem('oauth_code_verifier');
          window.history.replaceState({}, '', window.location.pathname);
          setIsLoading(false);
          return;
        }

        const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_code_verifier');

        if (!codeVerifier) {
          setError(
            'Brak code_verifier — nie można wymienić kodu na token. Spróbuj zalogować się ponownie.'
          );
          window.history.replaceState({}, '', window.location.pathname);
          setIsLoading(false);
          return;
        }

        try {
          const token = await exchangeCodeForToken(code, codeVerifier);
          const userData = await fetchUserInfo(token);

          if (userData) {
            setAccessToken(token);
            setUserInfo(userData);
            sessionStorage.setItem('youtube_access_token', token);
            sessionStorage.setItem(
              'youtube_user_info',
              JSON.stringify(userData)
            );
          } else {
            setError('Nie udało się pobrać danych użytkownika.');
            clearAuthData();
          }
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Błąd wymiany kodu na token';
          setError(message);
          clearAuthData();
        }

        window.history.replaceState({}, '', window.location.pathname);
        setIsLoading(false);
        return;
      }

      // Sprawdź zapisany token w sessionStorage
      const storedToken = sessionStorage.getItem('youtube_access_token');
      const cachedUserInfo = sessionStorage.getItem('youtube_user_info');

      if (storedToken) {
        const isValid = await validateToken(storedToken);
        if (isValid) {
          if (cachedUserInfo) {
            try {
              const parsedUserInfo = JSON.parse(cachedUserInfo);
              setAccessToken(storedToken);
              setUserInfo(parsedUserInfo);
            } catch {
              clearAuthData();
            }
          } else {
            const userData = await fetchUserInfo(storedToken);
            if (userData) {
              setAccessToken(storedToken);
              setUserInfo(userData);
              sessionStorage.setItem(
                'youtube_user_info',
                JSON.stringify(userData)
              );
            } else {
              clearAuthData();
            }
          }
        } else {
          clearAuthData();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Okresowa walidacja tokenu (co 5 minut)
  useEffect(() => {
    if (!accessToken) return;

    const validationInterval = setInterval(async () => {
      const isValid = await validateToken(accessToken);
      if (!isValid) {
        clearAuthData();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(validationInterval);
  }, [accessToken]);

  const handleLogin = async (): Promise<void> => {
    if (!CLIENT_ID) {
      setError('VITE_YOUTUBE_CLIENT_ID nie jest ustawione.');
      return;
    }

    if (import.meta.env.DEV) {
      console.log('Redirect URI:', REDIRECT_URI);
    }

    setError(null);

    // Generowanie PKCE code_verifier i code_challenge
    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(32);

    // Zapisz w sessionStorage do weryfikacji po powrocie z Google
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_code_verifier', codeVerifier);

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', SCOPES);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('access_type', 'online');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.href = authUrl.toString();
  };

  const handleLogout = (): void => {
    clearAuthData();
    window.location.href = '/login';
  };

  return { accessToken, userInfo, isLoading, error, handleLogin, handleLogout };
};

export default useAuth;
