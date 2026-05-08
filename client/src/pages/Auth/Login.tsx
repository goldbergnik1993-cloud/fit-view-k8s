import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../../shared/components/Header/Header';
import { PrimaryButton } from '../../shared/components/ui/PrimaryButton/PrimaryButton';
import { TextInput } from '../../shared/components/ui/TextInput/TextInput';
import { PasswordInput } from '../../shared/components/ui/PasswordInput/PasswordInput';
import { OtpInput } from '../../shared/components/ui/OtpInput/OtpInput';
import ArrowLeftIcon from '../../assets/icons/arrow-left.svg';
import CheckboxUncheckedIcon from '../../assets/icons/checkbox-unchecked.svg';
import CheckboxCheckedIcon from '../../assets/icons/checkbox-checked.svg';
import styles from './Login.module.scss';
import GoogleIcon from '../../assets/icons/google.svg';
import XIcon from '../../assets/icons/x.svg';
import AppleIcon from '../../assets/icons/apple.svg';
import { Footer } from '../../shared/components/Footer/Footer';
import { authApi } from '../../services/api';
import HintErrorIcon from '../../assets/icons/hint-error.svg';
import HintSuccessIcon from '../../assets/icons/hint-success.svg';

type Tab = 'signup' | 'signin';
type SignupStep = 1 | 2 | 3;

const RESEND_TIMEOUT = 60;

export const Login = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [tab, setTab] = useState<Tab>('signup');

  // Sign Up fields
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [step, setStep] = useState<SignupStep>(1);

  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Sign In validation
  const [signInEmailError, setSignInEmailError] = useState<string | null>(null);
  const [signInEmailSuccess, setSignInEmailSuccess] = useState(false);
  const [signInPasswordError, setSignInPasswordError] = useState<string | null>(
    null
  );
  const [signInPasswordSuccess, setSignInPasswordSuccess] = useState(false);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);

  // ─── Validation state ─────────────────────────────────────────────────────────
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [firstNameSuccess, setFirstNameSuccess] = useState(false);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [lastNameSuccess, setLastNameSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [confirmPasswordSuccess, setConfirmPasswordSuccess] = useState(false);

  const [otpError, setOtpError] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  // ─── Validators ───────────────────────────────────────────────────────────────
  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('Email is required');
      setEmailSuccess(false);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError('Invalid email');
      setEmailSuccess(false);
    } else {
      setEmailError(null);
      setEmailSuccess(true);
    }
  };

  const validateFirstName = (val: string) => {
    if (!val.trim()) {
      setFirstNameError('First name is required');
      setFirstNameSuccess(false);
    } else {
      setFirstNameError(null);
      setFirstNameSuccess(true);
    }
  };

  const validateLastName = (val: string) => {
    if (!val.trim()) {
      setLastNameError('Last name is required');
      setLastNameSuccess(false);
    } else {
      setLastNameError(null);
      setLastNameSuccess(true);
    }
  };

  const validatePhone = (val: string) => {
    if (!val.trim()) {
      setPhoneError('Phone is required');
      setPhoneSuccess(false);
    } else if (!/^\+?[\d\s-]{7,}$/.test(val)) {
      setPhoneError('Invalid phone number');
      setPhoneSuccess(false);
    } else {
      setPhoneError(null);
      setPhoneSuccess(true);
    }
  };

  const validatePassword = (val: string) => {
    if (val.length < 8 || !/[A-Z]/.test(val) || !/\d/.test(val)) {
      setPasswordError('Please enter a stronger password');
      setPasswordSuccess(false);
    } else {
      setPasswordError(null);
      setPasswordSuccess(true);
    }
  };

  const validateConfirmPassword = (val: string) => {
    if (!val) {
      setConfirmPasswordError('Please confirm password');
      setConfirmPasswordSuccess(false);
    } else if (val !== password) {
      setConfirmPasswordError('Please make sure your passwords match');
      setConfirmPasswordSuccess(false);
    } else {
      setConfirmPasswordError(null);
      setConfirmPasswordSuccess(true);
    }
  };

  const validateSignInEmail = (val: string) => {
    if (!val) {
      setSignInEmailError('Email is required');
      setSignInEmailSuccess(false);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setSignInEmailError('Invalid email');
      setSignInEmailSuccess(false);
    } else {
      setSignInEmailError(null);
      setSignInEmailSuccess(true);
    }
  };

  const validateSignInPassword = (val: string) => {
    if (!val) {
      setSignInPasswordError('Password is required');
      setSignInPasswordSuccess(false);
    } else {
      setSignInPasswordError(null);
      setSignInPasswordSuccess(true);
    }
  };

  // Countdown timer for OTP
  useEffect(() => {
    if (step !== 3) return;
    setCountdown(RESEND_TIMEOUT);
    setCanResend(false);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleSignupStep1 = () => {
    validateEmail(email);
    validateFirstName(firstName);
    validateLastName(lastName);
    validatePhone(phone);

    const isEmailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isFirstNameOk = firstName.trim().length > 0;
    const isLastNameOk = lastName.trim().length > 0;
    const isPhoneOk = /^\+?[\d\s-]{7,}$/.test(phone);

    if (isEmailOk && isFirstNameOk && isLastNameOk && isPhoneOk) {
      setError(null);
      setStep(2);
    }
  };

  const handleSignupStep2 = async () => {
    validatePassword(password);
    validateConfirmPassword(confirmPassword);

    const isPasswordOk =
      password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
    const isConfirmOk =
      confirmPassword === password && confirmPassword.length > 0;

    if (!isPasswordOk || !isConfirmOk) return;

    setLoading(true);
    try {
      await signup(
        email,
        password,
        firstName,
        lastName,
        phone,
        birthday || undefined
      );
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setCountdown(RESEND_TIMEOUT);
    setCanResend(false);
    setOtp(['', '', '', '']);
    setOtpError(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpConfirm = async () => {
    const code = otp.join('');
    if (code.length < 4) {
      setOtpError(true);
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyEmail({ email, code });
      setOtpError(false);
      setOtpSuccess(true);
      navigate('/profile');
    } catch (err: unknown) {
      setOtpError(true);
      setOtpSuccess(false);
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    validateSignInEmail(signInEmail);
    validateSignInPassword(signInPassword);

    if (
      !signInEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInEmail) ||
      !signInPassword
    )
      return;

    setError(null);
    setLoading(true);
    try {
      await login(signInEmail, signInPassword);
      navigate('/profile');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError(null);
    setStep(1);
  };

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.card}>
          {/* ── Sign Up Step 1 ── */}
          {tab === 'signup' && step === 1 && (
            <>
              <div className={styles.card__heading}>
                <h1 className={styles.card__title}>Let's Get Started!</h1>
                <p className={styles.card__subtitle}>
                  Create your account at seconds on FitView
                </p>
              </div>

              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${styles['tab--active']}`}
                  onClick={() => switchTab('signup')}
                >
                  Sign Up
                </button>
                <button
                  className={styles.tab}
                  onClick={() => switchTab('signin')}
                >
                  Sign In
                </button>
              </div>

              <div className={styles.card__fields}>
                <TextInput
                  label="Email *"
                  type="email"
                  placeholder="mailbox@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailSuccess || emailError)
                      validateEmail(e.target.value);
                  }}
                  onBlur={() => validateEmail(email)}
                  error={emailError ?? undefined}
                  success={emailSuccess}
                />
                <TextInput
                  label="First Name *"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (firstNameSuccess || firstNameError)
                      validateFirstName(e.target.value);
                  }}
                  onBlur={() => validateFirstName(firstName)}
                  error={firstNameError ?? undefined}
                  success={firstNameSuccess}
                />
                <TextInput
                  label="Last Name *"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (lastNameSuccess || lastNameError)
                      validateLastName(e.target.value);
                  }}
                  onBlur={() => validateLastName(lastName)}
                  error={lastNameError ?? undefined}
                  success={lastNameSuccess}
                />
                <TextInput
                  label="Phone Number *"
                  type="tel"
                  placeholder="453 338 494"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneSuccess || phoneError)
                      validatePhone(e.target.value);
                  }}
                  onBlur={() => validatePhone(phone)}
                  error={phoneError ?? undefined}
                  success={phoneSuccess}
                />
                <TextInput
                  label="Birthday"
                  placeholder="01-01-2000"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <PrimaryButton
                onClick={handleSignupStep1}
                disabled={!email || !firstName || !lastName || !phone}
              >
                Next
              </PrimaryButton>

              <div className={styles.dots}>
                <span className={`${styles.dot} ${styles['dot--active']}`} />
                <span className={styles.dot} />
              </div>

              <div className={styles.divider}>
                <span>Or</span>
              </div>
              <p className={styles.social__label}>
                Get Started with social media
              </p>
              <div className={styles.social}>
                <button
                  className={styles.social__btn}
                  aria-label="Continue with Google"
                >
                  <img
                    src={GoogleIcon}
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden="true"
                  />
                </button>
                <button
                  className={styles.social__btn}
                  aria-label="Continue with X"
                >
                  <img
                    src={XIcon}
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden="true"
                  />
                </button>
                <button className={styles.social__btn} aria-label="Apple">
                  <img
                    src={AppleIcon}
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </>
          )}

          {/* ── Sign Up Step 2 ── */}
          {tab === 'signup' && step === 2 && (
            <div className={styles['card-wrapper']}>
              <button
                className={styles.back}
                onClick={() => {
                  setStep(1);
                  setError(null);
                }}
                aria-label="Back"
              >
                <img
                  src={ArrowLeftIcon}
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              </button>

              <div className={`${styles.card} ${styles['card--inner']}`}>
                <div className={styles.card__heading}>
                  <h1 className={styles.card__title}>Create Password</h1>
                  <ul className={styles.rules}>
                    <li>Minimum 8 characters</li>
                    <li>At least one upper case letter</li>
                    <li>At least one number</li>
                  </ul>
                </div>

                <div className={styles.card__fields}>
                  <PasswordInput
                    label="Password *"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordSuccess || passwordError)
                        validatePassword(e.target.value);
                    }}
                    onBlur={() => validatePassword(password)}
                    error={passwordError ?? undefined}
                    success={passwordSuccess}
                    successText="Strong password"
                  />
                  <PasswordInput
                    label="Confirm Password *"
                    placeholder="••••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordSuccess || confirmPasswordError)
                        validateConfirmPassword(e.target.value);
                    }}
                    onBlur={() => validateConfirmPassword(confirmPassword)}
                    error={confirmPasswordError ?? undefined}
                    success={confirmPasswordSuccess}
                    successText="Passwords successfully matched"
                  />
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <PrimaryButton
                  onClick={handleSignupStep2}
                  loading={loading}
                  disabled={!password || !confirmPassword}
                >
                  Get Started
                </PrimaryButton>

                <div className={styles.dots}>
                  <span className={styles.dot} />
                  <span className={`${styles.dot} ${styles['dot--active']}`} />
                </div>
              </div>
            </div>
          )}

          {/* ── Sign Up Step 3 — Confirm Email ── */}
          {tab === 'signup' && step === 3 && (
            <div className={styles['card-wrapper']}>
              <button
                className={styles.back}
                onClick={() => {
                  setStep(2);
                  setError(null);
                }}
                aria-label="Back"
              >
                <img
                  src={ArrowLeftIcon}
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              </button>

              <div className={`${styles.card} ${styles['card--inner']}`}>
                <div className={styles.card__heading}>
                  <h1 className={styles.card__title}>Confirm your email</h1>
                  <p className={styles.card__subtitle}>
                    We sent code to {email}
                  </p>
                </div>

                <div className={styles.otp__group}>
                  <p className={styles.otp__label}>
                    Enter code from your email
                  </p>
                  <OtpInput
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      setOtpError(false);
                      setOtpSuccess(val.every((v) => v !== ''));
                    }}
                    error={otpError}
                    success={otpSuccess}
                  />
                  {otpError && (
                    <p
                      className={`${styles.otp__hints} ${styles['otp__hints--error']}`}
                    >
                      <img
                        src={HintErrorIcon}
                        alt=""
                        width={16}
                        height={16}
                        aria-hidden="true"
                      />
                      Incorrect code.{' '}
                      <button
                        className={styles.resend__btn}
                        onClick={handleResend}
                      >
                        Try again
                      </button>
                    </p>
                  )}
                  {otpSuccess && (
                    <p
                      className={`${styles.otp__hints} ${styles['otp__hints--success']}`}
                    >
                      <img
                        src={HintSuccessIcon}
                        alt=""
                        width={16}
                        height={16}
                        aria-hidden="true"
                      />
                      Code verified successfully
                    </p>
                  )}
                  <p className={styles.resend}>
                    {canResend ? (
                      <>
                        Don't receive the code?{' '}
                        <button
                          className={styles.resend__btn}
                          onClick={handleResend}
                        >
                          Try send again
                        </button>
                      </>
                    ) : (
                      <>Resend code in {String(countdown).padStart(2, '0')} s</>
                    )}
                  </p>
                </div>

                <PrimaryButton
                  onClick={handleOtpConfirm}
                  disabled={otp.some((v) => !v)}
                >
                  Continue
                </PrimaryButton>

                <PrimaryButton
                  onClick={handleOtpConfirm}
                  disabled={otp.some((v) => !v)}
                >
                  Continue
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* ── Sign In ── */}
          {tab === 'signin' && (
            <>
              <div className={styles.card__heading}>
                <h1 className={styles.card__title}>Welcome back!</h1>
                <p className={styles.card__subtitle}>
                  Sign in to pick up where you left off
                </p>
              </div>

              <div className={styles.tabs}>
                <button
                  className={styles.tab}
                  onClick={() => switchTab('signup')}
                >
                  Sign Up
                </button>
                <button
                  className={`${styles.tab} ${styles['tab--active']}`}
                  onClick={() => switchTab('signin')}
                >
                  Sign In
                </button>
              </div>

              <div className={styles.card__fields}>
                <TextInput
                  label="Enter your email"
                  type="email"
                  placeholder="mailbox@gmail.com"
                  value={signInEmail}
                  onChange={(e) => {
                    setSignInEmail(e.target.value);
                    if (signInEmailSuccess || signInEmailError)
                      validateSignInEmail(e.target.value);
                  }}
                  onBlur={() => validateSignInEmail(signInEmail)}
                  error={signInEmailError ?? undefined}
                  success={signInEmailSuccess}
                />
                <PasswordInput
                  label="Enter your password"
                  placeholder="••••••••••"
                  value={signInPassword}
                  onChange={(e) => {
                    setSignInPassword(e.target.value);
                    if (signInPasswordSuccess || signInPasswordError)
                      validateSignInPassword(e.target.value);
                  }}
                  onBlur={() => validateSignInPassword(signInPassword)}
                  error={signInPasswordError ?? undefined}
                  success={signInPasswordSuccess}
                />
              </div>

              <div className={styles.signin__row}>
                <label className={styles.remember}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={styles.remember__input}
                  />
                  <img
                    src={
                      rememberMe ? CheckboxCheckedIcon : CheckboxUncheckedIcon
                    }
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden="true"
                  />
                  Remember me
                </label>
                <button className={styles.forgot}>Forgot your password?</button>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <PrimaryButton
                onClick={handleSignIn}
                loading={loading}
                disabled={!signInEmail || !signInPassword}
              >
                Continue
              </PrimaryButton>

              <div className={styles.divider}>
                <span>Or</span>
              </div>
              <p className={styles.social__label}>Continue with social media</p>
              <div className={styles.social}>
                <button className={styles.social__btn} aria-label="Google">
                  <img
                    src={GoogleIcon}
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden="true"
                  />
                </button>
                <button className={styles.social__btn} aria-label="X">
                  <img
                    src={XIcon}
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden="true"
                  />
                </button>
                <button className={styles.social__btn} aria-label="Apple">
                  <img
                    src={AppleIcon}
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
};

export default Login;
