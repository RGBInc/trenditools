import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Doc } from "../../convex/_generated/dataModel";
import { User, ChevronDown } from "lucide-react";

interface UserButtonProps {
  onShowProfile?: () => void;
}

export function UserButton({ onShowProfile }: UserButtonProps) {
  const user = useQuery(api.users.get);

  if (!user) {
    return null;
  }

  return (
    <button
      onClick={onShowProfile}
      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
    >
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt="Profile" className="w-7 h-7 rounded-full" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      )}
      <span className="font-medium text-sm hidden sm:block">{user.name}</span>
      <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
    </button>
  );
}
