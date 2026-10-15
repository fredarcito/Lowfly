# Sign-in emails

Supabase sends them through Resend (SMTP), from `Lowfly <no-reply@lowfly.travel>`. These are the templates pasted
in Supabase → Authentication → Emails → Templates (Supabase does not read them from here: keep both in step).

| Template in Supabase | File | Subject |
|---|---|---|
| Magic Link | `magic-link.html` | Tu enlace para entrar en Lowfly · Your Lowfly sign-in link |
| Confirm signup | `confirm-signup.html` | Bienvenido a Lowfly · Welcome to Lowfly |

Both are bilingual (Spanish, then English): Supabase does not know the visitor's language when it sends them.
`{{ .ConfirmationURL }}` is Supabase's own link (it signs in and goes back to the page the visitor came from).
