import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEffect, useReducer } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Auth from '@/pages/common/Auth';

/**
 * Regression coverage for the "Forgot Password?" flow.
 *
 * verifyOtp({ type: 'email' }) mints a real session and @supabase/auth-js
 * broadcasts SIGNED_IN for it (PASSWORD_RECOVERY is only emitted for
 * type: 'recovery'). AuthContext subscribes to onAuthStateChange, so `user`
 * goes non-null part-way through a password reset. The redirect effect in
 * Auth.tsx used to fire on that and bounce the member to /dashboard with their
 * password never changed - turning "Forgot Password?" into a passwordless
 * login. Auth.tsx now early-returns from that effect while
 * `isResettingPassword || showCodeInput`.
 *
 * Everything below runs against mocks; the real Supabase client module is never
 * loaded, so no request leaves the test process.
 */

const mockSignIn = vi.fn();
const mockToast = vi.fn();
const mockNavigate = vi.fn();
const mockSignInWithOtp = vi.fn();
const mockVerifyOtp = vi.fn();
const mockUpdateUser = vi.fn();

type FakeUser = { id: string; email: string } | null;

const RESET_EMAIL = 'member@school.edu';
const SESSION_USER: FakeUser = { id: 'user-1', email: RESET_EMAIL };

let currentUser: FakeUser = null;
const authSubscribers = new Set<() => void>();

/**
 * Stand-in for AuthContext's onAuthStateChange handler reacting to the
 * SIGNED_IN that auth-js emits once verifyOtp returns a session.
 */
function emitSignedIn(user: FakeUser) {
  currentUser = user;
  authSubscribers.forEach((notify) => notify());
}

vi.mock('@/contexts/AuthContext', () => ({
  // Same shape Auth.tsx consumes, but `user` is live: it starts null and flips
  // when a session arrives, re-rendering subscribers the way the real provider
  // does.
  useAuth: () => {
    const [, forceRender] = useReducer((n: number) => n + 1, 0);
    useEffect(() => {
      authSubscribers.add(forceRender);
      return () => {
        authSubscribers.delete(forceRender);
      };
    }, []);
    return { user: currentUser, signIn: mockSignIn, loading: false };
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOtp: (...args: unknown[]) => mockSignInWithOtp(...args),
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    },
    from: () => ({}),
  },
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

// Keep MemoryRouter/Routes real so the page renders normally, but make the
// navigate() the page calls observable.
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderAuth(initialEntry = '/auth#login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </MemoryRouter>
  );
}

/** Paths the page asked react-router to navigate to, in order. */
const navigatedPaths = () => mockNavigate.mock.calls.map((call) => call[0]);

/** Drives the login form through "Forgot Password?" -> "Send Code" -> code entry. */
async function reachCodeEntry(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/University Email/i), RESET_EMAIL);
  await user.click(screen.getByRole('button', { name: /Forgot Password/i }));
  // Mocked signInWithOtp - nothing is sent.
  await user.click(screen.getByRole('button', { name: 'Send Code' }));

  await waitFor(() => {
    expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
  });
  expect(mockSignInWithOtp).toHaveBeenCalledWith(
    expect.objectContaining({ email: RESET_EMAIL })
  );

  await user.type(screen.getByLabelText(/Verification Code/i), '123456');
}

/** Asserts the member is parked on the new-password form, not on the dashboard. */
async function expectStrandedOnNewPasswordForm() {
  await waitFor(() => {
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
  });
  expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();

  expect(navigatedPaths()).not.toContain('/dashboard');
  expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard', expect.anything());
}

describe('Forgot Password: the verifyOtp session must not short-circuit the reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = null;
    sessionStorage.clear();
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });
    mockVerifyOtp.mockResolvedValue({
      data: { user: SESSION_USER, session: { access_token: 'token' } },
      error: null,
    });
    mockUpdateUser.mockResolvedValue({ data: { user: SESSION_USER }, error: null });
  });

  it('renders the new-password form and does not redirect to /dashboard when the code is verified', async () => {
    const user = userEvent.setup();
    renderAuth();

    await reachCodeEntry(user);

    // Faithful to production: the session (and therefore SIGNED_IN) lands from
    // inside verifyOtp, while showCodeInput is still true.
    mockVerifyOtp.mockImplementation(async () => {
      emitSignedIn(SESSION_USER);
      return { data: { user: SESSION_USER, session: { access_token: 'token' } }, error: null };
    });

    await user.click(screen.getByRole('button', { name: 'Verify Code' }));

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith(
        expect.objectContaining({ email: RESET_EMAIL, token: '123456', type: 'email' })
      );
    });

    await expectStrandedOnNewPasswordForm();
  });

  it('stays on the new-password form when SIGNED_IN arrives after the form is showing', async () => {
    const user = userEvent.setup();
    renderAuth();

    await reachCodeEntry(user);
    await user.click(screen.getByRole('button', { name: 'Verify Code' }));

    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });

    // AuthContext's listener can also land a tick later; the guard has to hold.
    await act(async () => {
      emitSignedIn(SESSION_USER);
    });

    await expectStrandedOnNewPasswordForm();
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
});

describe('Forgot Password: the reset code input', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = null;
    sessionStorage.clear();
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null });
    mockVerifyOtp.mockResolvedValue({
      data: { user: SESSION_USER, session: { access_token: 'token' } },
      error: null,
    });
  });

  it('reveals the Send Code prompt only after "Forgot Password?" is clicked', async () => {
    const user = userEvent.setup();
    renderAuth();

    expect(screen.queryByRole('button', { name: 'Send Code' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Forgot Password/i }));

    expect(screen.getByRole('button', { name: 'Send Code' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  // GoTrue is configured for otp_length = 6 (supabase/config.toml); the input used
  // to accept 8, which silently let members submit a code the API would reject.
  it('accepts exactly 6 digits and drops non-digits and overflow', async () => {
    const user = userEvent.setup();
    renderAuth();

    await reachCodeEntry(user); // already types '123456'

    const codeInput = screen.getByLabelText(/Verification Code/i) as HTMLInputElement;
    expect(codeInput).toHaveAttribute('maxLength', '6');
    expect(codeInput.value).toBe('123456');

    await user.clear(codeInput);
    await user.type(codeInput, '12ab34cd5678');
    expect(codeInput.value).toBe('123456');
  });

  it('refuses to call verifyOtp when the code is shorter than 6 digits', async () => {
    const user = userEvent.setup();
    renderAuth();

    await user.type(screen.getByLabelText(/University Email/i), RESET_EMAIL);
    await user.click(screen.getByRole('button', { name: /Forgot Password/i }));
    await user.click(screen.getByRole('button', { name: 'Send Code' }));
    await waitFor(() => {
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Verification Code/i), '12345');
    await user.click(screen.getByRole('button', { name: 'Verify Code' }));

    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Invalid Code', variant: 'destructive' })
    );
  });
});
