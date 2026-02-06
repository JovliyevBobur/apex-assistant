import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Save } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail?: string;
}

const ProfileDialog = ({ isOpen, onClose, userId, userEmail }: ProfileDialogProps) => {
  const { profile, isLoading, updateDisplayName, uploadAvatar } = useProfile(userId);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when profile loads
  const [initialized, setInitialized] = useState(false);
  if (profile && !initialized) {
    setDisplayName(profile.display_name || "");
    setInitialized(true);
  }

  const handleSave = async () => {
    setIsSaving(true);
    await updateDisplayName(displayName);
    setIsSaving(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    await uploadAvatar(file);
    setIsUploading(false);
  };

  const initials = (profile?.display_name || userEmail || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">Profil</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="w-24 h-24 border-2 border-primary/30">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  ) : (
                    <Camera className="w-6 h-6 text-primary" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Rasmni o'zgartirish uchun bosing</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <Input
                value={userEmail || ""}
                disabled
                className="bg-background/30 text-muted-foreground"
              />
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="profileName">Ism</Label>
              <Input
                id="profileName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ismingizni kiriting"
                className="bg-background/50"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                "Saqlanmoqda..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Saqlash
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
