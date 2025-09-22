import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function PropertyForm() {
  // Store selected files in state
  const [parkingImages, setParkingImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // ---------------- IMAGE HANDLER ----------------
  const handleParkingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setParkingImages((prev) => [...prev, ...filesArray]); // append new images
    }
  };

  // ---------------- VIDEO HANDLER ----------------
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setVideos((prev) => [...prev, ...filesArray]); // append new videos
    }
  };

  // ---------------- UPLOAD FUNCTION ----------------
  const uploadFiles = async (files: File[], folder: string): Promise<string[]> => {
    const urls: string[] = [];

    for (const file of files) {
      const filePath = `${folder}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("property-images") // 👈 bucket name
        .upload(filePath, file);

      if (error) {
        console.error("Upload error:", error.message);
        continue;
      }

      const { data } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);

      urls.push(data.publicUrl); // collect public URL
    }

    return urls;
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    setUploading(true);
    try {
      // Upload parking images
      const parkingImageUrls = await uploadFiles(parkingImages, "parking_photos");
      // Upload videos
      const videoUrls = await uploadFiles(videos, "videos");

      console.log("✅ Uploaded parking images:", parkingImageUrls);
      console.log("✅ Uploaded videos:", videoUrls);

      // 👉 You can insert into `properties` table here if needed
      // await supabase.from("properties").insert({
      //   parking_photos: parkingImageUrls,
      //   video: videoUrls
      // });
    } catch (err) {
      console.error("Error during upload:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Upload Parking Media</h3>

      {/* Parking Images */}
      <label className="block mb-1">Parking Images</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleParkingImageChange}
        className="mb-3"
      />

      {/* Videos */}
      <label className="block mb-1">Parking Videos</label>
      <input
        type="file"
        accept="video/*"
        multiple
        onChange={handleVideoChange}
        className="mb-3"
      />

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {uploading ? "Uploading..." : "Upload Media"}
      </button>
    </div>
  );
}
