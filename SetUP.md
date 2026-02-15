# Setup nowego projektu na podstawie tego repozytorium
1. Na stronie tego repo
2. https://github.com/aleksanderjedynak/basic/actions/workflows/create_new_project.yml
3. Wybierz "Run workflow" i podaj nazwe
4. Repo jest zrobione
5. Teraz poberz repo 
6. odpal w repo i zaloguje sie kontem githuba
```bash
  vercel login
```
7. potem to
```bash
  vercel deploy --prod --yes
```
8. Masz setup projektu i mozesz sobie dalej pracowac :)

## Konfiguracja Google OAuth

Aby aplikacja działała poprawnie, musisz skonfigurować Google OAuth:

1. **Utwórz projekt w Google Cloud Console:**
   - Przejdź do https://console.cloud.google.com/
   - Utwórz nowy projekt lub wybierz istniejący

2. **Włącz YouTube Data API v3:**
   - W menu po lewej stronie wybierz "APIs & Services" > "Library"
   - Wyszukaj "YouTube Data API v3" i kliknij "Enable"

3. **Utwórz OAuth 2.0 Client ID:**
   - Przejdź do "APIs & Services" > "Credentials"
   - Kliknij "Create Credentials" > "OAuth client ID"
   - Wybierz "Web application"
   - **Ważne:** Dodaj Authorized redirect URIs:
     - Dokładny URI, na którym działa aplikacja (np. `http://localhost:5173`, `http://localhost:5175`, etc.)
     - **Uwaga:** URI musi być dokładnie taki sam jak ten, na którym działa aplikacja
     - Możesz dodać kilka URI dla różnych portów:
       - `http://localhost:5173`
       - `http://localhost:5175`
       - `http://localhost:3000`
     - Dla produkcji dodaj swoją domenę (np. `https://your-app.vercel.app`)
   - **Uwaga:** Jeśli zmieniasz port lub domenę, musisz dodać nowy URI w Google Cloud Console!

4. **Skonfiguruj zmienne środowiskowe:**
   - Utwórz plik `.env` w katalogu głównym projektu
   - Dodaj następującą linię:
     ```
     VITE_YOUTUBE_CLIENT_ID=twoj_client_id_tutaj
     ```
   - Dla produkcji możesz też dodać:
     ```
     VITE_REDIRECT_URI=https://twoja-domena.com
     ```

5. **Zrestartuj serwer deweloperski:**
   ```bash
   npm run dev
   ```

**Uwaga:** Plik `.env` powinien być dodany do `.gitignore` i nigdy nie powinien być commitowany do repozytorium! 