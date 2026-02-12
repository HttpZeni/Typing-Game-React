import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import PublicProfile from "../profile/PublicProfile";
import {
  attachProfilePictures,
  getFriendStatusForUsers,
  removeFriend,
  respondToFriendRequest,
  searchUsersByUsername,
  sendFriendRequest,
  type PublicUser,
} from "../../services/supabaseData";

type Props = {
  open?: boolean;
  onClose?: () => void;
  showTriggerButton?: boolean;
};

type FriendStatus = {
  state: "none" | "friends" | "outgoing" | "incoming";
  requestId?: number;
};

const DEFAULT_AVATAR = "https://i.pinimg.com/736x/8c/8f/aa/8c8faaee152db00384e06d3365cae0b9.jpg";

const UserCard = ({
  user,
  status,
  onViewProfile,
  onAddFriend,
  onRemoveFriend,
  onRespond,
}: {
  user: PublicUser;
  status: FriendStatus["state"];
  onViewProfile: () => void;
  onAddFriend: () => void;
  onRemoveFriend: () => void;
  onRespond: (action: "accept" | "reject") => void;
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case "friends":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-success/20 border border-accent-success/30 rounded-md">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-success shadow-glow-green animate-pulse" />
            <span className="text-xs font-display font-semibold text-accent-success">Friends</span>
          </div>
        );
      case "outgoing":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-warning/20 border border-accent-warning/30 rounded-md">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-warning shadow-glow-yellow animate-pulse" />
            <span className="text-xs font-display font-semibold text-accent-warning">Pending</span>
          </div>
        );
      case "incoming":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-primary/20 border border-accent-primary/30 rounded-md">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-primary shadow-glow-purple animate-pulse" />
            <span className="text-xs font-display font-semibold text-accent-primary">Incoming</span>
          </div>
        );
      default:
        return null;
    }
  };

  const actionButtons = useMemo(() => {
    switch (status) {
      case "friends":
        return (
          <Button
            className="h-8 px-3 text-xs"
            text="Remove"
            onClickFunction={onRemoveFriend}
          />
        );
      case "outgoing":
        return (
          <Button
            className="h-8 px-3 text-xs opacity-60"
            text="Requested"
            disabled
          />
        );
      case "incoming":
        return (
          <div className="flex items-center gap-2">
            <Button
              className="h-8 px-3 text-xs"
              text="Accept"
              onClickFunction={() => onRespond("accept")}
            />
            <Button
              className="h-8 px-3 text-xs"
              text="Decline"
              onClickFunction={() => onRespond("reject")}
            />
          </div>
        );
      case "none":
        return (
          <Button
            className="h-8 px-3 text-xs"
            text="Add Friend"
            onClickFunction={onAddFriend}
          />
        );
    }
  }, [status, onAddFriend, onRemoveFriend, onRespond]);

  return (
    <div className="group p-4 bg-gradient-to-br from-card-bg to-game-bg-light border-2 border-card-border rounded-xl transition-all duration-300 hover:border-accent-primary hover:shadow-glow-purple hover:scale-[1.01]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user.profilePicture ?? DEFAULT_AVATAR}
              alt={`${user.Username} avatar`}
              className="w-11 h-11 rounded-full object-cover border-2 border-card-border group-hover:border-accent-primary transition-all duration-300 shadow-lg"
            />
            {status === "friends" && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-success border-2 border-card-bg rounded-full shadow-glow-green" />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="font-display font-bold text-text-primary text-sm group-hover:text-accent-primary transition-colors">
              {user.Username}
            </div>
            {getStatusBadge()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="h-8 px-3 text-xs"
            text="View"
            onClickFunction={onViewProfile}
          />
          {actionButtons}
        </div>
      </div>
    </div>
  );
};

export default function UserSearch({ open: controlledOpen, onClose, showTriggerButton = true }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, FriendStatus>>({});
  const [hasSearched, setHasSearched] = useState(false);

  const isOpen = controlledOpen ?? open;

  useEffect(() => {
    if (!isOpen) {
      setProfileOpen(false);
      setSelectedUser(null);
      setResults([]);
      setQuery("");
      setStatusMap({});
      setError(null);
      setHasSearched(false);
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (controlledOpen === undefined) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    if (controlledOpen !== undefined) {
      onClose?.();
    } else {
      setOpen(false);
    }
  };

  const handleSearch = async () => {
    const trimmed = query.trim();
    setHasSearched(true);
    if (trimmed.length < 2) {
      setError("Please enter at least 2 characters.");
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const users = await searchUsersByUsername(trimmed);
      const withPictures = await attachProfilePictures(users);
      const status = await getFriendStatusForUsers(withPictures.map((u) => u.userId));

      const nextStatus: Record<string, FriendStatus> = {};
      withPictures.forEach((user) => {
        if (status.friends.includes(user.userId)) {
          nextStatus[user.userId] = { state: "friends" };
        } else if (status.outgoing[user.userId]) {
          nextStatus[user.userId] = { state: "outgoing", requestId: status.outgoing[user.userId] };
        } else if (status.incoming[user.userId]) {
          nextStatus[user.userId] = { state: "incoming", requestId: status.incoming[user.userId] };
        } else {
          nextStatus[user.userId] = { state: "none" };
        }
      });

      setResults(withPictures);
      setStatusMap(nextStatus);
    } catch (err) {
      // TODO: handle search error.
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = (userId: string, status: FriendStatus) => {
    setStatusMap((prev) => ({ ...prev, [userId]: status }));
  };

  const handleAddFriend = async (userId: string) => {
    try {
      const requestId = await sendFriendRequest(userId);
      updateUserStatus(userId, { state: "outgoing", requestId });
    } catch (err) {
      // TODO: handle add friend error.
      setError("Could not send friend request.");
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      await removeFriend(userId);
      updateUserStatus(userId, { state: "none" });
    } catch (err) {
      // TODO: handle remove friend error.
      setError("Could not remove friend.");
    }
  };

  const handleRespond = async (userId: string, action: "accept" | "reject") => {
    const status = statusMap[userId];
    if (!status?.requestId) return;

    try {
      await respondToFriendRequest(status.requestId, userId, action);
      updateUserStatus(userId, { state: action === "accept" ? "friends" : "none" });
    } catch (err) {
      // TODO: handle respond error.
      setError("Failed to update friend request.");
    }
  };

  const handleViewProfile = (user: PublicUser) => {
    setSelectedUser(user);
    setProfileOpen(true);
  };

  const resultsView = useMemo(() => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
          <div className="text-text-secondary font-display font-semibold text-sm">Searching players...</div>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <div className="text-text-secondary font-display text-center">
            <div className="font-semibold text-sm mb-1">No players found</div>
            <div className="text-xs opacity-70">Try a different search term</div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {results.map((user) => (
          <UserCard
            key={user.userId}
            user={user}
            status={statusMap[user.userId]?.state ?? "none"}
            onViewProfile={() => handleViewProfile(user)}
            onAddFriend={() => handleAddFriend(user.userId)}
            onRemoveFriend={() => handleRemoveFriend(user.userId)}
            onRespond={(action) => handleRespond(user.userId, action)}
          />
        ))}
      </div>
    );
  }, [loading, results, statusMap]);

  if (!isOpen && !showTriggerButton) return null;

  return (
    <>
      {showTriggerButton && (
        <div className="m-5 z-30">
          <Button
            onClickFunction={handleOpen}
            text="Search"
            className="shadow-lg hover:shadow-glow-purple"
          />
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-3xl bg-gradient-to-br from-card-bg to-game-bg-light border-2 border-card-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-accent-primary/10 to-transparent border-b-2 border-card-border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-text-primary text-2xl font-display font-bold">Find Players</h1>
                  <p className="text-text-secondary text-xs font-display">Search and connect with other players</p>
                </div>
                <Button
                  text="Close"
                  onClickFunction={handleClose}
                  className="w-9 h-9"
                />
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex gap-3">
                <Input
                  className="flex-1 h-12 text-base"
                  containerClassName="flex-1"
                  placeholder="Search by username..."
                  value={query}
                  onChange={setQuery}
                  onSubmit={handleSearch}
                />
                <Button
                  text="Search"
                  onClickFunction={handleSearch}
                  className="h-12 px-6 font-bold text-sm"
                  disabled={query.trim().length < 2}
                />
              </div>

              {error && (
                <div className="p-3 bg-accent-warning/10 border-2 border-accent-warning/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-display font-semibold text-accent-warning">{error}</div>
                  </div>
                </div>
              )}

              {(loading || hasSearched) && (
                <div className="max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent hover:scrollbar-thumb-accent-primary">
                  {resultsView}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <PublicProfile
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          userId={selectedUser.userId}
        />
      )}
    </>
  );
}
