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

export type PublicUser = {
    userId: string;
    Username: string;
    profilePicture?: string | null;
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

type FriendRow = { friend_id: string };
type OutgoingRequestRow = { id: number; receiver_id: string };
type IncomingRequestRow = { id: number; sender_id: string };
type UserRow = { Username: string | null; userId: string };
type UserSettingRow = { id: string; profilePicture: string | null };

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
        // TODO: handle user profile lookup error.
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
            // TODO: handle user profile creation error.
            return;
        }
    }

    const { data: settings, error: settingsError } = await supabase
        .from("UserSettings")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    if (settingsError) {
        // TODO: handle settings lookup error.
        return;
    }

    if (!settings) {
        const { error: insertError } = await supabase
            .from("UserSettings")
            .insert({ id: user.id, profilePicture: DEFAULT_PROFILE_PIC });

        if (insertError) {
            // TODO: handle settings insert error.
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

    const { error } = await supabase.from("UserStats").insert([newData]).single();

    if (error){
        // TODO: handle user stats save error.
    }
    else{
        // TODO: handle user stats save success if needed.
    }
}

export async function addUser(Username: string, Email: string, Password: string) {
    const { data: signUpData, error: signUpError} = await supabase.auth.signUp({email: Email, password: Password, options: { data: { username: Username } }});

    if (signUpError) {
        // TODO: handle sign up error.
        return { status: "error", message: normalizeAuthError(signUpError, "Sign up error") } satisfies AuthResult;
    }

    if (!signUpData.session) {
        return { status: "verify", message: "Bitte Email besttigen." } satisfies AuthResult;
    }

    const user = signUpData.user;
    if (!user) {
        // TODO: handle missing user id after signup.
        return { status: "error", message: "No user id from signup." } satisfies AuthResult;
    }

    await ensureUserProfile(user, Username);
    setLocalItem("logged in", "true");

    return { status: "ok" } satisfies AuthResult;
}

export async function login(Email: string, Password: string) {
    const { data: signInData, error: singInError} = await supabase.auth.signInWithPassword({email: Email, password: Password});

    if (singInError) {
        // TODO: handle sign in error.
        return { status: "error", message: normalizeAuthError(singInError, "Sign in error") } satisfies AuthResult;
    }

    const user = signInData.user;
    if (!user) {
        // TODO: handle missing user after sign in.
        return { status: "error", message: "No user from sign in." } satisfies AuthResult;
    }

    const confirmedAt = user.email_confirmed_at ?? user.confirmed_at;
    if (!confirmedAt) {
        // TODO: handle unconfirmed email.
        return { status: "verify", message: "Bitte Email besttigen." } satisfies AuthResult;
    }

    await ensureUserProfile(user);
    setLocalItem("logged in", "true");
    return { status: "ok" } satisfies AuthResult;
}

export async function logOut(){
    const { error } = await supabase.auth.signOut();
    if (error) {
        // TODO: handle sign out error.
        return { status: "error", message: normalizeAuthError(error, "Sign out error") } satisfies AuthResult;
    }
    setLocalItem("logged in", "false");
    return { status: "ok" } satisfies AuthResult;
}

export async function signInWithProvider(provider: "google" | "discord") {
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        },
    });

    if (error) {
        // TODO: handle OAuth sign in error.
        return { status: "error", message: normalizeAuthError(error, "OAuth sign in error") } satisfies AuthResult;
    }
    return { status: "ok" } satisfies AuthResult;
}

export async function getUser(){
    const {data: {user}, error} = await supabase.auth.getUser();
    if (error) {
        // TODO: handle get user error.
        return null;
    }
    return user;
}

export async function getUserSettingsById(userId: string) {
    const { data, error } = await supabase
        .from("UserSettings")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error) throw error;
    return (data ?? { id: userId, profilePicture: null }) as UserSettings;
}

export async function getUserStatsByUserId(userId: string) {
    const { data, error } = await supabase
        .from("UserStats")
        .select("*")
        .eq("userId", userId)
        .maybeSingle();

    if (error) throw error;
    return (data ?? {
        userId,
        created_at: new Date().toISOString(),
        rounds: [],
    }) as UserStats;
}

export async function getUsernameByUserId(userId: string): Promise<string> {
    const { data, error } = await supabase
        .from("Users")
        .select("Username")
        .eq("userId", userId)
        .maybeSingle();

    if (error) throw error;
    return data?.Username ?? "";
}

export async function searchUsersByUsername(query: string): Promise<PublicUser[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const { data, error } = await supabase
        .from("Users")
        .select("userId, Username")
        .ilike("Username", `%${trimmed}%`)
        .limit(20);

    if (error) throw error;
    return (data ?? []).map((row) => ({
        userId: row.userId,
        Username: row.Username ?? "",
    })) as PublicUser[];
}

export async function attachProfilePictures(users: PublicUser[]) {
    if (users.length === 0) return users;
    const userIds = users.map((u) => u.userId);
    const { data, error } = await supabase
        .from("UserSettings")
        .select("id, profilePicture")
        .in("id", userIds);

    if (error) throw error;
    const map = new Map<string, string | null>();
    (data ?? []).forEach((row) => map.set(row.id, row.profilePicture));

    return users.map((u) => ({
        ...u,
        profilePicture: map.get(u.userId) ?? null,
    }));
}

export async function changeUsername(NewUsername: string){
  const user = await getUser();
  if (!user) return;

  const { error } = await supabase
    .from("Users")
    .update({ Username: NewUsername })
    .eq("userId", user.id);

  if (error) {
    // TODO: handle username update error.
  }
}

export async function getUsername(): Promise<string>{
  const user = await getUser();
  if (!user) return "";

  const { data, error } = await supabase
    .from("Users")
    .select("Username")
    .eq("userId", user.id)
    .single();

  if (error) {
    // TODO: handle username fetch error.
  }
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
    // TODO: handle avatar upload error.
    return;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error } = await supabase
    .from("UserSettings")
    .upsert({ id: user.id, profilePicture: data.publicUrl }, { onConflict: "id" });

  if (error) {
    // TODO: handle settings update error.
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
    // TODO: handle updateUserStats error.
    throw error;
  }
  if (!data) {
    // TODO: handle updateUserStats empty response.
  }
  return data as UserStats;
}

export async function appendUserRound(newRound: Round): Promise<UserStats> {
  // TODO: consider telemetry for appended round.
  const stats = await getUserStats()
  const updatedRounds: Round[] = [...stats.rounds, newRound]

  return updateUserStats({ rounds: updatedRounds })
}

export async function getFriendStatusForUsers(userIds: string[]) {
  if (userIds.length == 0) {
    return { friends: [], outgoing: {}, incoming: {} } as {
      friends: string[];
      outgoing: Record<string, number>;
      incoming: Record<string, number>;
    };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { friends: [], outgoing: {}, incoming: {} };

  const [friendsRes, outgoingRes, incomingRes] = await Promise.all([
    supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", user.id)
      .in("friend_id", userIds),
    supabase
      .from("friendrequests")
      .select("id, receiver_id")
      .eq("sender_id", user.id)
      .eq("status", "pending")
      .in("receiver_id", userIds),
    supabase
      .from("friendrequests")
      .select("id, sender_id")
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .in("sender_id", userIds),
  ]);

  return {
    friends: ((friendsRes.data ?? []) as FriendRow[]).map((f) => f.friend_id),
    outgoing: ((outgoingRes.data ?? []) as OutgoingRequestRow[]).reduce((acc: Record<string, number>, item) => {
      acc[item.receiver_id] = item.id;
      return acc;
    }, {}),
    incoming: ((incomingRes.data ?? []) as IncomingRequestRow[]).reduce((acc: Record<string, number>, item) => {
      acc[item.sender_id] = item.id;
      return acc;
    }, {}),
  };
}

export async function sendFriendRequest(receiverId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No user");

  const { data: existingFriend } = await supabase
    .from("friends")
    .select("friend_id")
    .eq("user_id", user.id)
    .eq("friend_id", receiverId)
    .maybeSingle();

  if (existingFriend) throw new Error("Already friends");

  const { data: existingRequest } = await supabase
    .from("friendrequests")
    .select("id")
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
    .eq("status", "pending")
    .maybeSingle();

  if (existingRequest) throw new Error("Request already pending");

  const { data, error } = await supabase
    .from("friendrequests")
    .insert({ sender_id: user.id, receiver_id: receiverId, status: "pending" })
    .select("id")
    .single();

  if (error) throw error;
  return data?.id as number;
}

export async function respondToFriendRequest(requestId: number, senderId: string, action: "accept" | "reject") {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No user");

  const newStatus = action == "accept" ? "accepted" : "rejected";
  const { error: updateError } = await supabase
    .from("friendrequests")
    .update({ status: newStatus })
    .eq("id", requestId);

  if (updateError) throw updateError;
  if (action != "accept") return;

  const { error: friendError } = await supabase
    .from("friends")
    .insert([
      { user_id: user.id, friend_id: senderId },
      { user_id: senderId, friend_id: user.id },
    ]);

  if (friendError) throw friendError;
}

export async function getIncomingFriendRequests() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("friendrequests")
    .select("id, sender_id")
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  if (error) throw error;
  const senderIds = ((data ?? []) as IncomingRequestRow[]).map((r) => r.sender_id);
  if (senderIds.length == 0) return [];

  const { data: userRows } = await supabase
    .from("Users")
    .select("Username, userId")
    .in("userId", senderIds);

  const { data: settingsRows } = await supabase
    .from("UserSettings")
    .select("id, profilePicture")
    .in("id", senderIds);

  const settingsMap = new Map<string, string | null>();
  ((settingsRows ?? []) as UserSettingRow[]).forEach((row) => settingsMap.set(row.id, row.profilePicture));

  return ((data ?? []) as IncomingRequestRow[]).map((row) => {
    const userRow = ((userRows ?? []) as UserRow[]).find((u) => u.userId === row.sender_id);
    return {
      id: row.id,
      sender_id: row.sender_id,
      Username: userRow?.Username ?? "Unknown",
      profilePicture: settingsMap.get(row.sender_id) ?? null,
    };
  });
}

export async function removeFriend(friendId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No user");

  const { error: errorA } = await supabase
    .from("friends")
    .delete()
    .eq("user_id", user.id)
    .eq("friend_id", friendId);

  if (errorA) throw errorA;

  const { error: errorB } = await supabase
    .from("friends")
    .delete()
    .eq("user_id", friendId)
    .eq("friend_id", user.id);

  if (errorB) throw errorB;
}

export async function getFriendsList(): Promise<PublicUser[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: friendRows, error } = await supabase
    .from("friends")
    .select("friend_id")
    .eq("user_id", user.id);

  if (error) throw error;
  const friendIds = ((friendRows ?? []) as FriendRow[]).map((f) => f.friend_id);
  if (friendIds.length == 0) return [];

  const { data: userRows } = await supabase
    .from("Users")
    .select("Username, userId")
    .in("userId", friendIds);

  const base = ((userRows ?? []) as UserRow[]).map((row) => ({
    userId: row.userId,
    Username: row.Username ?? "",
  })) as PublicUser[];

  return await attachProfilePictures(base);
}
