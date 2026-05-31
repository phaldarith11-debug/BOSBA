# WEBSITE — Customer storefront

**Folder:** `bosba-ecommerce/` (Next.js 14, App Router, i18n en/km)

## Where things live
| Area | Path |
|------|------|
| Localized storefront | `src/app/[locale]/` |
| Auth (login/register) | `src/app/(auth)/` and `src/app/[locale]/(auth)/` |
| Shop pages (checkout, orders) | `src/app/[locale]/(shop)/` |
| Components | `src/components/` |
| i18n messages | `messages/en.json`, `messages/km.json` |
| Global styles | `src/app/globals.css`, `tailwind.config.ts` |

## Run
```bash
cd bosba-ecommerce
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Related env
See `docs/ENVIRONMENT.md` (bosba-ecommerce section).
</content>
