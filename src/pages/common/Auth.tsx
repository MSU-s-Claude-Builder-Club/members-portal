import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { isValidEduEmail } from '@/lib/validation';

/**
 * GoTrue reports SMTP/transport failures as opaque 500s and its own throttling as
 * 429s. Both mean "the account is fine, the email did not go out" — which needs a
 * very different message from a bad password.
 */
const isEmailDeliveryError = (message: string) => {
  const m = message.toLowerCase();
  return (
    m.includes('error sending confirmation email') ||
    m.includes('error sending email') ||
    m.includes('email rate limit exceeded') ||
    m.includes('over_email_send_rate_limit') ||
    m.includes('smtp')
  );
};

const Auth = () => {
  const location = useLocation();
  const hash = location.hash?.toLowerCase() || '';
  const [isLogin, setIsLogin] = useState(hash === '#signup' ? false : true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showSignupVerification, setShowSignupVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showLoginEmailVerification, setShowLoginEmailVerification] = useState(false);
  const [loginVerificationEmail, setLoginVerificationEmail] = useState('');
  const [loginVerificationCode, setLoginVerificationCode] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  // Check for password reset token on mount
  useEffect(() => {
    const checkForResetToken = async () => {
      const hash = window.location.hash;

      if (!hash) return;

      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      const error = hashParams.get('error');
      const errorCode = hashParams.get('error_code');
      const errorDescription = hashParams.get('error_description');

      console.log('Auth page loaded with hash params:', {
        hasAccessToken: !!accessToken,
        type,
        error,
        errorCode,
        fullHash: hash.substring(0, 50) + '...' // Log first 50 chars for debugging
      });

      // Handle password reset errors
      if (error) {
        if (errorCode === 'otp_expired') {
          toast({
            title: 'Link Expired or Invalid',
            description: 'The password reset link has expired or already been used. Please request a new one.',
            variant: 'destructive',
          });
          setShowForgotPassword(true);
          setIsLogin(true);
          // Clear the error from URL
          navigate('/auth#login', { replace: true });
          return;
        } else if (error === 'access_denied') {
          toast({
            title: 'Access Denied',
            description: errorDescription || 'Unable to verify the reset link. Please request a new password reset.',
            variant: 'destructive',
          });
          setShowForgotPassword(true);
          setIsLogin(true);
          // Clear the error from URL
          navigate('/auth#login', { replace: true });
          return;
        }
      }

      if (accessToken && type === 'recovery') {
        console.log('Password recovery flow detected');
        setIsResettingPassword(true);
        setIsLogin(true);
        setShowForgotPassword(false);
      } else if (type === 'signup' || hash.includes('confirmation')) {
        console.log('Email confirmation flow detected');
        // Let Supabase handle the email confirmation
        // The user will be automatically logged in if successful
      }
    };

    checkForResetToken();
  }, [toast, navigate]);

  // Sync tab with URL hash (#signup → signup, #login or default → login)
  useEffect(() => {
    const hashParams = new URLSearchParams(hash.substring(1));
    const type = hashParams.get('type');

    // Don't interfere with password reset flow
    if (type === 'recovery') {
      return;
    }

    if (hash === '#signup') {
      setIsLogin(false);
      setIsResettingPassword(false);
    } else if (hash === '#login' || hash === '' || hash.includes('access_token')) {
      setIsLogin(true);
    }
  }, [hash]);

  // Redirect logged-in users (only after auth finishes loading)
  useEffect(() => {
    if (authLoading) return; // Wait for auth to initialize

    if (user) {
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      // Navigate to stored redirect or default to dashboard
      // ProtectedRoute will handle profile completion and redirect clearing
      navigate(redirectUrl || '/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const validateEmail = (email: string) => {
    if (!isValidEduEmail(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please use your .edu email address.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address to reset your password.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);
    try {
      // Send OTP code via email (won't be consumed by email scanners)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create new users during password reset
        },
      });

      if (error) throw error;

      // Store email for verification step
      setResetEmail(email);
      setShowCodeInput(true);
      setShowForgotPassword(false);

      toast({
        title: 'Verification Code Sent',
        description: 'Check your email for a verification code. The code expires in 1 hour.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignup = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: 'Code Required',
        description: 'Please enter the verification code from your email.',
        variant: 'destructive',
      });
      return;
    }

    if (verificationCode.length < 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the complete verification code.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Verify the signup OTP
      const { error } = await supabase.auth.verifyOtp({
        email: signupEmail,
        token: verificationCode,
        type: 'signup',
      });

      if (error) throw error;

      toast({
        title: 'Email Verified!',
        description: 'Your account has been verified. Logging you in...',
      });

      // verifyOtp already returned a session, so the user is authenticated at
      // this point; AuthContext's onAuthStateChange listener picks it up. The
      // explicit signIn is only to populate the profile eagerly, so a failure
      // here must not be reported as a failed verification.
      try {
        await signIn(signupEmail, signupPassword);
      } catch (signInError) {
        console.warn('Post-verification signIn failed; relying on the verified session', signInError);
      }

      // Clear verification state
      setShowSignupVerification(false);
      setVerificationCode('');
      setSignupEmail('');
      setSignupPassword('');

      // Navigation will be handled by the useEffect that watches for user state
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      if (errorMessage.includes('expired') || errorMessage.includes('Token has expired')) {
        toast({
          title: 'Code Expired',
          description: 'The verification code has expired. Please request a new one.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('invalid') || errorMessage.includes('not found')) {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect. Please check and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const emailToUse = signupEmail || email;

    if (!emailToUse.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;

      // If we're in the login verification flow, show the code input
      if (showResendVerification && isLogin) {
        setLoginVerificationEmail(emailToUse);
        setShowLoginEmailVerification(true);
        setShowResendVerification(false);
      }

      toast({
        title: 'Verification Code Sent',
        description: 'A new verification code has been sent to your email.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginEmail = async () => {
    if (!loginVerificationCode.trim()) {
      toast({
        title: 'Code Required',
        description: 'Please enter the verification code from your email.',
        variant: 'destructive',
      });
      return;
    }

    if (loginVerificationCode.length < 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the complete verification code.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Verify the signup OTP for email confirmation
      const { error } = await supabase.auth.verifyOtp({
        email: loginVerificationEmail,
        token: loginVerificationCode,
        type: 'signup',
      });

      if (error) throw error;

      toast({
        title: 'Email Verified!',
        description: 'Your email has been verified. Logging you in...',
      });

      // Log the user in with their original credentials
      await signIn(loginVerificationEmail, password);

      // Clear verification state
      setShowLoginEmailVerification(false);
      setLoginVerificationCode('');
      setLoginVerificationEmail('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      if (errorMessage.includes('expired') || errorMessage.includes('Token has expired')) {
        toast({
          title: 'Code Expired',
          description: 'The verification code has expired. Please request a new one.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('invalid') || errorMessage.includes('not found')) {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect. Please check and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resetCode.trim()) {
      toast({
        title: 'Code Required',
        description: 'Please enter the verification code from your email.',
        variant: 'destructive',
      });
      return;
    }

    if (resetCode.length < 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the complete verification code.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Verify the OTP code - this will log the user in
      const { error } = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: resetCode,
        type: 'email',
      });

      if (error) throw error;

      // Code verified and user is now logged in
      // Show password reset form immediately
      toast({
        title: 'Code Verified',
        description: 'You are now logged in. Please set a new password to secure your account.',
      });

      setShowCodeInput(false);
      setIsResettingPassword(true);
      setResetCode('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      // Check for specific error types
      if (errorMessage.includes('expired') || errorMessage.includes('Token has expired')) {
        toast({
          title: 'Code Expired',
          description: 'The verification code has expired. Please request a new one.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('invalid') || errorMessage.includes('not found')) {
        toast({
          title: 'Invalid Code',
          description: 'The verification code is incorrect. Please check and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please enter and confirm your new password.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please ensure both passwords match.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been updated. You can now log in.',
      });

      // Clear the form and reset state
      setNewPassword('');
      setConfirmPassword('');
      setIsResettingPassword(false);
      setResetEmail('');

      // Clear URL hash
      navigate('/auth#login', { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!email.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please enter your password',
        variant: 'destructive',
      });
      return;
    }

    if (!isLogin && !fullName.trim()) {
      toast({
        title: 'Required Field Missing',
        description: 'Please enter your full name',
        variant: 'destructive',
      });
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Use signIn from AuthContext
        await signIn(email, password);

        toast({
          title: 'Success',
          description: 'Logged in successfully!',
        });

        // Navigate - don't clear redirectAfterLogin here, let ProtectedRoute handle it
        // The useEffect above will handle the navigation when user state updates
      } else {
        // Check if email belongs to a banned user before signup
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('is_banned')
          .eq('email', email)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (existingProfile?.is_banned) {
          toast({
            title: 'Account Banned',
            description: 'This email address is associated with a banned account. Please contact the admin for more information.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // Sign up with OTP verification. emailRedirectTo controls where the
        // link in the confirmation email sends people back to — without it
        // GoTrue falls back to the project's Site URL, which is how confirmation
        // links end up pointing at localhost instead of the live site.
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (!authData.user) {
          throw new Error('User creation failed');
        }

        // With email-enumeration protection on, signing up with an address that
        // already exists returns a decoy user with no identities rather than an
        // error. Treat that as "you already have an account" instead of sending
        // them to a code screen for a code that will never arrive.
        if ((authData.user.identities?.length ?? 0) === 0 && !authData.session) {
          setIsLogin(true);
          navigate('/auth#login', { replace: true });
          toast({
            title: 'Account already exists',
            description: 'That email is already registered. Try logging in, or use "Forgot Password?" if you need to reset it.',
          });
          return;
        }

        // If email confirmation is disabled, signUp returns a live session and
        // the account is already active — skip the code step and log straight in.
        if (authData.session) {
          toast({
            title: 'Account created',
            description: 'Welcome! Finishing setting up your account…',
          });
          await signIn(email, password);
          return;
        }

        // Otherwise a verification code was emailed — collect it next.
        setSignupEmail(email);
        setSignupPassword(password);
        setShowSignupVerification(true);

        toast({
          title: 'Check your email',
          description: 'We sent a 6-digit verification code. Enter it below to finish creating your account.',
        });
      }
    } catch (error: unknown) {
      // Handle specific errors
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

      if (errorMessage?.includes('banned')) {
        setBanError('Your account has been banned. Please contact the admin for more information.');
        toast({
          title: 'Account Banned',
          description: 'Your account has been banned. Please contact the admin for more information.',
          variant: 'destructive',
        });
      } else if (errorMessage?.toLowerCase().includes('email not confirmed') ||
        errorMessage?.toLowerCase().includes('email link is invalid') ||
        errorMessage?.toLowerCase().includes('confirm your email')) {
        setShowResendVerification(true);
        setLoginVerificationEmail(email);
        toast({
          title: 'Email Not Verified',
          description: 'Please verify your email address. Click "Resend Verification Email" below.',
          variant: 'destructive',
        });
      } else if (errorMessage?.toLowerCase().includes('invalid login credentials') ||
        errorMessage?.toLowerCase().includes('invalid email or password')) {
        toast({
          title: 'Invalid Credentials',
          description: 'The email or password you entered is incorrect.',
          variant: 'destructive',
        });
      } else if (isEmailDeliveryError(errorMessage)) {
        // Mail transport failed. GoTrue rolls the signup back in this case, so
        // don't claim an account exists and don't advance to the code screen -
        // there is nothing to resend against. Keep them on the form to retry.
        toast({
          title: "Couldn't send the verification email",
          description: 'Our email service is temporarily unavailable, so we could not send your code. Please wait a minute and try again — if it keeps failing, contact RSO.claudemsu@msu.edu.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Chrome title for the panel's titlebar strip (rendered uppercase via CSS)
  const chromeTitle = showSignupVerification || showLoginEmailVerification
    ? 'Verify email'
    : showCodeInput
      ? 'Verify code'
      : isResettingPassword
        ? 'Reset password'
        : isLogin
          ? 'Authenticate'
          : 'Create account';

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-page ${isMobile ? 'px-4 py-8' : 'px-4'}`}>
      {/* Oversized mono watermark — texture through type, not images */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 hidden md:flex items-center justify-center overflow-hidden"
      >
        <span className="-rotate-12 whitespace-nowrap font-mono text-[14rem] lg:text-[18rem] font-extrabold uppercase leading-none tracking-[-0.04em] text-foreground/[0.04]">
          CBC — MSU
        </span>
      </div>

      <Card className={`relative z-10 w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} rounded-none border border-border bg-page shadow-[8px_8px_0_0_hsl(var(--foreground))]`}>
        {/* Titlebar strip — window chrome for the engineering document */}
        <div className="hatch flex h-[38px] items-center gap-1.5 border-b border-border px-4">
          <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-grey-3" />
          <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-grey-3" />
          <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-grey-3" />
          <span className="ml-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {chromeTitle}
          </span>
        </div>
        <CardHeader className={isMobile ? 'pb-4' : ''}>
          <CardTitle className={isMobile ? 'text-xl' : ''}>
            {showSignupVerification
              ? 'Verify Your Email'
              : showLoginEmailVerification
                ? 'Verify Your Email'
                : showCodeInput
                  ? 'Verify Code'
                  : isResettingPassword
                    ? 'Reset Password'
                    : isLogin
                      ? 'Login'
                      : 'Sign Up'}
          </CardTitle>
          <CardDescription className={isMobile ? 'text-sm' : ''}>
            {showSignupVerification
              ? 'Enter the verification code from your email'
              : showLoginEmailVerification
                ? 'Enter the verification code from your email'
                : showCodeInput
                  ? 'Check your email for the verification code'
                  : isResettingPassword
                    ? 'Enter your new password'
                    : isLogin
                      ? 'Welcome back to Claude Builder Club'
                      : 'Join Claude Builder Club @ MSU'}
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? 'pt-0' : ''}>
          {banError && (
            <Alert variant="red" className="mb-4">
              <AlertDescription className="text-sm">
                {banError}
              </AlertDescription>
            </Alert>
          )}

          {showSignupVerification ? (
            <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              <Alert className="rounded-none border-border">
                <AlertDescription className="text-sm">
                  A verification code has been sent to <strong>{signupEmail}</strong>. Enter it below to verify your account.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="verificationCode" required>Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  maxLength={8}
                  placeholder="Enter code from email"
                  className="text-center font-mono text-2xl tracking-widest tabular-nums"
                />
              </div>

              <Button
                onClick={handleVerifySignup}
                className={`w-full ${isMobile ? 'h-11' : ''}`}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className={`w-full ${isMobile ? 'h-11' : ''}`}
                onClick={handleResendVerification}
                disabled={loading}
              >
                Resend Code
              </Button>

              <Button
                type="button"
                variant="ghost"
                className={`w-full hover:bg-transparent hover:text-primary transition-colors duration-200 motion-reduce:transition-none ${isMobile ? 'h-11 text-sm' : ''}`}
                onClick={() => {
                  setShowSignupVerification(false);
                  setVerificationCode('');
                  setSignupEmail('');
                  setSignupPassword('');
                  setIsLogin(false);
                }}
              >
                Back to Sign Up
              </Button>
            </div>
          ) : showLoginEmailVerification ? (
            <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              <Alert className="rounded-none border-border">
                <AlertDescription className="text-sm">
                  A verification code has been sent to <strong>{loginVerificationEmail}</strong>. Enter it below to verify your email and complete login.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="loginVerificationCode" required>Verification Code</Label>
                <Input
                  id="loginVerificationCode"
                  type="text"
                  value={loginVerificationCode}
                  onChange={(e) => setLoginVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  maxLength={8}
                  placeholder="Enter code from email"
                  className="text-center font-mono text-2xl tracking-widest tabular-nums"
                />
              </div>

              <Button
                onClick={handleVerifyLoginEmail}
                className={`w-full ${isMobile ? 'h-11' : ''}`}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className={`w-full ${isMobile ? 'h-11' : ''}`}
                onClick={handleResendVerification}
                disabled={loading}
              >
                Resend Code
              </Button>

              <Button
                type="button"
                variant="ghost"
                className={`w-full hover:bg-transparent hover:text-primary transition-colors duration-200 motion-reduce:transition-none ${isMobile ? 'h-11 text-sm' : ''}`}
                onClick={() => {
                  setShowLoginEmailVerification(false);
                  setLoginVerificationCode('');
                  setLoginVerificationEmail('');
                  setShowResendVerification(false);
                  setEmail('');
                  setPassword('');
                  navigate('/auth#login', { replace: true });
                }}
              >
                Back to Login
              </Button>
            </div>
          ) : showCodeInput ? (
            <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              <Alert className="rounded-none border-border">
                <AlertDescription className="text-sm">
                  A verification code has been sent to <strong>{resetEmail}</strong>. Enter it below to reset your password.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="resetCode" required>Verification Code</Label>
                <Input
                  id="resetCode"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  maxLength={8}
                  placeholder="Enter code from email"
                  className="text-center font-mono text-2xl tracking-widest tabular-nums"
                />
              </div>

              <Button
                onClick={handleVerifyCode}
                className={`w-full ${isMobile ? 'h-11' : ''}`}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className={`w-full ${isMobile ? 'h-11' : ''}`}
                onClick={() => {
                  setShowForgotPassword(true);
                  setShowCodeInput(false);
                  setResetCode('');
                }}
                disabled={loading}
              >
                Resend Code
              </Button>

              <Button
                type="button"
                variant="ghost"
                className={`w-full hover:bg-transparent hover:text-primary transition-colors duration-200 motion-reduce:transition-none ${isMobile ? 'h-11 text-sm' : ''}`}
                onClick={() => {
                  setShowCodeInput(false);
                  setResetCode('');
                  setResetEmail('');
                  navigate('/auth#login', { replace: true });
                }}
              >
                Back to Login
              </Button>
            </div>
          ) : isResettingPassword ? (
            <form onSubmit={handlePasswordReset} className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              <div className="space-y-2">
                <Label htmlFor="newPassword" required>New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" required>Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  placeholder="Confirm new password"
                />
              </div>

              <Button type="submit" className={`w-full ${isMobile ? 'h-11' : ''}`} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className={`w-full hover:bg-transparent hover:text-primary transition-colors duration-200 motion-reduce:transition-none ${isMobile ? 'h-11 text-sm' : ''}`}
                onClick={() => {
                  setIsResettingPassword(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setResetEmail('');
                  navigate('/auth#login', { replace: true });
                }}
              >
                Back to Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" required>Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tom Izzo"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" required>University Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setBanError(null); // Clear ban error when user types
                  }}
                  placeholder="tom@msu.edu"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setBanError(null); // Clear ban error when user types
                  }}
                  minLength={6}
                  placeholder="Enter your password"
                  className="order-2"
                />
                <div className="flex order-1 items-center justify-between">
                  <Label htmlFor="password" required>Password</Label>
                  {isLogin && (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot Password?
                    </Button>
                  )}
                </div>
              </div>

              <Button type="submit" className={`w-full ${isMobile ? 'h-11' : ''}`} disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
              </Button>

              {showResendVerification && isLogin && (
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full ${isMobile ? 'h-11' : ''}`}
                  onClick={handleResendVerification}
                  disabled={loading}
                >
                  Resend Verification Email
                </Button>
              )}

              {showForgotPassword && isLogin && (
                <Alert className="rounded-none border-border">
                  <AlertDescription>
                    <p className="text-sm mb-3">
                      Enter your email address and we'll send you a verification code to reset your password.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleForgotPassword}
                        disabled={loading}
                      >
                        Send Code
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowForgotPassword(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="button"
                variant="ghost"
                className={`w-full hover:bg-transparent hover:text-primary transition-colors duration-200 motion-reduce:transition-none ${isMobile ? 'h-11 text-sm' : ''}`}
                onClick={() => {
                  const nextLogin = !isLogin;
                  setIsLogin(nextLogin);
                  setBanError(null);
                  setShowForgotPassword(false);
                  setShowResendVerification(false);
                  navigate(nextLogin ? '/auth#login' : '/auth#signup', { replace: true });
                }}
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;