import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Fetch profile row from profiles table
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) console.error("Fetch profile error:", error.message);
      else if (data) setProfile(data);

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setDirty(true);
    setSaved(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const fileName = `${user.id}/${file.name}`;

    setSaving(true);

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (error) console.error("Upload error:", error.message);
    else {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setProfile({ ...profile, avatar_url: urlData.publicUrl });
      setDirty(true);
      setSaved(false);
    }

    setSaving(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);

    if (error) console.error("Save error:", error.message);
    else {
      setSaved(true);
      setDirty(false);
    }

    setSaving(false);
  };

  const handleEnter = () => {
    if (saved) navigate("/dashboard");
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Confirm Your Profile</h2>

        {/* Avatar */}
        <div className="flex flex-col items-center space-y-2">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">No Avatar</div>
          )}
          <input type="file" onChange={handleAvatarUpload} disabled={saving} />
        </div>

        {/* Full Name */}
        <input
          type="text"
          name="full_name"
          value={profile.full_name}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          placeholder="Full Name"
        />

        {/* Phone */}
        <input
          type="text"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          placeholder="Phone"
        />

        {/* Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleEnter}
            disabled={!saved}
            className="w-full py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Enter Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
