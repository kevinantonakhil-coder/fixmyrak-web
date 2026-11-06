# FixMyRAK Architecture Notes

## Existing application

- Frontend: React, TypeScript, and Vite. GitHub Pages deploys the static build.
- Authentication and data: Firebase Authentication and the existing named Firestore database configured by `firebase-applet-config.json`.
- Reports: `/reports/{reportId}` documents. The application subscribes once to the public reports collection with a Firestore real-time listener and passes the live data to pages. Administrator status changes are recorded in `/reports/{reportId}/updates/{updateId}`.
- User data: `/users/{uid}` profiles and `/admins/{uid}` administrator records.
- Notifications: `/notifications/{notificationId}` documents. The header already subscribes to the signed-in user's notifications in real time.
- Maps: Google Maps with a Leaflet/OpenStreetMap fallback. Report coordinates are stored on the existing report documents.
- Gemini: the Express server in `server.ts`, deployed as the existing Render service. The frontend reaches it through `VITE_AI_API_BASE_URL`; the Gemini key stays on the server.
- Admin analytics: `AdminDashboardPage` currently calculates report status and category counts from the live reports supplied by the app.

## Feature implementation notes

New features reuse the existing reports, notifications, map, and Gemini paths. No second database or sample report data is introduced. Firestore security changes are maintained in the existing `firestore.rules` file.

## Added feature behavior

- Smart Heatmap is a Leaflet canvas overlay in the existing map page. It consumes the app's existing live `/reports` snapshot, applies category/status/date filters locally, ignores invalid coordinates, shows density and nearby real reports, and can open a report in the existing detail modal. No additional reads or collection are used.
- Notifications remain in `/notifications/{notificationId}` and the header's per-user listener. Status-change notifications now include `updateId`, linking them to `/reports/{reportId}/updates/{updateId}`. Mark-all-read writes are batched in groups of at most 450 documents. Firestore rules allow a self-owned submission receipt or an administrator notification tied to a real matching update, and limit reads and read-state changes to the notification owner.
- Community statistics are derived in the browser from the current live report list. Area grouping uses only the first segment of the existing location text; weekly and 30-day comparisons use report `createdAt`. Gemini receives bounded aggregate counts, not report descriptions, names, IDs, coordinates, or raw report documents. The insights endpoint requires a cryptographically verified Firebase ID token and admin authorization, caches identical aggregate requests for 30 minutes, and returns no generated text when Gemini is unavailable or there are fewer than five reports.
- AI report triage is started by an administrator from the Report Management tab, either for one report or for all reports matching the current filters. The signed-in administrator's Firebase ID token is verified by the Render API. Gemini suggests urgency, a category, and the remaining ordered status steps; the dashboard sorts by urgency and lets the administrator apply a category. Statuses are never advanced automatically, and the final Resolved step requires human verification through the existing status update action. Identical triage requests are cached for 15 minutes. The rules accept the complete category list already used by the app.

## Deployment notes

- Deploy the updated `firestore.rules` to the existing Firebase project's named Firestore database before relying on new notification writes. Existing documents and collection names are unchanged.
- The existing Render service needs `FIREBASE_PROJECT_ID=boxwood-badge-39pl1` and `FIREBASE_DATABASE_ID=ai-studio-fixmyrak-8970734b-ae12-4b60-947f-c731f1bfb7cd`; these non-secret identifiers are included in `render.yaml`. `GEMINI_API_KEY` remains a Render-only secret and must already be configured.
- The AI insights panel is in the existing Admin Dashboard's Analytics & Trends tab. At least five reports are required before the app requests an AI interpretation.
- AI report triage is in Admin Dashboard → Report Management. It uses the existing Render Gemini service and needs no additional environment variables. Publish the updated `firestore.rules` file to the existing named Firestore database before using “Apply category”.
