# Inplant — Sitio web

Sitio estático (HTML/CSS/JS, sin build) con un backend mínimo para el
formulario de contacto.

## Estructura

```
index.html, css/, js/, images/, img/   → el sitio (estático)
api/contact.js                          → función serverless (Vercel) del formulario
```

Cuando alguien completa el formulario de contacto, el sitio:
1. Abre WhatsApp con el mensaje precargado (inmediato, no depende del backend).
2. En paralelo, manda esos mismos datos a `/api/contact`, que envía un
   email a Inplant con la consulta — así ninguna consulta se pierde,
   aunque la persona no termine de mandar el WhatsApp.

## Desarrollo local

Para probar solo el frontend (sin backend), cualquier servidor estático
sirve — por ejemplo `python -m http.server`.

Para probar el backend también:
```bash
npm install
npm i -g vercel        # una vez
vercel dev
```

## Poner el backend a funcionar (2 pasos, los tenés que hacer vos)

### 1. Cuenta en Resend (envía los emails)
1. Creá una cuenta gratis en **[resend.com](https://resend.com)**.
2. Generá una API key desde su dashboard.
3. Guardala — la vas a cargar como variable de entorno en Vercel (paso 2).

Mientras no verifiques el dominio `inplant.com.ar` en Resend, los emails
salen igual usando su remitente de pruebas (`onboarding@resend.dev`) —
funciona, solo que el remitente no dice "Inplant". Cuando quieras eso,
Resend te guía para verificar el dominio (agregar unos registros DNS).

### 2. Desplegar en Vercel
1. Entrá a **[vercel.com](https://vercel.com)** y conectá tu cuenta de GitHub.
2. "Add New Project" → elegís el repo `inplant-website`.
3. En "Environment Variables" cargá:
   - `RESEND_API_KEY` = la que generaste en el paso 1
   - `CONTACT_TO_EMAIL` = `hola@inplant.com.ar`
4. Deploy. Vercel te da una URL (`inplant-website.vercel.app`) — el sitio
   completo (frontend + `/api/contact`) queda ahí, en el mismo dominio.

Después, cada `git push` a `master` despliega solo (sin volver a tocar nada).

### Dominio propio
Cuando tengan `inplant.com.ar`, se conecta desde Vercel → Project →
Settings → Domains. No requiere cambiar nada del código.

## Variables de entorno

Ver [`.env.example`](.env.example) — copialo como `.env` para desarrollo
local (`vercel dev` lo lee solo). En producción se cargan en el dashboard
de Vercel, nunca se suben al repo.
