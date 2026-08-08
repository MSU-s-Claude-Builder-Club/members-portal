-- ============================================================================
-- HARDEN user_roles: gate role mutation to board/e-board, and restrict granting
-- of privileged roles ('board', 'e-board') to e-board ONLY.
-- ============================================================================
--
-- BACKGROUND
-- The prior policies (from 20260212030942_consolidating_functions.sql) were:
--     UPDATE ... USING (true)      -- "Authenticated users can update roles"
--     DELETE ... USING (true)      -- "Authenticated users can delete roles"
-- i.e. ANY authenticated user could change ANY user's role via a direct
-- Supabase API call; only the frontend hid the control. That is a
-- privilege-escalation hole (a member/prospect could self-promote to e-board).
--
-- Those permissive policies existed because putting a role check *inline* in a
-- user_roles policy risked recursive policy evaluation. We avoid that here the
-- same proven way ban_user_by_id() already does: a SECURITY DEFINER helper that
-- reads user_roles with the definer's privileges (RLS not re-applied), so there
-- is no recursion.
--
-- INTENDED MODEL (mirrors the existing UI):
--   * Change Role (member <-> board <-> e-board): e-board only.
--   * Graduate (prospect -> member): board OR e-board (Prospects.tsx handleGraduate
--     is a direct client UPDATE, and the Prospects page is board+).
--   * Kick / ban: run via SECURITY DEFINER RPCs (delete_profile, ban_user_by_id),
--     which bypass RLS and are unaffected.
--   * Auto-upgrade prospect -> member on application acceptance runs inside the
--     SECURITY DEFINER trigger handle_application_acceptance(), also unaffected.
-- ============================================================================

-- Applied atomically: a failure must not leave user_roles with the old
-- permissive policy dropped and no replacement (which would break all role
-- management). BEGIN/COMMIT rolls the whole change back on any error.
BEGIN;

-- ---------------------------------------------------------------------------
-- Recursion-safe role predicates (SECURITY DEFINER; same pattern as ban_user_by_id)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_eboard(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'e-board'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_board_or_eboard(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('board', 'e-board')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_eboard(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_board_or_eboard(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- UPDATE policy: board/e-board may edit role rows; only e-board may set a row to
-- 'board' or 'e-board'. Board is limited to the non-privileged roles it already
-- uses in the app (graduation -> 'member').
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Board can update user roles" ON public.user_roles;

CREATE POLICY "Role writes gated; only e-board grants board/e-board"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING ( public.is_board_or_eboard() )
  WITH CHECK (
    public.is_eboard()
    OR (public.is_board_or_eboard() AND role IN ('member', 'prospect'))
  );

-- ---------------------------------------------------------------------------
-- DELETE policy: restrict to board/e-board (previously USING(true)). No client
-- flow deletes user_roles directly; kick/ban use SECURITY DEFINER RPCs and FK
-- cascade, all of which bypass RLS.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Board can delete user roles" ON public.user_roles;

CREATE POLICY "Board or e-board can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING ( public.is_board_or_eboard() );

-- ---------------------------------------------------------------------------
-- INSERT is intentionally left unchanged: the existing self-insert policy
-- (auth.uid() = user_id) plus UNIQUE(user_id) plus the SECURITY DEFINER
-- handle_new_user() trigger already prevent self-inserting a second, privileged
-- role row. (Every user receives exactly one 'prospect' row at signup.)
-- ============================================================================

COMMIT;
