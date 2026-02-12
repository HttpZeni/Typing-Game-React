import { useEffect, useState } from "react";
import { Results, TextArea, Toolbar, Title, Profile, Button, Window, Input } from "./components";
import LoadingScreen from "./components/ui/LoadingScreen";
import { addUser, login } from "./services/supabaseData";
import supabase from "./services/supabase/supabase-client";
import { getLocalItem, setLocalItem } from "./storage/localStorage";
import { isValidEmail } from "./utils/tools";
import { useGameStore } from "./state";

import { UpdateText } from "./utils";

function App() {
  const [textHover, setTextHover] = useState<boolean>(false);
  const [loginWindowOpen, setLoginWindowOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authMessage, setAuthMessage] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [signUpUsername, setSignUpUsername] = useState<string>("");
  const [signUpEmail, setSignUpEmail] = useState<string>("");
  const [signUpPassword, setSignUpPassword] = useState<string>("");

  const {
    showResults,
    setShowResults,
    bumpTextVersion,
    loadingStats,
  } = useGameStore();

  useEffect(() => {
    UpdateText();
    bumpTextVersion();
    if (!getLocalItem("logged in")){
      setLocalItem("logged in", "false");
    }
    const theme = getLocalItem("theme") || "theme-earthy-earth";
    const applyThemeClass = (el: HTMLElement) => {
      for (const cls of Array.from(el.classList)) {
        if (cls.startsWith("theme-")) el.classList.remove(cls);
      }
      el.classList.add(theme);
    };
    applyThemeClass(document.documentElement);
  }, [bumpTextVersion]);

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) {
        console.log("Auth session error: ", error);
      }
      const isAuthed = !!data.session;
      setIsAuthenticated(isAuthed);
      setLocalItem("logged in", isAuthed ? "true" : "false");
      setAuthLoading(false);
    });

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

  const handleClick = () => {
    setShowResults(!showResults)
  }

  const handleLoginOrSignUpBtn = () => {
    setLoginWindowOpen(!loginWindowOpen);
  }

  const handleSignUp = (type: "Username" | "Email" | "Password", value: string) => {
    if (type === "Username") setSignUpUsername(value);
    if (type === "Email") setSignUpEmail(value);
    if (type === "Password") setSignUpPassword(value);
  }

  const handleSignupBtn = async () => {
    setAuthMode("signup")
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
  }

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
  }

  const loginWidnow = (
    <div className="w-full h-full flex flex-col md:flex-row gap-6 p-6 md:p-8 bg-card-bg border-2 border-card-border rounded-xl shadow-card">
      <div className="md:w-5/12 w-full flex flex-col gap-5 bg-game-bg-light border-2 border-card-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent-warning shadow-glow-yellow" />
            <div className="h-2 w-2 rounded-full bg-accent-primary shadow-glow-purple" />
            <div className="h-2 w-2 rounded-full bg-accent-success shadow-glow-green" />
          </div>
          <div className="text-xs font-display uppercase tracking-[0.35em] text-text-secondary">
            Access
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-widest text-accent-primary">
            WELCOME
          </h1>
          <p className="text-text-secondary font-display text-sm leading-relaxed">
            Log in to sync stats, save streaks and unlock custom themes.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm font-display text-text-primary">
          <div className="flex items-center justify-between border-b border-card-border/70 pb-2">
            <span>Sync progress</span>
            <span className="text-accent-primary">Ready</span>
          </div>
          <div className="flex items-center justify-between border-b border-card-border/70 pb-2">
            <span>Keep streaks</span>
            <span className="text-accent-primary">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Secure session</span>
            <span className="text-accent-primary">Enabled</span>
          </div>
        </div>

        <div className="mt-auto text-xs font-display uppercase tracking-[0.3em] text-text-secondary">
          Typing Game
        </div>
      </div>

      <div className="md:w-7/12 w-full flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAuthMode("login")}
            className={`px-4 py-2 rounded-lg border-2 font-display font-semibold transition-all duration-200 ${
              authMode === "login"
                ? "border-accent-primary text-accent-primary shadow-glow-purple bg-game-bg-light"
                : "border-card-border text-text-primary bg-card-bg opacity-80 hover:border-accent-primary hover:text-accent-primary hover:shadow-glow-purple hover:bg-game-bg-light"
            }`}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded-lg border-2 font-display font-semibold transition-all duration-200 ${
              authMode === "signup"
                ? "border-accent-primary text-accent-primary shadow-glow-purple bg-game-bg-light"
                : "border-card-border text-text-primary bg-card-bg opacity-80 hover:border-accent-primary hover:text-accent-primary hover:shadow-glow-purple hover:bg-game-bg-light"
            }`}
            onClick={() => setAuthMode("signup")}
          >
            Sign up
          </button>
        </div>

        <div className="h-px w-full bg-card-border/70" />

        <div className="w-full flex flex-col gap-4">
          {authMode === "signup" ? (
            <Input onChange={(value) => handleSignUp("Username", value)} label="Username" placeholder="Enter your username.." type="text" className="w-full" />
          ) : null}
          <Input onChange={(value) => handleSignUp("Email", value)} label="Email" placeholder="Enter your email.." type="email" className="w-full" />
          <Input onChange={(value) => handleSignUp("Password", value)} label="Password" placeholder="Enter your password.." type="password" className="w-full" />
        </div>

        <div className="h-px w-full bg-card-border/70" />

        <div className="flex items-center justify-between">
          <div className="text-xs font-display uppercase tracking-[0.2em] text-text-secondary">
            {authMode === "login" ? "No account? Sign up" : "Already have an account?"}
          </div>
          <div className="flex items-center gap-3">
            {authMode === "signup" ? (
              <Button disabled={!isValidEmail(signUpEmail)} onClickFunction={handleSignupBtn} text="Create Account" />
            ) : (
              <Button disabled={!isValidEmail(signUpEmail)} onClickFunction={handleLoginBtn} text="Login" />
            )}
          </div>
        </div>
        {authMessage ? (
          <div className="text-xs font-display text-accent-warning">{authMessage}</div>
        ) : null}
      </div>
    </div>
  )

  const themeClass = getLocalItem("theme") || "theme-earthy-earth";

  return (
    <div className={`${themeClass}`}>
      <div className="w-screen h-screen bg-game-bg overflow-hidden">
        <div className="w-full h-full flex flex-wrap items-center justify-center">
          <div id="portal-root" className={`${themeClass}`} />
          {showResults ? 
            <div className="w-full h-full flex flex-row">
              <div className="absolute w-fit h-fit flex items-start p-5">
                <Button onClickFunction={handleClick} text={"⟳"}/>
              </div>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-4/5 h-4/5">
                  {loadingStats ? (
                    <LoadingScreen text="Loading results..." />
                  ) : (
                    <Results />
                  )}
                </div>
              </div>
            </div>
            :
            <>
              <div className=" w-1/5 h-full flex-0">
                {!isAuthenticated ? (
                  <div className="relative z-50 p-5">
                    <Button
                      onClickFunction={handleLoginOrSignUpBtn}
                      text={authLoading ? "Checking session..." : "Login / Sign up"}
                    />
                  </div>
                ) : (
                  <Profile/>
                )}
              </div>
              {loginWindowOpen ? (
                <Window
                  value={loginWidnow}
                  width={"min(980px, 92vw)"}
                  height={"min(640px, 90vh)"}
                  className="bg-transparent border-none"
                />
              ) : null}
              <div className="w-1/5 h-full flex flex-col gap-3 justify-center items-center flex-1">
                <Toolbar />
                <TextArea />
                <div className={`w-[98%] flex flex-row items-center justify-start`} onMouseEnter={() => setTextHover(true)} onMouseLeave={() => setTextHover(false)} >
                  <Title glow={textHover ? true : false}/>
                </div>
              </div> 
              <div className="w-1/5 h-full flex-2">

              </div>
            </>
          }
        </div>
      </div>
    </div>
  )
}

export default App
