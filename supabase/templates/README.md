# Sign-in emails

Supabase sends them through Resend (SMTP), from `Lowfly <no-reply@lowfly.travel>`. These are the templates set in
Supabase → Authentication → Emails → Templates (Supabase does not read them from here: keep both in step).

| Template in Supabase | File | Subject |
|---|---|---|
| Magic Link | `magic-link.html` | `{{ with .Data }}{{ if eq (printf "%v" .locale) "en" }}Your Lowfly sign-in link{{ else }}Tu enlace para entrar en Lowfly{{ end }}{{ else }}Tu enlace para entrar en Lowfly{{ end }}` |
| Confirm signup | `confirm-signup.html` | `{{ with .Data }}{{ if eq (printf "%v" .locale) "en" }}Welcome to Lowfly{{ else }}Bienvenido a Lowfly{{ end }}{{ else }}Bienvenido a Lowfly{{ end }}` |

Each email is written in the account's language, `.Data.locale` (user_metadata): set when the account is created
(`signInWithEmail`) and kept up to date with the page's language while signed in (`AuthProvider`). Spanish when
it is missing. `{{ .ConfirmationURL }}` is Supabase's own link (it signs in and goes back to the page the visitor
came from).
