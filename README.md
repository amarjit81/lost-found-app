# Campus Reclaim

Campus Reclaim is a full-stack MERN lost-and-found portal for college communities. Students can report lost or found belongings, search the campus feed, receive likely-match notifications, contact the other poster, and close a report after the item is returned.

## Why this is a MERN project

- **MongoDB + Mongoose** persist users, item reports, and match notifications.
- **Express.js + Node.js** provide authenticated REST APIs and the matching workflow.
- **React + Vite** power the responsive, route-based student interface.
- **JWT + bcrypt** provide application-owned registration and login.

The earlier Firebase implementation has been replaced. Firebase Auth, Firestore, Hosting, Cloud Functions, and CDN-loaded JavaScript are no longer used.

## Features

- Campus-domain account registration and JWT authentication
- Lost and found reports with category, date, location, contact, description, and optional image URL
- Search and filtering by report type and category
- Server-side matching based on category, location, and descriptive keywords
- In-app notifications for strong potential matches
- Ownership and admin authorization for updating or deleting reports
- Frontend controls for editing, resolving, reopening, and deleting owned reports
- Open, resolved, and reopened report lifecycle
- Responsive desktop and mobile interface
- Seed data and unit tests for matching/client utilities

## Project structure

```text
client/                 React + Vite application
  src/
    App.jsx             Routes and product UI
    api.js              REST client and token handling
    styles.css          Responsive design system
server/                 Express + MongoDB API
  src/
    models/             Mongoose schemas
    routes/             Auth, item, and notification endpoints
    middleware/         Authentication and error handling
    utils/matching.js   Lost/found scoring logic
```

## Run locally

Prerequisites: Node.js 20+ and MongoDB 7+.

1. Install dependencies:

   ```bash
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

2. Copy `.env.example` to `.env` and replace `JWT_SECRET` with a long random value.

3. Start MongoDB locally, then optionally add demo content:

   ```bash
   npm run seed --prefix server
   ```

4. Start the React app and API together:

   ```bash
   npm run dev
   ```

The portal runs at `http://localhost:5173`; the API runs at `http://localhost:5000`.

For a single production deployment, run `npm run build` and set `NODE_ENV=production`. The Express server will serve `client/dist` and route browser navigation back to the React entry point.

After seeding, use `amarjit@thapar.edu` / `Campus@123` for the demo admin account. Change or remove seeded credentials before any public deployment.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a campus account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/auth/me` | Restore the signed-in user |
| GET | `/api/items` | Search and filter reports |
| POST | `/api/items` | Publish a report and find matches |
| PATCH | `/api/items/:id` | Edit or resolve an owned report |
| DELETE | `/api/items/:id` | Remove an owned report |
| GET | `/api/notifications` | Read the user's match alerts |

All item and notification endpoints require `Authorization: Bearer <token>`.

## Checks

```bash
npm test
npm run build
```

## Production notes

- Use a managed MongoDB database and a unique production `JWT_SECRET`.
- Set `CLIENT_URL` to the deployed frontend origin.
- Set `ALLOWED_EMAIL_DOMAIN` to the institution's domain, or leave it empty to allow any valid email.
- Serve the built `client/dist` directory from a frontend host and deploy `server` as a Node service.
