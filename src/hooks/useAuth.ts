import { useState, useEffect } from 'react';

const CLIENT_ID: string | undefined = import.meta.env.VITE_YOUTUBE_CLIENT_ID;

const REDIRECT_URI =
  import.meta.env.NODE_ENV === 'production'
    ? import.meta.env.VITE_REDIRECT_URI
    : window.location.origin;

const SCOPES: string = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

const AUTH_URL: string = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&scope=${encodeURIComponent(SCOPES)}&response_type=token&prompt=consent`;

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

/**
 * Waliduje token poprzez sprawdzenie czy token jest ważny w Google API
 */
const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + token
    );
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    // Sprawdź czy token nie wygasł i czy jest dla właściwego klienta
    return (
      data.expires_in > 0 &&
      (!CLIENT_ID || data.audience === CLIENT_ID || data.issued_to === CLIENT_ID)
    );
  } catch (error) {
    console.error('Błąd walidacji tokenu:', error);
    return false;
  }
};

/**
 * Pobiera informacje o użytkowniku i waliduje token
 */
const fetchAndValidateUserInfo = async (
  token: string
): Promise<UserInfo | null> => {
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
      const data: UserInfo = await response.json();
      return data;
    } else if (response.status === 401) {
      // Token jest nieprawidłowy lub wygasł
      console.warn('Token jest nieprawidłowy lub wygasł');
      return null;
    }
    return null;
  } catch (error) {
    console.error('Błąd pobierania informacji o użytkowniku:', error);
    return null;
  }
};

const useAuth = (): UseAuthResult => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sprawdź czy CLIENT_ID jest ustawione przy inicjalizacji
  useEffect(() => {
    if (!CLIENT_ID) {
      setError(
        'VITE_YOUTUBE_CLIENT_ID nie jest ustawione. Sprawdź plik .env w katalogu głównym projektu.'
      );
    }
  }, []);

  // Czyszczenie nieprawidłowych danych
  const clearAuthData = (): void => {
    localStorage.removeItem('youtube_access_token');
    localStorage.removeItem('youtube_user_info');
    setAccessToken(null);
    setUserInfo(null);
  };

  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      setIsLoading(true);
      const hash: string = window.location.hash;

      // Obsługa callback z OAuth
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const token: string | null = params.get('access_token');
        const error: string | null = params.get('error');

        if (error) {
          const errorDescription = params.get('error_description') || '';
          let errorMessage = 'Błąd autentykacji: ' + error;
          
          // Szczegółowe komunikaty dla najczęstszych błędów
          if (error === 'redirect_uri_mismatch') {
            errorMessage = `Błąd konfiguracji redirect_uri. URI przekierowania (${REDIRECT_URI}) nie jest zarejestrowane w Google Cloud Console. Dodaj ten URI do Authorized redirect URIs w ustawieniach OAuth Client ID.`;
          } else if (error === 'access_denied') {
            errorMessage = 'Dostęp został odrzucony. Musisz zaakceptować uprawnienia, aby kontynuować.';
          } else if (errorDescription) {
            errorMessage += ' ' + decodeURIComponent(errorDescription);
          }
          
          setError(errorMessage);
          console.error('Błąd autentykacji:', error, errorDescription);
          clearAuthData();
          window.location.hash = '';
          setIsLoading(false);
          return;
        }

        if (token) {
          // Waliduj nowy token
          const isValid = await validateToken(token);
          if (!isValid) {
            console.error('Otrzymany token jest nieprawidłowy');
            clearAuthData();
            window.location.hash = '';
            setIsLoading(false);
            return;
          }

          // Pobierz informacje o użytkowniku
          const userData = await fetchAndValidateUserInfo(token);
          if (userData) {
            setAccessToken(token);
            setUserInfo(userData);
            localStorage.setItem('youtube_access_token', token);
            localStorage.setItem('youtube_user_info', JSON.stringify(userData));
          } else {
            clearAuthData();
          }
          window.location.hash = '';
          setIsLoading(false);
          return;
        }
      }

      // Sprawdź zapisany token
      const storedToken: string | null = localStorage.getItem(
        'youtube_access_token'
      );
      const cachedUserInfo: string | null = localStorage.getItem(
        'youtube_user_info'
      );

      if (storedToken) {
        // Waliduj zapisany token
        const isValid = await validateToken(storedToken);
        if (isValid) {
          // Sprawdź czy mamy cache'owane dane użytkownika
          if (cachedUserInfo) {
            try {
              const parsedUserInfo = JSON.parse(cachedUserInfo);
              setAccessToken(storedToken);
              setUserInfo(parsedUserInfo);
            } catch (error) {
              console.error('Błąd parsowania danych użytkownika:', error);
              clearAuthData();
            }
          } else {
            // Pobierz dane użytkownika
            const userData = await fetchAndValidateUserInfo(storedToken);
            if (userData) {
              setAccessToken(storedToken);
              setUserInfo(userData);
              localStorage.setItem(
                'youtube_user_info',
                JSON.stringify(userData)
              );
            } else {
              clearAuthData();
            }
          }
        } else {
          // Token jest nieprawidłowy - wyczyść dane
          console.warn('Zapisany token jest nieprawidłowy - czyszczenie danych');
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
        console.warn('Token wygasł podczas sesji - wylogowywanie');
        clearAuthData();
        // Przekieruj na stronę logowania jeśli jesteśmy na chronionej stronie
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }, 5 * 60 * 1000); // 5 minut

    return () => clearInterval(validationInterval);
  }, [accessToken]);

  const handleLogin = (): void => {
    if (!CLIENT_ID) {
      setError(
        'VITE_YOUTUBE_CLIENT_ID nie jest ustawione. Sprawdź plik .env w katalogu głównym projektu.'
      );
      return;
    }
    
    // Logowanie informacji debugowych
    console.log('=== Informacje o autentykacji ===');
    console.log('Redirect URI:', REDIRECT_URI);
    console.log('Full Auth URL:', AUTH_URL);
    console.log('Upewnij się, że ten URI jest dodany w Google Cloud Console!');
    
    setError(null); // Wyczyść błąd jeśli CLIENT_ID jest dostępne
    window.location.href = AUTH_URL;
  };

  const handleLogout = (): void => {
    clearAuthData();
    // Przekierowanie na stronę logowania
    window.location.href = '/login';
  };

  return { accessToken, userInfo, isLoading, error, handleLogin, handleLogout };
};

export default useAuth;
