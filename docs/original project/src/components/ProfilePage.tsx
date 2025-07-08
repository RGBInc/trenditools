import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { SignOutButton } from "../SignOutButton";
import { ToolCard } from "./ToolCard";
import { PasswordChangeModal } from "./PasswordChangeModal";
import { Doc } from "../../convex/_generated/dataModel";
import { 
  User, 
  Upload, 
  Bookmark, 
  Award, 
  ExternalLink, 
  Settings,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

interface ProfilePageProps {
  onViewDetails: (tool: Doc<"tools">) => void;
  onBack: () => void;
}

export function ProfilePage({ onViewDetails, onBack }: ProfilePageProps) {
  const user = useQuery(api.users.get);
  const bookmarkedTools = useQuery(api.users.getBookmarkedTools);
  const updateUser = useMutation(api.users.update);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const [name, setName] = useState(user?.name ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
    }
  }, [user]);

  // Scroll to top when component mounts
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
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
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setName(user?.name ?? "");
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-xl border p-4 sm:p-6 md:p-8">
          <div className="flex flex-col space-y-6">
            {/* Profile Image and Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-muted flex items-center justify-center">
                  {selectedFile ? (
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Preview" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <User className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-muted-foreground" />
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-1.5 sm:p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left space-y-3 sm:space-y-4 w-full">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-background border rounded-md px-3 py-2 w-full text-center sm:text-left"
                      placeholder="Your name"
                    />
                  ) : (
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold break-words">{user.name || "Anonymous"}</h2>
                  )}
                  <p className="text-sm sm:text-base text-muted-foreground break-all">{user.email}</p>
                </div>

                {/* Points */}
                <div className="flex items-center justify-center sm:justify-start">
                  <div className="flex items-center space-x-2 sm:space-x-3 bg-yellow-50 dark:bg-yellow-900/20 p-2 sm:p-3 rounded-lg">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-400">
                      {user.points ?? 0} points earned
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex items-center justify-center space-x-2 flex-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="flex items-center justify-center space-x-2 flex-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isUpdating ? "Saving..." : "Save"}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bookmarks Section */}
        <div className="bg-card rounded-xl border p-4 sm:p-6 md:p-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <h3 className="text-lg sm:text-xl font-semibold">
              Bookmarked Tools ({bookmarkedTools?.length || 0})
            </h3>
          </div>

          {!bookmarkedTools || bookmarkedTools.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Bookmark className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-base sm:text-lg font-medium mb-2">No bookmarks yet</h4>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Start exploring tools and bookmark your favorites to see them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {bookmarkedTools.map((tool) => 
                tool ? (
                  <ToolCard 
                    key={tool._id} 
                    tool={{ ...tool, isBookmarked: true }} 
                    onViewDetails={onViewDetails} 
                  />
                ) : null
              )}
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="bg-card rounded-xl border p-4 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center space-x-3">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span>Account</span>
          </h3>
          <div className="space-y-4">
            {!user?.isAnonymous && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-muted/50 rounded-lg space-y-3 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <h4 className="font-medium">Change Password</h4>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <div className="flex justify-center sm:justify-end">
                  <Button variant="outline" onClick={() => setShowPasswordChange(true)} className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Change Password</span>
                  </Button>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-muted/50 rounded-lg space-y-3 sm:space-y-0">
              <div className="text-center sm:text-left">
                <h4 className="font-medium">Sign Out</h4>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account
                </p>
              </div>
              <div className="flex justify-center sm:justify-end">
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        <PasswordChangeModal
          isOpen={showPasswordChange}
          onClose={() => setShowPasswordChange(false)}
        />
      </motion.div>
    </div>
  );
}
