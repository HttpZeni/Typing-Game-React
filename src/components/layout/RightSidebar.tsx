import { useCallback, useEffect, useState } from "react";
import Button from "../ui/Button";
import UserSearch from "../game/UserSearch";
import PublicProfile from "../profile/PublicProfile";
import { getFriendsList, getIncomingFriendRequests, removeFriend, respondToFriendRequest, type PublicUser } from "../../services/supabaseData";
import { getLocalItem } from "../../storage/localStorage";

type IncomingRequest = {
  id: number;
  sender_id: string;
  Username: string;
  profilePicture?: string | null;
};

const DEFAULT_AVATAR = "https://i.pinimg.com/736x/8c/8f/aa/8c8faaee152db00384e06d3365cae0b9.jpg";

// Friend Request Card Component
const FriendRequestCard = ({
  request,
  onRespond,
}: {
  request: IncomingRequest;
  onRespond: (requestId: number, senderId: string, action: "accept" | "reject") => void;
}) => (
  <div className="flex items-center justify-between gap-2 p-2 border-2 border-card-border rounded-lg bg-game-bg-light">
    <div className="flex items-center gap-2">
      <img
        src={request.profilePicture ?? DEFAULT_AVATAR}
        alt={`${request.Username} avatar`}
        className="w-8 h-8 rounded-full object-cover border-2 border-card-border"
      />
      <div className="text-text-primary text-sm font-display">{request.Username}</div>
    </div>
    <div className="flex items-center gap-1">
      <Button
        className="h-7 px-2 text-xs"
        text="Accept"
        onClickFunction={() => onRespond(request.id, request.sender_id, "accept")}
      />
      <Button
        className="h-7 px-2 text-xs"
        text="Reject"
        onClickFunction={() => onRespond(request.id, request.sender_id, "reject")}
      />
    </div>
  </div>
);

// Friend Card Component
const FriendCard = ({
  friend,
  onViewProfile,
  onRemove,
}: {
  friend: PublicUser;
  onViewProfile: (user: PublicUser) => void;
  onRemove: (friendId: string) => void;
}) => (
  <div className="flex items-center justify-between gap-3 p-2 rounded-lg border-2 border-card-border bg-game-bg-light hover:border-accent-primary transition-all">
    <button onClick={() => onViewProfile(friend)} className="flex items-center gap-3 text-left flex-1 min-w-0">
      <img
        src={friend.profilePicture ?? DEFAULT_AVATAR}
        alt={`${friend.Username} avatar`}
        className="w-10 h-10 rounded-full object-cover border-2 border-card-border flex-shrink-0"
      />
      <div className="text-text-primary font-display font-semibold truncate">{friend.Username}</div>
    </button>
    <Button
      className="h-7 px-2 text-xs flex-shrink-0"
      text="Remove"
      onClickFunction={() => onRemove(friend.userId)}
    />
  </div>
);

// Section Header Component
const SectionHeader = ({ title }: { title: string }) => (
  <div className="text-xs font-display uppercase tracking-[0.25em] text-text-secondary">
    {title}
  </div>
);

// Empty State Component
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-text-secondary text-xs font-display">{message}</div>
);

export default function RightSidebar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [friends, setFriends] = useState<PublicUser[]>([]);
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const loggedIn = getLocalItem("logged in") === "true";

  const loadData = useCallback(async () => {
    if (!loggedIn) return;
    
    setLoading(true);
    try {
      const [friendsData, requestData] = await Promise.all([
        getFriendsList(),
        getIncomingFriendRequests(),
      ]);
      setFriends(friendsData);
      setRequests(requestData as IncomingRequest[]);
    } catch {
      // TODO: handle right sidebar load error.
    } finally {
      setLoading(false);
    }
  }, [loggedIn]);

  useEffect(() => {
    if (loggedIn) {
      loadData();
    }
  }, [loggedIn, loadData]);

  useEffect(() => {
    if (!searchOpen && loggedIn) {
      loadData();
    }
  }, [searchOpen, loggedIn, loadData]);

  const handleRespond = async (requestId: number, senderId: string, action: "accept" | "reject") => {
    try {
      await respondToFriendRequest(requestId, senderId, action);
      await loadData();
    } catch {
      // TODO: handle respond error.
    }
  };

  const handleViewProfile = (user: PublicUser) => {
    setSelectedUser(user);
    setProfileOpen(true);
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await removeFriend(friendId);
      await loadData();
    } catch {
      // TODO: handle remove friend error.
    }
  };

  const handleCloseProfile = () => {
    setProfileOpen(false);
    setSelectedUser(null);
  };

  if (!loggedIn) return null;

  return (
    <div className="w-full h-full flex flex-col gap-4 p-5">
      {/* Search Button */}
      <Button
        text="Search"
        onClickFunction={() => setSearchOpen(true)}
        className="w-full justify-center"
      />

      {/* Friend Requests Section */}
      <div className="flex flex-col gap-2">
        <SectionHeader title="Friend Requests" />
        <div className="flex flex-col gap-2">
          {requests.length === 0 ? (
            <EmptyState message="No requests" />
          ) : (
            requests.map((req) => (
              <FriendRequestCard key={req.id} request={req} onRespond={handleRespond} />
            ))
          )}
        </div>
      </div>

      {/* Friends List Section */}
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <SectionHeader title="Friends" />
        <div className="flex flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent hover:scrollbar-thumb-accent-primary">
          {loading ? (
            <EmptyState message="Loading..." />
          ) : friends.length === 0 ? (
            <EmptyState message="No friends yet" />
          ) : (
            friends.map((friend) => (
              <FriendCard
                key={friend.userId}
                friend={friend}
                onViewProfile={handleViewProfile}
                onRemove={handleRemoveFriend}
              />
            ))
          )}
        </div>
      </div>

      {/* User Search Modal */}
      <UserSearch open={searchOpen} onClose={() => setSearchOpen(false)} showTriggerButton={false} />

      {/* Public Profile Modal */}
      {selectedUser && (
        <PublicProfile
          open={profileOpen}
          onClose={handleCloseProfile}
          userId={selectedUser.userId}
        />
      )}
    </div>
  );
}
