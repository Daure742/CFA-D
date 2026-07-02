# Deployment & Configuration Checklist

## Environment variables (Backend - Render)

- NODE_ENV=production
- PORT (Render usually sets this automatically)
- MONGO_URI=<MongoDB Atlas connection string>
- JWT_ACCESS_SECRET=<strong secret>
- JWT_REFRESH_SECRET=<strong secret>
- JWT_ACCESS_EXPIRE=15m
- JWT_REFRESH_EXPIRE=7d
- CLIENT_URL=https://plateforme-cfa.vercel.app
- DEFAULT_TENANT_ID (optional)
- Other existing secrets (CLOUDINARY, SMTP, TWILIO, etc.)

Notes:
- `CLIENT_URL` is required in production so CORS and Socket.IO allow requests from Vercel.
- Do NOT set CLIENT_URL to `*` in production.

## Environment variables (Frontend - Vercel)

- VITE_API_URL=https://cfa-backend-vtex.onrender.com/api
- VITE_SOCKET_URL=https://cfa-backend-vtex.onrender.com
- VITE_API_DEBUG=false (optional)

Proxy option (recommended):
- If you prefer Vercel to proxy requests and avoid CORS in the browser, keep `VITE_API_URL=/api` and deploy `vercel.json` with the rewrites added.

## Quick Deployment Steps (Render)

1. In Render dashboard, create a Web Service pointing to the `backend` folder.
2. Set the start command if needed: `node server.js` (or the command your service uses).
3. Add all required environment variables listed above.
4. Ensure the health check path is set to `/health`.
5. Enable automatic deploys from your Git provider.

## Quick Deployment Steps (Vercel)

1. In Vercel dashboard, link the `cfa_digital` frontend project.
2. Add the frontend environment variables shown above (Vercel > Project > Settings > Environment Variables).
3. If using proxy, ensure `vercel.json` (in `cfa_digital`) is included in the deployment.

## Security Recommendations

- Use strong, unique `JWT_*` secrets and rotate if needed.
- Enforce HTTPS (Vercel and Render provide HTTPS by default).
- Use `helmet()` as already configured.
- Limit CORS to the exact `CLIENT_URL` and development origins.
- Set rate limiting (already present) and consider stricter limits on auth endpoints.
- Monitor logs and set up alerts for uncaught exceptions and rejections.

## Socket.IO Notes

- Backend requires `CLIENT_URL` to allow socket connections from Vercel.
- Client uses explicit `authenticate` event to pass access JWT after connecting.

## Health Check

- GET /health is available and returns service status and uptime.


## Troubleshooting

- If cookies are not sent, verify that frontend sends requests with `credentials: 'include'` or `axios` uses `withCredentials: true` (already configured).
- If `refreshToken` cookie is not persisted in the browser, ensure `SameSite=None; Secure` is set (done in backend for production).

