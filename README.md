# YouTube List Manager

Aplikacja webowa do zarządzania subskrypcjami YouTube. Pozwala przeglądać, filtrować, sortować i organizować kanały w niestandardowe listy - wszystko w jednym miejscu.

## Funkcje

- **Przeglądanie subskrypcji** - grid kanałów z avatarami, liczbą subskrybentów i filmów
- **Wyszukiwanie** - szybkie wyszukiwanie kanałów w real-time
- **Sortowanie** - po nazwie, dacie subskrypcji, liczbie subskrybentów lub filmów
- **Szczegoly kanalu** - dialog z bannerem, statystykami (subskrybenci, filmy, wyswietlenia) i opisem
- **Odsubskrybowanie** - usuwanie subskrypcji bezposrednio z aplikacji
- **Listy kanalow** - organizacja kanalow w wlasne listy (zapisywane lokalnie)
- **Dark mode** - ciemny motyw interfejsu
- **Logowanie przez Google** - bezpieczna autentykacja OAuth 2.0

## Tech Stack

| Warstwa | Technologia |
|---------|------------|
| Framework | React 18 + TypeScript |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| Komponenty UI | shadcn/ui + Radix UI |
| Ikony | Lucide React |
| Notyfikacje | Sonner |
| Build | Vite 6 |
| Deploy | Vercel |
| API | YouTube Data API v3, Google OAuth 2.0 |

## Wymagania

- Node.js 18+
- npm
- Konto Google Cloud z wlaczonym YouTube Data API v3

## Konfiguracja Google Cloud

1. Przejdz do [Google Cloud Console](https://console.cloud.google.com/)
2. Utworz nowy projekt lub wybierz istniejacy
3. Wlacz **YouTube Data API v3** w sekcji APIs & Services > Library
4. Przejdz do APIs & Services > Credentials
5. Utworz **OAuth 2.0 Client ID** (typ: Web application)
6. Dodaj Authorized redirect URIs:
   - `http://localhost:5173` (development)
   - URL produkcyjny (np. `https://twoja-domena.com`)
7. Utworz **API Key** (opcjonalnie ogranicz do YouTube Data API)
8. Skopiuj Client ID i API Key

## Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/your-username/youtube-list-and-sub.git
cd youtube-list-and-sub

# Instalacja zaleznosci
npm install

# Konfiguracja zmiennych srodowiskowych
cp .env.example .env
```

Uzupelnij plik `.env`:

```env
VITE_YOUTUBE_CLIENT_ID="twoj-client-id.apps.googleusercontent.com"
VITE_REDIRECT_URI="http://localhost:5173"
VITE_YOUTUBE_API_KEY="twoj-api-key"
```

## Uruchomienie

```bash
# Tryb developerski
npm run dev

# Build produkcyjny
npm run build

# Podglad builda
npm run preview

# Linting
npm run lint

# Formatowanie kodu
npm run format

# Deploy na Vercel
npm run deploy
```

Aplikacja dostepna pod `http://localhost:5173`.

## Struktura projektu

```
src/
├── components/
│   ├── auth/              # Logowanie, chronione trasy
│   ├── layout/            # Dashboard layout, header, sidebar
│   ├── subscriptions/     # Grid, karta kanalu, filtry, szczegoly
│   ├── lists/             # Zarzadzanie listami kanalow
│   └── ui/                # Komponenty shadcn/ui
├── contexts/              # AuthContext, SubscriptionsContext
├── hooks/                 # useAuth, useSubscriptions, useChannelLists
├── types/                 # Interfejsy TypeScript (YouTube API)
├── lib/                   # Utility (formatowanie, cn)
├── App.tsx                # Routing
└── main.tsx               # Entry point
```

## Licencja

MIT
