# Migration from Supabase to Neon

This guide will help you migrate your MOCA (Museum of Contemporary Art) application from Supabase to Neon PostgreSQL.

## Prerequisites

1. A Neon account and database
2. Node.js and npm installed
3. Your application code

## Step 1: Set up Neon Database

1. Create a new project in Neon
2. Note your connection string (it should look like: `postgresql://user:password@host/dbname`)

## Step 2: Run Database Schema

Execute the SQL commands in `database-schema.sql` in your Neon database:

```bash
# You can run this via Neon's web interface or psql
psql "your-neon-connection-string" -f database-schema.sql
```

## Step 3: Update Environment Variables

### Backend (.env)
Update your backend `.env` file with your Neon connection string:

```
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
```

### Vercel Environment Variables (for webhooks)
If you're using Vercel for serverless functions, update these environment variables:

```
DATABASE_URL=postgresql://user:password@host/dbname
```

## Step 4: Install Dependencies

The backend already has the required `pg` dependency. The frontend no longer needs `@supabase/supabase-js`.

## Step 5: Migrate Data (Optional)

If you have existing data in Supabase, you can export it and import it into Neon:

1. Export data from Supabase tables
2. Transform the data to match the new schema
3. Import into Neon using INSERT statements or pg_dump

## Step 6: Test the Migration

1. Start your backend server:
   ```bash
   cd my-app-backend
   npm install
   npm start
   ```

2. Start your frontend:
   ```bash
   npm install
   npm run dev
   ```

3. Test CRUD operations for:
   - Exhibitions
   - Artworks
   - Collectables
   - Bookings
   - Shop orders
   - Gallery images
   - Press releases

## Step 7: Update Webhooks

The Cashfree webhook has been updated to use direct PostgreSQL queries instead of Supabase. Make sure your Vercel deployment has the correct `DATABASE_URL`.

## Key Changes Made

1. **Database Schema**: Created PostgreSQL-compatible schema
2. **API Endpoints**: Added REST API endpoints in `/routes/data.js`
3. **Frontend Service**: Updated `services/data.ts` to use API calls instead of Supabase
4. **Webhook**: Updated `api/cashfree-webhook.ts` to use direct database queries
5. **Dependencies**: Removed `@supabase/supabase-js` from frontend

## Troubleshooting

- **Connection Issues**: Verify your `DATABASE_URL` is correct
- **CORS Issues**: Make sure your backend allows requests from your frontend origin
- **Authentication**: The user authentication still uses JWT but now stores data in PostgreSQL
- **Data Sync**: The app uses localStorage as a cache with API sync

## Rollback (if needed)

To rollback to Supabase:

1. Reinstall `@supabase/supabase-js`
2. Restore the original `services/data.ts`
3. Update environment variables back to Supabase
4. Remove the new API routes

The migration maintains backward compatibility with localStorage fallbacks.