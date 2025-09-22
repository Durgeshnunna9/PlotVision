import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
// const [images, setImages] = useState<File[]>([]);

export interface PropertyFormData {
  user_id: string ;
  location: string ;
  distance: string ;
  footfall_per_hour: number;
  snack_spend: number ;
  property_type: string;
  store_model: string ;
  store_size: number ;
  store_length:  number ;
  store_width:  number ;
  road_facing: string ;
  entry_direction: string ;
  corner_peice: string ;
  corner_side: string ;
  store_position:string ;
  shutter_length: number ;
  shutter_width: number ;
  front_offset: number ;
  setback: string ;
  floor: string;
  parking_availability: string;
  parking_capacity_2w: number;
  parking_capacity_4w: number;
  washroom: string ;
  electricity: string ;
  generator: string ;
  building_age: string ;
  water: string ;
  building_condition: string ;
  landmark: string ;
  owner_contacted: string;
  rental_value: number;
  about_property: string;
  facilities: string[];
  advantages: string[];
  parking_photos: string[];
  property_photos: string[];
  video: string[];

}

interface PropertyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ onCancel, onSuccess }) => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Please log in to add properties.</p>
      </div>
    );
  }
  const [formData, setFormData] = useState<PropertyFormData>({
    user_id: user?.id || "",
    location: "" ,
    distance: "" ,
    footfall_per_hour: 0,
    snack_spend: 0 ,
    property_type: "",
    store_model: "" ,
    store_size: 0 ,
    store_length:  0 ,
    store_width:  0 ,
    road_facing: "" ,
    entry_direction: "" ,
    corner_peice: "" ,
    corner_side: "" ,
    store_position:"" ,
    shutter_length: 0 ,
    shutter_width: 0 ,
    front_offset: 0 ,
    setback: "" ,
    floor: "",
    parking_availability: "",
    parking_capacity_2w: 0,
    parking_capacity_4w: 0,
    washroom: "" ,
    electricity: "" ,
    generator: "" ,
    building_age: "" ,
    water: "" ,
    building_condition: "" ,
    landmark: "" ,
    owner_contacted: "",
    rental_value: 0,
    about_property: "",
    facilities: [],
    advantages: [],
    parking_photos: [],
    property_photos: [],
    video: [],
  });

  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [advantages, setAdvantages] = useState([]);
  const [parkingFiles, setParkingFiles] = useState<File[]>([]);
  const [propertyFiles, setPropertyFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);


  const facilities_option = [
    "Schools",
    "Colleges",
    "Temples",
    "Business Hubs",
    "Corporate Offices",
    "Bus Stations",
    "Railway Stations",
    "Airports",
    "Markets",
    "Shopping Centers",
    "Metro Stations",
  ];
  const advantages_option = [
    "Junction / Crossroads",
    "Busy Area / High Density Zone",
    "Parking Available",
    "Visibility from Main Road",
    "Less Competition",
    "Near Landmark",
       
  ];

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files) {
  //     setImages(Array.from(e.target.files)); // Convert FileList to array
  //   }
  // };

  // Image change handler (append new files instead of overwriting)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: "parking_photos" | "property_photos") => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (field === "parking_photos") setParkingFiles(prev => [...prev, ...filesArray]);
      if (field === "property_photos") setPropertyFiles(prev => [...prev, ...filesArray]);
    }
  };

// Video change handler (append new files instead of overwriting)
const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    const filesArray = Array.from(e.target.files);
    setVideoFiles(prev => [...prev, ...filesArray]);
  }
};

// Upload files to Supabase Storage and return their public URLs
const uploadFiles = async (files: File[], folder: string): Promise<string[]> => {
  try {
    const urls = await Promise.all(
      files.map(async (file) => {
        const filePath = `${folder}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images") // bucket name
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // getPublicUrl is synchronous (no await needed)
        const { data: urlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      })
    );

    return urls;
  } catch (err) {
    console.error("Error uploading files:", err);
    throw err; // let caller handle error
  }
};

  // ---- Handle change ----
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
  
    // fields that should be numbers
    const numericFields = new Set([
      "footfall_per_hour",
      "snack_spend",
      "store_size",
      "store_length",
      "store_width",
      "shutter_length",
      "shutter_width",
      "front_offset",
      "parking_capacity_2w",
      "parking_capacity_4w",
      "building_age",
      "rental_value",
    ]);
  
    let nextValue: any = value;
  
    if (numericFields.has(name)) {
      // allow empty while editing; otherwise coerce to number
      nextValue = value === "" ? "" : Number(value);
    } else if (type === "checkbox") {
      // if you ever add checkboxes, map to "yes"/"no"
      nextValue = (e.target as HTMLInputElement).checked ? "yes" : "no";
    }
  
    setFormData((prev) => {
      let updated = { ...prev, [name]: nextValue };
  
      // Auto-calc store size and model
      if (name === "store_length" || name === "store_width") {
        updated.store_size = (updated.store_length || 0) * (updated.store_width || 0);
  
        if (updated.store_size <= 50) {
          updated.store_model = "Nano Model";
        } else if (
          updated.store_size <= 200 &&
          updated.store_size > 50 &&
          updated.property_type === "open_plot"
        ) {
          updated.store_model = "Nano Mobile Model";
        } else if (updated.store_size > 200 && updated.store_size <= 350) {
          updated.store_model = "Express A Model";
        } else if (updated.store_size > 350 && updated.store_size <= 500) {
          updated.store_model = "Express B Model";
        } else if (updated.store_size > 500 && updated.store_size <= 750) {
          updated.store_model = "Plus A Model";
        } else if (updated.store_size > 750 && updated.store_size <= 1000) {
          updated.store_model = "Plus B Model";
        } else if (updated.store_size > 1000 && updated.store_size <= 1500) {
          updated.store_model = "May A Model";
        } else if (updated.store_size > 1500 && updated.store_size <= 2000) {
          updated.store_model = "May B Model";
        } else {
          updated.store_model = "Open Plot"; // fallback dynamic value
        }
      }
  
      return updated;
    });
  };
  
  // ---- Handle submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      console.log("Submitting data:", formData);
  
      // Upload files if any
      const propertyPhotosUrls = propertyFiles.length
      ? await uploadFiles(propertyFiles, "property_photos")
      : [];

    const parkingPhotosUrls = parkingFiles.length
      ? await uploadFiles(parkingFiles, "parking_photos")
      : [];

    const videoUrls = videoFiles.length
      ? await uploadFiles(videoFiles, "videos")
      : [];
  
      const { user_id, ...dataToSubmit } = formData;
  
      // Convert string values to appropriate types for database
      const payload = {
        ...dataToSubmit,
        user_id: user?.id,
        // Convert "yes"/"no" fields to boolean
        corner_peice: dataToSubmit.corner_peice === "yes",
        road_facing: dataToSubmit.road_facing === "yes",
        parking_availability: dataToSubmit.parking_availability === "yes",
        washroom: dataToSubmit.washroom === "yes",
        electricity: dataToSubmit.electricity === "yes",
        generator: dataToSubmit.generator === "yes",
        owner_contacted: dataToSubmit.owner_contacted === "yes",
        // File URLs
        property_photos: propertyPhotosUrls.length ? propertyPhotosUrls : null,
        parking_photos: parkingPhotosUrls.length ? parkingPhotosUrls : null,
        video: videoUrls.length ? videoUrls : null,
        // Arrays
        facilities: facilities.length ? facilities : null,
        advantages: advantages.length ? advantages : null,
      };
  
      // Insert into Supabase
      const { data, error } = await supabase.from("properties").insert([payload]);
      if (error) throw error;
  
      console.log("Inserted:", data);
  
      // ✅ if everything works
      onSuccess?.();
  
      // Reset form after successful submit
      setFormData({
        user_id: "",
        location: "",
        distance: "",
        footfall_per_hour: 0,
        snack_spend: 0,
        property_type: "",
        store_model: "",
        store_size: 0,
        store_length: 0,
        store_width: 0,
        road_facing: "",
        entry_direction: "",
        corner_peice: "",
        corner_side: "",
        store_position: "",
        shutter_length: 0,
        shutter_width: 0,
        front_offset: 0,
        setback: "",
        floor: "",
        parking_availability: "",
        parking_capacity_2w: 0,
        parking_capacity_4w: 0,
        washroom: "",
        electricity: "",
        generator: "",
        building_age: "",
        water: "",
        building_condition: "",
        landmark: "",
        owner_contacted: "",
        rental_value: 0,
        about_property: "",
        facilities: [],
        advantages: [],
        parking_photos: [] ,
        property_photos: [] ,
        video: [] ,
      });
      setPropertyFiles([]);
      setParkingFiles([]);
      setVideoFiles([]);
      setFacilities([]);
      setAdvantages([]);
    } catch (err) {
      console.error("Error submitting property:", err);
    } finally {
      setLoading(false);
    }
  };
  

  // ----Facilities Option------
  const toggleOptionFacilities = (facilities_option) => {
    setFacilities((prev) =>
      prev.includes(facilities_option)
        ? prev.filter((item) => item !== facilities_option) // remove if already selected
        : [...prev, facilities_option] // add if not selected
    );
  };
  //------Advantages Option-----------
  const toggleOptionAdvantages = (advantages_option) => {
    setAdvantages((prev) =>
      prev.includes(advantages_option)
        ? prev.filter((item) => item !== advantages_option) // remove if already selected
        : [...prev, advantages_option] // add if not selected
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/*First set of Data */}
      <div>
        <h3 className="block font-bold pl-2 mb-1 text-xl"> Core Location Data </h3>
        {/* <div>
          <label>User Id</label>
          <input type="string"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              placeholder="Enter the value of UserId"
              required
              disabled
            />
        </div> */}
        <div className="p-4 m-1 mt-3 border">
          Maps(Google Maps Pin)
        </div>
        <div className="p-4 m-1 mt-3 border">
          Input area (Auto calc. from central Kitchen)
        </div>

        <div className="grid grid-cols-2">
          <div className="m-2">
            <label> Footfall per Hour:</label>
            <input 
              type="number"
              name="footfall_per_hour"
              value={formData.footfall_per_hour === 0? "" : formData.footfall_per_hour}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              placeholder="Enter the value of Footfall per Hour"
              required
            />
          </div>
          <div className="m-2">
            <label> Spends on Snacks per Person:</label>
            <input 
              type="number"
              name="snack_spend"
              value={formData.snack_spend === 0? "" : formData.snack_spend}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              placeholder="Enter the value of Per Capita Spend on Snacks per person"
              required
            />
          </div>
        </div>
        <div className="my-6 h-2 w-full bg-gray-100 "></div> {/* Data Diving bar */}
      </div>

      {/*Second set of Data */}
      <div >
        <h2 className="block font-bold pl-2 mb-2 text-xl"> Physicial Details</h2>
        
        <div className="grid grid-cols-2">
          {/* Property Type */}
          <div className="mr-3">
            <label className="block pl-2 mb-1 font-medium">Property Type:</label>
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-white hover:bg-gray-100"
            >
              <option value="" disabled hidden>Select Type</option>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential</option>
              <option value="open_plot">Open Plot</option>
            </select>
          </div>

          {/* Store Size */}
          <div className="ml-3">
            <label className="block pl-2 mb-1 font-medium">Store Model:</label>
            <input 
              name="store_model"
              value={formData.store_model}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              placeholder="Auto calculated from dimension"
              disabled
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-3 mt-2">
          <div className="mr-3">
            <label className="block pl-2 mb-1 font-medium">Store Size(sq. ft.)</label>
            <input 
              type="number"
              name="store_size"
              value={formData.store_size === 0 ? "" : formData.store_size}
              onChange={handleChange}
              className="border rounded p-2 w-full mb-2"
              placeholder="Auto calculated from dimension"
              disabled
              required
            />
          </div>
          <div className="ml-4 col-span-2">
            <p className="block pl-2 mb-1 font-medium">Store Dimensions (in ft):</p>
            <div className="flex">
              <input type="number"
                name="store_length"
                value={formData.store_length === 0? "" : formData.store_length}
                onChange={handleChange}
                placeholder="Enter store length in ft."
                className="border rounded p-2 w-full mr-2 mb-2"
                required/>
              <input type="number"
                name="store_width"
                value={formData.store_width === 0? "" : formData.store_width}
                onChange={handleChange}
                placeholder="Enter store width in ft."
                className="border rounded p-2 w-full ml-2 mb-2"
                required/>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Road Facing */}
        <div className="mr-2">
          <label className="block bm-1 pl-2 font-medium"> Road Facing </label>
          <select
            name="road_facing"
            value={formData.road_facing}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="yes">Yes, It is road facing</option>
            <option value="no">No, it is not road facing</option>
          </select>
        </div>

        {/*Entry Direction*/}
        <div className="ml-4">
          <label className="block mb-1 pl-2 font-medium">Entry Direction</label>
          <select
            name="entry_direction"
            value={formData.entry_direction}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Select Direction</option>
            <option value="north">North Direction</option>
            <option value="south">South Direction</option>
            <option value="east">East Direction</option>
            <option value="west">West Direction</option>
          </select>
        </div>
      </div>
      {/*Corners*/}
      <div className="grid grid-cols-2">
        {/*Corner */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium"> Corner Peice </label>
          <select
            name="corner_peice"
            value={formData.corner_peice}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="yes">Yes, it is a corner piece</option>
            <option value="no">No, it is not a corner piece</option>
          </select>
        </div>

        {/*Corner Side*/}
        {formData.corner_peice === "yes" && (
          <div className="ml-3">
            <label className="block mb-2 pl-2 font-medium">Corner Side</label>
            <select
              name="corner_side"
              value={formData.corner_side}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-white hover:bg-gray-100"
            >
              <option value="">Select Direction</option>
              <option value="right">Corner Right</option>
              <option value="left">Corner Left</option>
            </select>
          </div>
        )}
      </div>

      {/*Store Type*/}
      <div className="grid grid-cols-3">
        {/*Store Type*/}
        <div className="mr-2">
          <label className="block bm-1 pl-2 font-medium"> Store Position </label>
          <select
            name="store_position"
            value={formData.store_position}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100"
          >
            <option value="" disabled hidden>Choose</option>
            <option value="corner">Corner</option>
            <option value="middle">Middle</option>
            <option value="standalone">Standalone</option>
          </select>
        </div>
        {/*Setback*/}
        <div className="ml-2 col-span-2">
          <label className="block pl-2 mb-1 font-medium"> Shutter Size (in ft):</label>
          <div className="flex">
            <input type="number"
              name="shutter_length"
              value={formData.shutter_length === 0 ? "" : formData.shutter_length}
              onChange={handleChange}
              placeholder="Enter shutter length in ft."
              className="border rounded p-2 w-full mr-2"
              required/>
            <input type="number"
              name="shutter_width"
              value={formData.shutter_width === 0 ? "" : formData.shutter_width}
              onChange={handleChange}
              placeholder="Enter shutter width in ft."
              className="border rounded p-2 w-full ml-2"
              required/>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Front Offset */}
        <div className="mr-3">
          <label className="block pl-2 mb-1  font-medium">Front Offset (in ft):</label>
          <input
            type="string"
            name="front_offset"
            value={formData.front_offset === 0? "" : formData.front_offset}
            onChange={handleChange}
            className="border rounded-md p-2 w-full"
            placeholder="Distance from road / visibility"
            required
          />
        </div>
        {/* Parking */}
        <div className="ml-3">
          <label className="block mb-1 pl-2 font-medium">Setback</label>
          <select
            name="setback"
            value={formData.setback}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="front">Front Setback</option>
            <option value="rear">Rear Setback</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Floor */}
        <div className="mr-3">
          <label className="block pl-2 mb-1  font-medium">Floor</label>
          <input
            type="string"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            className="border rounded-md p-2 w-full"
            placeholder="Enter Floor Value, Ex: Ground, First, etc.. "
            required
          />
        </div>
        {/* Rental Value */}
        <div className="ml-2">
          <label className="block mb-1 pl-2 font-medium">Rental Value</label>
          <input
            type="number"
            name="rental_value"
            value={formData.rental_value === 0 ? "" : formData.rental_value}
            onChange={handleChange}
            placeholder="The rent yield must be entered here"
            className="w-full p-2 border rounded-md hover:bg-gray-100 "
          />
        </div>
        
      </div>
      <div className="grid grid-cols-3">
        {/* Parking */}
        <div className="mr-2">
          <label className="block mb-1 pl-2 font-medium">Parking Availability</label>
          <select
            name="parking_availability"
            value={formData.parking_availability}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="yes">Yes, It is available.</option>
            <option value="no">No, It is not available</option>
          </select>
        </div>
        {/*Parking Count*/}
        {formData.parking_availability === "yes" && (
          <div className="ml-2">
            <label className="block mb-1 pl-2 font-medium">Parking Capacity</label>
            <div className="grid grid-cols-2 pr-5">
              <input type="string"
              name="parking_capacity_2w"
              value={formData.parking_capacity_2w === 0 ? "" : formData.parking_capacity_2w}
              onChange={handleChange}
              className="border rounded p-2 w-full "
              placeholder="2W Capacity"
              required/>
              <input type="string"
              name="parking_capacity_4w"
              value={formData.parking_capacity_4w === 0 ? "" : formData.parking_capacity_4w}
              onChange={handleChange}
              className="border rounded p-2 w-full ml-3"
              placeholder="4W Capacity"
              required/>
            </div>
          </div>
        )}
         {/* Owner Contact */}
         <div className="mr-2">
          <label className="block mb-1 pl-2 font-medium">Owner Contacted </label>
          <select
            name="owner_contacted"
            value={formData.owner_contacted}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="yes">Yes, Owner has been contacted</option>
            <option value="no">No, Owner has not been contacted</option>
          </select>
        </div>

        
      </div>
      {/*Misc Data */}
      <div className="grid grid-cols-3">
        {/* Washroom */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium"> Washroom Availability</label>
          <select
            name="washroom"
            value={formData.washroom}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 mb-2"
          >
            <option value="" disabled hidden>Choose</option>
            <option value="yes">Yes, it is available</option>
            <option value="no">No, it is not available</option>
          </select>
        </div>
        {/* Electricity */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium"> Electricity Availability </label>
          <select
            name="electricity"
            value={formData.electricity}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 mb-2"
          >
            <option value="" disabled hidden>Choose</option>
            <option value="yes">Yes, it is available</option>
            <option value="no">No, it is not available</option>
          </select>
        </div>
        {/* Generator */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium"> Generator Availability </label>
          <select
            name="generator"
            value={formData.generator}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 mb-2"
          >
            <option value="" disabled hidden>Choose</option>
            <option value="yes">Yes, it is available</option>
            <option value="no">No, it is not available</option>
          </select>
        </div>
        {/* Age */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium"> Building Age </label>
          <select
            name="building_age"
            value={formData.building_age}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="new">New Building</option>
            <option value="less_than_5">Less than 5 years old</option>
            <option value="between_5_to_10">Between 5 to 10 years old</option>
            <option value="greater_than_10">Greater than 10 years old</option>
          </select>
        </div>
        {/* Water */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium"> Water Supply </label>
          <select
            name="water"
            value={formData.water}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="municipal">Municipal</option>
            <option value="borewell">Borewell</option>
            <option value="none">None</option>
          </select>
        </div>
        {/* Condition */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium"> Building Condition </label>
          <select
            name="building_condition"
            value={formData.building_condition}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="new">New Building</option>
            <option value="old">Old Building</option>
          </select>
        </div>
      </div>

      {/* Landmark */}
      <div>
        <label className="block mb-1 pl-2 font-medium">Landmark:</label>
        <input
          type="text"
          placeholder="Landmark of the location"
          name="landmark"
          value={formData.landmark}
          onChange={handleChange}
          className="w-full p-2 border rounded-md hover:bg-gray-100 "
        />
      </div>      

      {/*Integration with google Maps*/}
      <div>
        {/* Maps Api */}
        {/* <label className="block mb-1 pl-2 font-medium">Location</label>
        <input
          type="text"
          name="location"
          placeholder="location uploads here"
          disabled
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 border rounded-md hover:bg-gray-100 "
        /> */}
      </div>

      <div className="grid grid-cols-2">
       
      </div>


      {/* About Property */}
      <div className="p-2">
        <label className="block mb-1 pl-2 font-medium">About Property</label>
        <textarea
          name="about_property"
          placeholder="Enter a small description about the place"
          value={formData.about_property}
          onChange={handleChange}
          className="w-full p-2 border rounded-md hover:bg-gray-100 "
        />
      </div>
      <div className="my-6 h-2 w-full bg-gray-100 "></div>{/* Data Diving bar */}
      
      <div className="p-1">
        <h2 className="block font-bold pl-2 mb-3 text-xl">Media Details</h2>

        {/* <div
          className={`grid gap-4 ${
            formData.parking_availability === "yes" ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          Property Photos
          <div>
            <label htmlFor="property_photos" className="block pl-2 font-medium">
              Property Photos
            </label>
            <input
              id="property_photos"
              type="file"
              accept="image/*"
              multiple
              className="w-full p-2 rounded-md border"
              onChange={(e) => handleImageChange(e, "property_photos")}
            />
          </div> */}

          {/* Parking Photos */}
          {/* {formData.parking_availability === "yes" && (
            <div>
              <label htmlFor="parking_photos" className="block pl-2 font-medium">
                Parking Pictures
              </label>
              <input
                id="parking_photos"
                type="file"
                accept="image/*"
                multiple
                className="w-full p-2 rounded-md border"
                onChange={(e) => handleImageChange(e, "parking_photos")}
              />
            </div>
          )} */}

          {/* Video Upload */}
          {/* <div>
            <label htmlFor="video_upload" className="block pl-2 font-medium">
              Video
            </label>
            <input
              id="video_upload"
              type="file"
              accept="video/*"
              className="w-full p-2 rounded-md border"
              onChange={handleVideoChange}
            />
          </div> */}
        {/* </div> */}
      </div>


      <div className="my-6 h-2 w-full bg-gray-100 "></div>{/* Data Diving bar */}

      <div className="p-1">
        <h2 className="block font-bold pl-2 mb-3 text-xl"> Misc. Details</h2>
        <div>
          <label className="block pl-2 font-medium">Neighbourhood Facilities <span className="text-xs">(Select all that apply)</span></label> 
          <div className="grid grid-cols-2 gap-2 p-2">
            {facilities_option.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50 mt-1"
              >
                <input
                  type="checkbox"
                  checked={facilities.includes(opt)}
                  onChange={() => toggleOptionFacilities(opt)}
                  className="w-4 h-4 rounded-sm"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-2 ">
          <label className="block pl-2 font-medium">Location Advantages <span className="text-xs">(Select all that apply)</span></label> 
          <div className="grid grid-cols-2 gap-2 p-2">
            {advantages_option.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50 mt-1"
              >
                <input
                  type="checkbox"
                  checked={advantages.includes(opt)}
                  onChange={() => toggleOptionAdvantages(opt)}
                  className="w-4 h-4 rounded-sm"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </div>
      {/* Buttons */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          // onClick={handleSubmit}
        >
          
          {loading ? "Saving..." : "Save Property"}
        </button>
      </div>
    </form>
  );
}
function onSuccess() {
  throw new Error("Function not implemented.");
}

