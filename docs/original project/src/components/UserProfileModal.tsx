import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { SignOutButton } from "../SignOutButton";
import { User, X, Upload, Bookmark, Award, ExternalLink, Settings } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const user = useQuery(api.users.get);
  const bookmarkedTools = useQuery(api.users.getBookmarkedTools);
  const updateUser = useMutation(api.users.update);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const [name, setName] = useState(user?.name ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
    }
  }, [user]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpdateProfile = async () => {
    let profileImageId;
    if (selectedFile) {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      const { storageId } = await result.json();
      profileImageId = storageId;
    }

    await updateUser({ name, profileImage: profileImageId });
    toast.success("Profile updated successfully!");
    setIsEditing(false);
    setSelectedFile(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Profile Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  {selectedFile ? (
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full rounded-full object-cover" />
                  ) : user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border bg-background rounded-md focus:ring-2 focus:ring-ring"
                    placeholder="Your name"
                  />
                ) : (
                  <div>
                    <h3 className="font-semibold">{user?.name || "Anonymous"}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedFile(null);
                      setName(user?.name ?? "");
                    }}
                    className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Points */}
          <div className="flex items-center space-x-3 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <Award className="w-5 h-5 text-yellow-600" />
            <p className="font-medium text-yellow-700 dark:text-yellow-400">
              {user?.points ?? 0} points earned
            </p>
          </div>

          {/* Bookmarks */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <Bookmark className="w-4 h-4 mr-2" />
              Bookmarked Tools ({bookmarkedTools?.length || 0})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {!bookmarkedTools || bookmarkedTools.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookmarks yet.</p>
              ) : (
                bookmarkedTools.slice(0, 5).map((tool) =>
                  tool ? (
                    <div key={tool._id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="font-medium text-sm truncate">{tool.name}</span>
                      <a 
                        href={tool.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : null
                )
              )}
              {bookmarkedTools && bookmarkedTools.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{bookmarkedTools.length - 5} more bookmarks
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
