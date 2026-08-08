-- The big/little family feature was removed from the product (2026-08).
-- Drop the relationships table and any dependent policies/triggers with it.
DROP TABLE IF EXISTS public.family_relationships CASCADE;
