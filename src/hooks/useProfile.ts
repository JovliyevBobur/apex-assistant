import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    }
    setProfile(data);
    setIsLoading(false);
  };

  const updateDisplayName = async (displayName: string) => {
    if (!userId) return false;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", userId);

    if (error) {
      toast.error("Ismni yangilashda xatolik");
      return false;
    }

    setProfile((prev) => (prev ? { ...prev, display_name: displayName } : prev));
    toast.success("Ism yangilandi");
    return true;
  };

  const uploadAvatar = async (file: File) => {
    if (!userId) return false;

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Rasm yuklashda xatolik");
      console.error("Upload error:", uploadError);
      return false;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", userId);

    if (updateError) {
      toast.error("Profilni yangilashda xatolik");
      return false;
    }

    setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : prev));
    toast.success("Avatar yangilandi");
    return true;
  };

  return { profile, isLoading, updateDisplayName, uploadAvatar, refetch: fetchProfile };
}
