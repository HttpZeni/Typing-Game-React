import supabase from "./supabase/supabase-client";
import { FetchGameData } from "./fetchData";
import { setLocalItem } from "../storage/localStorage";

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
    time: number
    accuracy: number
    wpm: number
    errorLetters: string[]
  }[]
}

export type Round = UserStats["rounds"][number]


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
        return { status: "error", message: "Sign up error" };
    }

    if (!signUpData.session) {
        return { status: "verify", message: "Bitte Email bestätigen." };
    }

    const userId = signUpData.user?.id;
    if (!userId) {
        console.log("No user id from signup.");
        return { status: "error", message: "No user id from signup." };
    }

    const { data, error } = await supabase.from("Users").insert([{Username, Email, userId }]).single();

    if (error) {
        console.log("Error saving user: ", error);
        return { status: "error", message: "Error saving user" };
    }
    else {
        setLocalItem("logged in", "true");
        console.log(data);
    }

    const defaultPic = "https://i.pinimg.com/736x/8c/8f/aa/8c8faaee152db00384e06d3365cae0b9.jpg";

    const { error: settingsError } = await supabase.from("UserSettings").upsert({ id: userId, profilePicture: defaultPic }, { onConflict: "id" });

    if (settingsError) {
        console.log("Error saving user settings: ", settingsError);
    }

    return { status: "ok" };
}

export async function login(Email: string, Password: string) {
    const { data: signInData, error: singInError} = await supabase.auth.signInWithPassword({email: Email, password: Password});

    if (singInError) {
        console.log("Sign up error: ", singInError);
        return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
        console.log("Error getting user: ", userError);
        return;
    }
    if (!userData.user?.email_confirmed_at) {
        console.log("Bitte Email bestätigen.");
        return;
    }

    const userId = signInData.user?.id;
    if (!userId) {
        console.log("No user id from signup.");
        return;
    }

  const { data: profile, error: profileError } = await supabase.from("Users").select("*").eq("userId", userId).single();

  if (profileError) {
    console.log("Error loading profile: ", profileError);
  } else {
    console.log(profile);
  }

  setLocalItem("logged in", "true");
}

export async function logOut(){
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.log("Sign out error: ", error);
        return
    }
    setLocalItem("logged in", "false");
}

export async function getUser(){
    const {data: {user}} = await supabase.auth.getUser();
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
