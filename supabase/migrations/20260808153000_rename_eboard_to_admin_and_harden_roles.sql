-- ============================================================================
-- Rename app_role value 'e-board' -> 'admin', and harden user_roles so that only
-- admins may grant privileged roles. Applied atomically.
-- ============================================================================
--
-- WHY IT IS SAFE
--   * ALTER TYPE ... RENAME VALUE keeps the same internal enum id, so existing
--     rows, column defaults (e.g. events.allowed_roles), CHECK constraints, and
--     RLS policy expressions (stored as parsed Const nodes) follow the rename
--     automatically -- no policy edits needed.
--   * The ONLY objects that re-cast the 'e-board' text literal at runtime are
--     PL/pgSQL function bodies. Exactly three live, app-invoked functions do so
--     (ban_user_by_id, delete_profile, delete_event); they are recreated below,
--     verbatim except 'e-board' -> 'admin'. (delete_user_by_id was already
--     dropped; the family-tree and team-sync functions are no longer invoked.)
--
-- HARDENING (was: UPDATE/DELETE USING(true) -> any authenticated user could
-- change anyone's role via the API). New model mirrors the UI:
--   * admin: may set any role (incl. granting admin).
--   * board: may write non-privileged roles only (prospect->member graduation).
--   * everyone else: no role writes.
-- Recursion-safe SECURITY DEFINER predicates avoid the RLS recursion that
-- previously forced USING(true) (same pattern as ban_user_by_id).
-- ============================================================================

BEGIN;

-- 1) Rename the enum label.
ALTER TYPE public.app_role RENAME VALUE 'e-board' TO 'admin';

-- 2) Recreate the three app-invoked SECURITY DEFINER functions (literal swapped).

CREATE OR REPLACE FUNCTION public.ban_user_by_id(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calling_user_role app_role;
BEGIN
  SELECT role INTO calling_user_role FROM user_roles WHERE user_id = auth.uid();

  IF calling_user_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admin members can ban users');
  END IF;

  IF target_user_id = auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot ban your own account');
  END IF;

  UPDATE profiles SET is_banned = true, updated_at = now() WHERE id = target_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'User banned successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_profile(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  board_role_exists BOOLEAN;
  user_avatar_url TEXT;
  user_resume_url TEXT;
  avatar_path TEXT;
  resume_path TEXT;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF current_user_id = target_user_id THEN
    NULL; -- self can always delete
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = current_user_id AND ur.role IN ('board', 'admin')
    ) INTO board_role_exists;

    IF NOT board_role_exists THEN
      RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
    END IF;
  END IF;

  SELECT profile_picture_url, resume_url INTO user_avatar_url, user_resume_url
  FROM profiles WHERE id = target_user_id;

  IF user_avatar_url IS NOT NULL AND user_avatar_url != '' THEN
    BEGIN
      avatar_path := regexp_replace(user_avatar_url, '^.*/avatars/', '');
      IF avatar_path IS NOT NULL AND avatar_path != '' THEN
        DELETE FROM storage.objects WHERE bucket_id = 'avatars' AND name = avatar_path;
        RAISE NOTICE 'Deleted avatar: %', avatar_path;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to delete avatar for user %: %', target_user_id, SQLERRM;
    END;
  END IF;

  IF user_resume_url IS NOT NULL AND user_resume_url != '' THEN
    BEGIN
      resume_path := regexp_replace(user_resume_url, '^.*/resumes/', '');
      IF resume_path IS NOT NULL AND resume_path != '' THEN
        DELETE FROM storage.objects WHERE bucket_id = 'resumes' AND name = resume_path;
        RAISE NOTICE 'Deleted resume: %', resume_path;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to delete resume for user %: %', target_user_id, SQLERRM;
    END;
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Account and all related data deleted successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_event(target_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  board_role_exists BOOLEAN;
  qr_code_record RECORD;
  qr_code_path TEXT;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = current_user_id AND ur.role IN ('board', 'admin')
  ) INTO board_role_exists;

  IF NOT board_role_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
  END IF;

  FOR qr_code_record IN
    SELECT qr_code_url FROM event_qr_codes
    WHERE event_id = target_event_id AND qr_code_url IS NOT NULL
  LOOP
    BEGIN
      qr_code_path := substring(qr_code_record.qr_code_url from 'qr-codes/[^?]+');
      IF qr_code_path IS NOT NULL AND qr_code_path != '' THEN
        DELETE FROM storage.objects WHERE bucket_id = 'events' AND name = qr_code_path;
        RAISE NOTICE 'Deleted QR code: %', qr_code_path;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to delete QR code for event %: %', target_event_id, SQLERRM;
    END;
  END LOOP;

  DELETE FROM events WHERE id = target_event_id;

  RETURN jsonb_build_object('success', true, 'message', 'Event and all related data deleted successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 3) Recursion-safe role predicates (SECURITY DEFINER -> read user_roles without
--    re-triggering RLS; same proven pattern as ban_user_by_id).
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_board_or_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('board', 'admin'));
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_board_or_admin(uuid) TO authenticated;

-- 4) Hardened role-mutation policies (replace the permissive USING(true) ones).
DROP POLICY IF EXISTS "Authenticated users can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Board can update user roles" ON public.user_roles;
CREATE POLICY "Role writes gated; only admin grants board/admin"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING ( public.is_board_or_admin() )
  WITH CHECK (
    public.is_admin()
    OR (public.is_board_or_admin() AND role IN ('member', 'prospect'))
  );

DROP POLICY IF EXISTS "Authenticated users can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Board can delete user roles" ON public.user_roles;
CREATE POLICY "Board or admin can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING ( public.is_board_or_admin() );

COMMIT;
