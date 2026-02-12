import { useEffect, useState } from "react";
import { Results, TextArea, Toolbar, Title, Profile, Button, Window, Input, RightSidebar } from "./components";
import LoadingScreen from "./components/ui/LoadingScreen";
import { addUser, login, signInWithProvider } from "./services/supabaseData";
import supabase from "./services/supabase/supabase-client";
import { getLocalItem, setLocalItem } from "./storage/localStorage";
import { isValidEmail } from "./utils/tools";
import { useGameStore } from "./state";
import { UpdateText } from "./utils";

// Login Window Component with improved UI
const LoginWindow = ({
  authMode,
  setAuthMode,
  handleSignUp,
  handleSignupBtn,
  handleLoginBtn,
  handleOAuthLogin,
  signUpEmail,
  authMessage,
}: {
  authMode: "login" | "signup";
  setAuthMode: (mode: "login" | "signup") => void;
  handleSignUp: (type: "Username" | "Email" | "Password", value: string) => void;
  handleSignupBtn: () => void;
  handleLoginBtn: () => void;
  handleOAuthLogin: (provider: "google" | "discord") => void;
  signUpEmail: string;
  authMessage: string;
}) => (
  <div className="w-full h-full flex flex-col lg:flex-row gap-6 p-6 lg:p-8">
    {/* Left Panel - Info Section */}
    <div className="lg:w-5/12 w-full flex flex-col gap-6 bg-gradient-to-br from-game-bg-light to-game-bg border-2 border-card-border rounded-xl p-6 lg:p-8 shadow-xl">
      {/* Header with animated dots */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent-warning shadow-glow-yellow animate-pulse" />
          <div className="h-2 w-2 rounded-full bg-accent-primary shadow-glow-purple animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 rounded-full bg-accent-success shadow-glow-green animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <div className="text-xs font-display uppercase tracking-[0.35em] text-text-secondary opacity-70">
          Portal
        </div>
      </div>

      {/* Welcome Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 bg-accent-primary rounded-full shadow-glow-purple" />
        </div>
        <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-widest bg-gradient-to-r from-accent-primary to-accent-primary/60 bg-clip-text text-transparent">
          WELCOME
        </h1>
        <p className="text-text-secondary font-display text-sm leading-relaxed">
          Join the community to track your progress, compete with friends, and unlock exclusive features.
        </p>
      </div>

      {/* Features List */}
      <div className="flex flex-col gap-3 mt-2">
        {[
          { label: "Sync Progress", status: "Cloud Backup" },
          { label: "Daily Streaks", status: "Never Lose" },
          { label: "Custom Themes", status: "Unlock All" },
          { label: "Leaderboards", status: "Compete" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-3 rounded-lg bg-card-bg/30 border border-card-border/50 backdrop-blur-sm transition-all duration-300 hover:border-accent-primary/50 hover:shadow-glow-purple/20"
          >
            <div className="flex-1">
              <div className="text-sm font-display font-semibold text-text-primary">{item.label}</div>
              <div className="text-xs text-text-secondary">{item.status}</div>
            </div>
            <div className="h-2 w-2 rounded-full bg-accent-success shadow-glow-green" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-card-border/30">
        <div className="text-xs font-display uppercase tracking-[0.3em] text-text-secondary/70">
          Typing Game • 2026
        </div>
      </div>
    </div>

    {/* Right Panel - Auth Form */}
    <div className="lg:w-7/12 w-full flex flex-col gap-5">
      {/* Mode Toggle */}
      <div className="flex items-center gap-3 p-1 bg-game-bg-light border-2 border-card-border rounded-xl">
        {(["login", "signup"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setAuthMode(mode)}
            className={`flex-1 px-6 py-2.5 rounded-lg font-display font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
              authMode === mode
                ? "bg-gradient-to-r from-accent-primary to-accent-primary/80 text-white shadow-glow-purple scale-105"
                : "text-text-secondary hover:text-text-primary hover:bg-card-bg/50"
            }`}
          >
            {mode === "login" ? "Sign In" : "Register"}
          </button>
        ))}
      </div>

      {/* Form Section */}
      <div className="flex flex-col gap-4 p-6 bg-game-bg-light/50 border-2 border-card-border rounded-xl backdrop-blur-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-display font-bold text-text-primary">
            {authMode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-sm text-text-secondary">
            {authMode === "login" 
              ? "Enter your credentials to continue" 
              : "Fill in your details to get started"}
          </p>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col gap-3">
          {authMode === "signup" && (
            <div className="animate-fade-in">
              <Input
                onChange={(value) => handleSignUp("Username", value)}
                label="Username"
                placeholder="Choose a unique username..."
                type="text"
                className="w-full"
              />
            </div>
          )}
          <Input
            onChange={(value) => handleSignUp("Email", value)}
            label="Email Address"
            placeholder="your.email@example.com"
            type="email"
            className="w-full"
          />
          <Input
            onChange={(value) => handleSignUp("Password", value)}
            label="Password"
            placeholder="Enter a secure password..."
            type="password"
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <Button
          disabled={!isValidEmail(signUpEmail)}
          onClickFunction={authMode === "signup" ? handleSignupBtn : handleLoginBtn}
          text={authMode === "signup" ? "Create Account" : "Sign In"}
          className="w-full h-11 text-sm font-bold"
        />

        {/* Auth Message */}
        {authMessage && (
          <div className="p-3 rounded-lg bg-accent-warning/10 border border-accent-warning/30">
            <div className="text-xs font-display text-accent-warning">{authMessage}</div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-card-border to-transparent" />
        <span className="text-xs font-display uppercase tracking-wider text-text-secondary">Or continue with</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-card-border to-transparent" />
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleOAuthLogin("google")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 font-display font-semibold text-sm rounded-lg border-2 border-gray-200 transition-all duration-200 hover:border-accent-primary hover:shadow-glow-purple active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
        <button
          onClick={() => handleOAuthLogin("discord")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5865F2] text-white font-display font-semibold text-sm rounded-lg border-2 border-[#5865F2] transition-all duration-200 hover:bg-[#4752C4] hover:shadow-glow-purple active:scale-95"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Discord
        </button>
      </div>

      {/* Footer Text */}
      <div className="text-center text-xs text-text-secondary">
        {authMode === "login" ? (
          <span>Don't have an account? <button onClick={() => setAuthMode("signup")} className="text-accent-primary hover:underline font-semibold">Sign up here</button></span>
        ) : (
          <span>Already have an account? <button onClick={() => setAuthMode("login")} className="text-accent-primary hover:underline font-semibold">Sign in here</button></span>
        )}
      </div>
    </div>
  </div>
);

function App() {
  const [textHover, setTextHover] = useState(false);
  const [loginWindowOpen, setLoginWindowOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authMessage, setAuthMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const { showResults, setShowResults, bumpTextVersion, loadingStats } = useGameStore();

  useEffect(() => {
    UpdateText();
    bumpTextVersion();
    
    if (!getLocalItem("logged in")) {
      setLocalItem("logged in", "false");
    }

    const theme = getLocalItem("theme") || "theme-earthy-earth";
    const applyThemeClass = (el: HTMLElement) => {
      Array.from(el.classList)
        .filter((cls) => cls.startsWith("theme-"))
        .forEach((cls) => el.classList.remove(cls));
      el.classList.add(theme);
    };
    applyThemeClass(document.documentElement);
  }, [bumpTextVersion]);

  useEffect(() => {
    let alive = true;

    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!alive) return;
      
      if (error) {
        // TODO: surface auth session error to the user or telemetry.
      }
      
      const isAuthed = !!data.session;
      setIsAuthenticated(isAuthed);
      setLocalItem("logged in", isAuthed ? "true" : "false");
      setAuthLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      const isAuthed = !!session;
      setIsAuthenticated(isAuthed);
      setLocalItem("logged in", isAuthed ? "true" : "false");
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = (type: "Username" | "Email" | "Password", value: string) => {
    if (type === "Username") setSignUpUsername(value);
    if (type === "Email") setSignUpEmail(value);
    if (type === "Password") setSignUpPassword(value);
  };

  const handleSignupBtn = async () => {
    setAuthMode("signup");
    if (isAuthenticated) return;

    const result = await addUser(signUpUsername, signUpEmail, signUpPassword);
    if (result?.status === "verify") {
      setAuthMessage(result.message ?? "Bitte Email bestätigen.");
    } else if (result?.status === "error") {
      setAuthMessage(result.message ?? "Error, please try again.");
    } else {
      setAuthMessage("");
      setLoginWindowOpen(false);
    }
  };

  const handleLoginBtn = async () => {
    const result = await login(signUpEmail, signUpPassword);
    setAuthMode("login");
    
    if (result?.status === "verify") {
      setAuthMessage(result.message ?? "Bitte Email bestätigen.");
    } else if (result?.status === "error") {
      setAuthMessage(result.message ?? "Error, please try again.");
    } else {
      setAuthMessage("");
      setLoginWindowOpen(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "discord") => {
    await signInWithProvider(provider);
  };

  const themeClass = getLocalItem("theme") || "theme-earthy-earth";

  return (
    <div className={themeClass}>
      <div className="w-screen h-screen bg-game-bg overflow-hidden">
        <div className="w-full h-full flex flex-wrap items-center justify-center">
          <div id="portal-root" className={themeClass} />
          
          {showResults ? (
            <div className="w-full h-full flex flex-row">
              <div className="absolute w-fit h-fit flex items-start p-5 z-10">
                <Button onClickFunction={() => setShowResults(false)} text="⟳" />
              </div>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-4/5 h-4/5">
                  {loadingStats ? <LoadingScreen text="Loading results..." /> : <Results />}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-1/5 h-full flex-0">
                {!isAuthenticated ? (
                  <div className="relative z-50 p-5">
                    <Button
                      onClickFunction={() => setLoginWindowOpen(!loginWindowOpen)}
                      text={authLoading ? "Checking..." : "Login"}
                      className="shadow-lg hover:shadow-glow-purple"
                    />
                  </div>
                ) : (
                  <Profile />
                )}
              </div>

              {loginWindowOpen && (
                <Window
                  value={
                    <LoginWindow
                      authMode={authMode}
                      setAuthMode={setAuthMode}
                      handleSignUp={handleSignUp}
                      handleSignupBtn={handleSignupBtn}
                      handleLoginBtn={handleLoginBtn}
                      handleOAuthLogin={handleOAuthLogin}
                      signUpEmail={signUpEmail}
                      authMessage={authMessage}
                    />
                  }
                  width="min(1100px, 95vw)"
                  height="min(700px, 92vh)"
                  className="bg-transparent border-none"
                />
              )}

              <div className="w-1/5 h-full flex flex-col gap-3 justify-center items-center flex-1">
                <Toolbar />
                <TextArea />
                <div
                  className="w-[98%] flex flex-row items-center justify-start"
                  onMouseEnter={() => setTextHover(true)}
                  onMouseLeave={() => setTextHover(false)}
                >
                  <Title glow={textHover} />
                </div>
              </div>

              <div className="w-1/5 h-full flex-2">
                <RightSidebar />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
