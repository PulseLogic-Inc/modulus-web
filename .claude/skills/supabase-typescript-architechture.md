# Skill: Supabase & TypeScript Architecture System
This skill governs data layer security, multi-tenant sandboxing, Next.js dynamic routing, and strict TypeScript types.

## 🏗️ Multi-Tenant Database Architecture
*   **Tenant Isolation**: Every database table (except global configurations) must possess a `tenant_id` or `company_id` UUID column referencing a primary `tenants` table.
*   **Row-Level Security (RLS)**: Every single table must explicitly activate Row-Level Security. Never generate raw tables without an RLS policy blueprint attached.
*   **Standard RLS Blueprint**:
    ```sql
    ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow authenticated tenant access" ON table_name
      AS RESTRICTIVE USING (tenant_id = (auth.jwt() ->> 'user_metadata')::jsonb ->> 'tenant_id');
    ```

## ⌨️ Strict TypeScript Configurations
*   **No Implicit Any**: Prohibit the use of `any`. If a structural type is dynamic or unknown, enforce `unknown` or utilize strict generics.
*   **Database Type Synchronization**: Rely strictly on the code-generated structures exported via the Supabase CLI (`Database` definitions). Cast Supabase client calls safely:
    ```typescript
    import { createClient } from '@supabase/supabase-js'
    import { Database } from '@/types/supabase'
    const supabase = createClient<Database>(URL, KEY)
    ```

## 🌐 Next.js App Router Data Optimization
*   **Server Component Fetching**: Fetch core reporting and analytical datasets within React Server Components (RSC) to minimize Client Component load footprint.
*   **Real-time Synchronization**: Use Supabase real-time channel handlers inside React `useEffect` structures only for live-updating components (e.g., active POS sales monitor or rapid inventory shifts).
*   **Optimistic UI Buffering**: When processing inventory additions or status changes via client requests, update state optimistically before processing network calls to deliver instantaneous responsive interfaces.