import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Shield, Key, Youtube } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();

  useEffect(() => {
    if (auth && auth.accessToken && auth.userInfo && !auth.isLoading) {
      navigate('/', { replace: true });
    }
  }, [auth, navigate]);

  if (!auth || auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-muted-foreground text-sm">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-content bg-background">
      <div className="w-full max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Lewa strona - branding */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center">
              <Youtube className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              YouTube List Manager
            </h1>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Profesjonalne narzędzie do zarządzania subskrypcjami YouTube.
            Twórz listy, organizuj kanały, przeszukuj i zarządzaj wszystkim
            w jednym miejscu.
          </p>
          <div className="space-y-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Bezpieczne logowanie</p>
                <p className="text-sm text-muted-foreground">
                  Oficjalne Google OAuth 2.0 API - Twoje dane są chronione
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Pełna kontrola</p>
                <p className="text-sm text-muted-foreground">
                  Przeglądaj, organizuj i zarządzaj swoimi subskrypcjami
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prawa strona - formularz logowania */}
        <Card className="w-full max-w-md mx-auto border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="flex justify-center lg:hidden">
              <div className="h-14 w-14 rounded-xl bg-red-600 flex items-center justify-center">
                <Youtube className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Zaloguj się</CardTitle>
            <CardDescription>
              Zaloguj się za pomocą konta Google, aby uzyskać dostęp do
              aplikacji
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {auth?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Błąd konfiguracji</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {auth.error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={auth?.handleLogin}
              disabled={!!auth?.error}
              className="w-full h-12 text-base font-medium bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300"
              size="lg"
            >
              <svg
                className="h-5 w-5 mr-3"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Zaloguj się za pomocą Google
            </Button>
          </CardContent>

          <Separator />

          <CardFooter className="flex flex-col gap-2 pt-4">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Aplikacja wymaga dostępu do Twoich subskrypcji YouTube w celu
              zarządzania listami. Twoje dane są bezpieczne.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
