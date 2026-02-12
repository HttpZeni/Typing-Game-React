import supabase from "./supabase/supabase-client";
import type { User } from "@supabase/supabase-js";
import { FetchGameData } from "./fetchData";
import { setLocalItem } from "../storage/localStorage";

const DEFAULT_PROFILE_PIC =
    "https://i.pinimg.com/736x/8c/8f/aa/8c8faaee152db00384e06d3365cae0b9.jpg";

type AuthResult = {
    status: "ok" | "error" | "verify";
    message?: string;
};

export type UserSettings = {
    id: string;
    created_at: string;
    profilePicture: string | null;
}

export type UserStats = {
  id?: number
  userId: string
  created_at: string
  rounds: {
    created_at: string
    text: string
    time: number
    accuracy: number
    wpm: number
    errorLetters: string[]
  }[]
}

export type Round = UserStats["rounds"][number]

function normalizeAuthError(error: unknown, fallback: string) {
    if (!error || typeof error !== "object") return fallback;
    if ("message" in error && typeof (error as { message?: string }).message === "string") {
        return (error as { message: string }).message;
    }
    return fallback;
}

async function ensureUserProfile(user: User, fallbackUsername?: string) {
    const { data: existing, error: existingError } = await supabase
        .from("Users")
        .select("userId")
        .eq("userId", user.id)
        .maybeSingle();

    if (existingError) {
        console.log("Error checking user profile: ", existingError);
        return;
    }

    if (!existing) {
        const username =
            (user.user_metadata?.username as string | undefined) ||
            fallbackUsername ||
            (user.email ? user.email.split("@")[0] : "Player");

        const { error } = await supabase
            .from("Users")
            .insert([{ Username: username, Email: user.email ?? "", userId: user.id }])
            .single();

        if (error) {
            console.log("Error creating user profile: ", error);
            return;
        }
    }

    const { data: settings, error: settingsError } = await supabase
        .from("UserSettings")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    if (settingsError) {
        console.log("Error loading user settings: ", settingsError);
        return;
    }

    if (!settings) {
        const { error: insertError } = await supabase
            .from("UserSettings")
            .insert({ id: user.id, profilePicture: DEFAULT_PROFILE_PIC });

        if (insertError) {
            console.log("Error saving user settings: ", insertError);
        }
    }
}

export async function addUserStatsData() {
    const newData = {
        Round: 0,
        Time: FetchGameData(0).Seconds,
        WPM: FetchGameData(0).WPM,
        Accuracy: FetchGameData(0).Accurancy,
        Errors: FetchGameData(0).Errors,
    }

    const {data, error} = await supabase.from("UserStats").insert([newData]).single();

    if (error){
        console.log("Error saving user stats: ", error);
    }
    else{
        console.log(data);
    }
}

export async function addUser(Username: string, Email: string, Password: string) {
    const { data: signUpData, error: signUpError} = await supabase.auth.signUp({email: Email, password: Password, options: { data: { username: Username } }});

    if (signUpError) {
        console.log("Sign up error: ", signUpError);
        return { status: "error", message: normalizeAuthError(signUpError, "Sign up error") } satisfies AuthResult;
    }

    if (!signUpData.session) {
        return { status: "verify", message: "Bitte Email bestätigen." } satisfies AuthResult;
    }

    const user = signUpData.user;
    if (!user) {
        console.log("No user id from signup.");
        return { status: "error", message: "No user id from signup." } satisfies AuthResult;
    }

    await ensureUserProfile(user, Username);
    setLocalItem("logged in", "true");

    return { status: "ok" } satisfies AuthResult;
}

export async function login(Email: string, Password: string) {
    const { data: signInData, error: singInError} = await supabase.auth.signInWithPassword({email: Email, password: Password});

    if (singInError) {
        console.log("Sign in error: ", singInError);
        return { status: "error", message: normalizeAuthError(singInError, "Sign in error") } satisfies AuthResult;
    }

    const user = signInData.user;
    if (!user) {
        console.log("No user from sign in.");
        return { status: "error", message: "No user from sign in." } satisfies AuthResult;
    }

    const confirmedAt = user.email_confirmed_at ?? user.confirmed_at;
    if (!confirmedAt) {
        console.log("Bitte Email bestätigen.");
        return { status: "verify", message: "Bitte Email bestätigen." } satisfies AuthResult;
    }

    await ensureUserProfile(user);
    setLocalItem("logged in", "true");
    return { status: "ok" } satisfies AuthResult;
}

export async function logOut(){
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.log("Sign out error: ", error);
        return { status: "error", message: normalizeAuthError(error, "Sign out error") } satisfies AuthResult;
    }
    setLocalItem("logged in", "false");
    return { status: "ok" } satisfies AuthResult;
}

export async function getUser(){
    const {data: {user}, error} = await supabase.auth.getUser();
    if (error) {
        console.log("Error getting user: ", error);
        return null;
    }
    return user;
}

export async function changeUsername(NewUsername: string){
  const user = await getUser();
  if (!user) return;

  const { error } = await supabase
    .from("Users")
    .update({ Username: NewUsername })
    .eq("userId", user.id);

  if (error) console.log("Error: ", error);
}

export async function getUsername(): Promise<string>{
  const user = await getUser();
  if (!user) return "";

  const { data, error } = await supabase
    .from("Users")
    .select("Username")
    .eq("userId", user.id)
    .single();

  if (error) console.log("Error: ", error);
  return data?.Username ?? "";
}

export async function getUserSettings() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError ?? new Error("No user");

  const { data, error } = await supabase
    .from("UserSettings")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? { id: user.id, profilePicture: null }) as UserSettings;
}

export async function updateUserSettings(patch: Partial<UserSettings>) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError ?? new Error("No user");

  const { data, error } = await supabase
    .from("UserSettings")
    .upsert({ id: user.id, ...patch }, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data as UserSettings;
}

export async function changeProfilePicture(file: File) {
  const user = await getUser();
  if (!user) return;

  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase
    .storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.log("Upload error:", uploadError);
    return;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error } = await supabase
    .from("UserSettings")
    .upsert({ id: user.id, profilePicture: data.publicUrl }, { onConflict: "id" });

  if (error) {
    console.log("Error updating UserSettings: ", error);
    return;
  }

  return data.publicUrl;
}

export async function getUserStats(){
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError ?? new Error("No user");

  const { data, error } = await supabase
    .from("UserStats")
    .select("*")
    .eq("userId", user.id)
    .maybeSingle();

  if (error) throw error;
  return (data ?? {
    userId: user.id,
    created_at: new Date().toISOString(),
    rounds: [],
  }) as UserStats
}

export async function updateUserStats(patch: Partial<UserStats>) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError ?? new Error("No user");

  const { data, error } = await supabase
    .from("UserStats")
    .upsert({ userId: user.id, ...patch }, { onConflict: "userId" })
    .select()
    .single();

  if (error) {
    console.log("updateUserStats error:", error);
    throw error;
  }
  if (!data) {
    console.log("updateUserStats returned no data", { patch, userId: user.id });
  }
  return data as UserStats;
}

export async function appendUserRound(newRound: Round): Promise<UserStats> {
  console.log("appendUserRound called", newRound);
  const stats = await getUserStats()
  const updatedRounds: Round[] = [...stats.rounds, newRound]

  return updateUserStats({ rounds: updatedRounds })
}






