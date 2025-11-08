import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

export interface PropertyFormData {
  agentId: number;
  managerId: number;
  footfall: number;
  snackSpend: number;
  propertyType: string;
  storeModel: string;
  storeSize: number;
  storeDimensionsL: number;
  storeDimensionsW: number;
  roadFacing: string;
  entryDirection: string;
  cornerPiece: string;
  cornerSide: string;
  storePosition: string;
  shutterL: number;
  shutterW: number;
  frontOffset: number;
  setback: string;
  floor: string;
  rentalValue: number;
  parkingAvailability: string;
  twoWCapacity: number;
  fourWCapacity: number;
  ownerContacted: boolean;
  washroom: boolean;
  electricity: boolean;
  generator: boolean;
  buildingAge: string;
  waterSupply: boolean;
  buildingCondition: string;
  landmark: string;
  aboutProperty: string;
  neighbourhoodFacilities: string;
  locationAdvantages: string;
  status: string;
}

interface ManagerInfo {
  managerId: number;
  managerFirstName: string;
  managerLastName: string;
  managerEmail: string;
  teamId: number;
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
    agentId: user?.userId || 0,
    managerId: 0,
    footfall: 0,
    snackSpend: 0,
    propertyType: "",
    storeModel: "",
    storeSize: 0,
    storeDimensionsL: 0,
    storeDimensionsW: 0,
    roadFacing: "",
    entryDirection: "",
    cornerPiece: "",
    cornerSide: "",
    storePosition: "",
    shutterL: 0,
    shutterW: 0,
    frontOffset: 0,
    setback: "",
    floor: "",
    rentalValue: 0,
    parkingAvailability: "",
    twoWCapacity: 0,
    fourWCapacity: 0,
    ownerContacted: false,
    washroom: false,
    electricity: false,
    generator: false,
    buildingAge: "",
    waterSupply: false,
    buildingCondition: "",
    landmark: "",
    aboutProperty: "",
    neighbourhoodFacilities: "",
    locationAdvantages: "",
    status: "PENDING"
  });

  const [loading, setLoading] = useState(false);
  const [managerInfo, setManagerInfo] = useState<ManagerInfo[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [advantages, setAdvantages] = useState<string[]>([]);
  const [parkingFiles, setParkingFiles] = useState<File[]>([]);
  const [propertyFiles, setPropertyFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [error, setError] = useState("");

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

  const getAgentId = () => {
    try {
      const userStr = localStorage.getItem('user'); // or whatever key you used
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.userId;
      }
      return 0;
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
      return 0;
    }
  };

  // Get logged-in agent ID from localStorage
  const agentId = getAgentId();

  useEffect(() => {
    const fetchManagerInfo = async () => {
      if (!agentId || agentId === 0) {
        setError('Agent ID not found. Please login again.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8090/team_members/agent/${agentId}/manager-info`
        );
        
        setManagerInfo(response.data);
        setFormData(prev => ({
          ...prev,
          managerId: response.data.managerId,
          agentId: agentId
        }));
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching manager info:', err);
        const errorMessage = err.response?.data?.error || 'Failed to fetch manager information';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchManagerInfo();
  }, [agentId]);

  const handleManagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'managerId' ? parseInt(value) : value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading manager information...</div>
      </div>
    );
  }

  // Image change handler
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "parking_photos" | "property_photos"
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (field === "parking_photos") setParkingFiles(prev => [...prev, ...filesArray]);
      if (field === "property_photos") setPropertyFiles(prev => [...prev, ...filesArray]);
    }
  };

  // Video change handler
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  // Handle change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    const numericFields = new Set([
      "footfall",
      "snackSpend",
      "storeSize",
      "storeDimensionsL",
      "storeDimensionsW",
      "shutterL",
      "shutterW",
      "frontOffset",
      "twoWCapacity",
      "fourWCapacity",
      "rentalValue",
      "managerId",
    ]);

    const booleanFields = new Set([
      "ownerContacted",
      "washroom",
      "electricity",
      "generator",
      "waterSupply",
    ]);

    let nextValue: any = value;

    if (numericFields.has(name)) {
      nextValue = value === "" ? 0 : Number(value);
    } else if (booleanFields.has(name)) {
      nextValue = value === "yes";
    }

    setFormData((prev) => {
      let updated = { ...prev, [name]: nextValue };

      // Auto-calc store size and model
      if (name === "storeDimensionsL" || name === "storeDimensionsW") {
        updated.storeSize = (updated.storeDimensionsL || 0) * (updated.storeDimensionsW || 0);

        if (updated.storeSize <= 50) {
          updated.storeModel = "Nano Model";
        } else if (
          updated.storeSize <= 200 &&
          updated.storeSize > 50 &&
          updated.propertyType === "open_plot"
        ) {
          updated.storeModel = "Nano Mobile Model";
        } else if (updated.storeSize > 200 && updated.storeSize <= 350) {
          updated.storeModel = "Express A Model";
        } else if (updated.storeSize > 350 && updated.storeSize <= 500) {
          updated.storeModel = "Express B Model";
        } else if (updated.storeSize > 500 && updated.storeSize <= 750) {
          updated.storeModel = "Plus A Model";
        } else if (updated.storeSize > 750 && updated.storeSize <= 1000) {
          updated.storeModel = "Plus B Model";
        } else if (updated.storeSize > 1000 && updated.storeSize <= 1500) {
          updated.storeModel = "May A Model";
        } else if (updated.storeSize > 1500 && updated.storeSize <= 2000) {
          updated.storeModel = "May B Model";
        } else {
          updated.storeModel = "Open Plot";
        }
      }

      return updated;
    });
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.managerId === 0) {
      alert("Please select a manager");
      return;
    }
    
    setLoading(true);

    try {
      console.log("Submitting property data...");

      // Step 1: Create property with JSON data only
      const propertyPayload = {
        agent: { userId: formData.agentId },
        manager: { userId: formData.managerId },
        footfall: formData.footfall,
        snackSpend: formData.snackSpend,
        propertyType: formData.propertyType,
        storeModel: formData.storeModel,
        storeSize: formData.storeSize,
        storeDimensionsL: formData.storeDimensionsL,
        storeDimensionsW: formData.storeDimensionsW,
        roadFacing: formData.roadFacing,
        entryDirection: formData.entryDirection,
        cornerPiece: formData.cornerPiece,
        cornerSide: formData.cornerSide,
        storePosition: formData.storePosition,
        shutterL: formData.shutterL,
        shutterW: formData.shutterW,
        frontOffset: formData.frontOffset,
        setback: formData.setback,
        floor: formData.floor,
        rentalValue: formData.rentalValue,
        parkingAvailability: formData.parkingAvailability,
        twoWCapacity: formData.twoWCapacity,
        fourWCapacity: formData.fourWCapacity,
        ownerContacted: formData.ownerContacted,
        washroom: formData.washroom,
        electricity: formData.electricity,
        generator: formData.generator,
        buildingAge: formData.buildingAge,
        waterSupply: formData.waterSupply,
        buildingCondition: formData.buildingCondition,
        landmark: formData.landmark,
        aboutProperty: formData.aboutProperty,
        neighbourhoodFacilities: facilities.join(", "),
        locationAdvantages: advantages.join(", "),
        status: formData.status,
      };

      const propertyResponse = await fetch("http://localhost:8090/properties/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(propertyPayload),
        credentials: "include",
      });

      if (!propertyResponse.ok) {
        const errorText = await propertyResponse.text();
        throw new Error(`Failed to create property: ${errorText}`);
      }

      const createdProperty = await propertyResponse.json();
      const propertyId = createdProperty.propertyId;

      console.log("Property created successfully:", createdProperty);

      // Step 2: Upload property images if any
      if (propertyFiles.length > 0) {
        const propertyImagesFormData = new FormData();
        propertyFiles.forEach((file) => {
          propertyImagesFormData.append("images", file);
        });

        const imagesResponse = await fetch(
          `http://localhost:8090/properties/${propertyId}/images/property`,
          {
            method: "POST",
            body: propertyImagesFormData,
            credentials: "include",
          }
        );

        if (!imagesResponse.ok) {
          console.error("Failed to upload property images");
        }
      }

      // Step 3: Upload parking images if any
      if (parkingFiles.length > 0) {
        const parkingImagesFormData = new FormData();
        parkingFiles.forEach((file) => {
          parkingImagesFormData.append("images", file);
        });

        const parkingResponse = await fetch(
          `http://localhost:8090/properties/${propertyId}/images/parking`,
          {
            method: "POST",
            body: parkingImagesFormData,
            credentials: "include",
          }
        );

        if (!parkingResponse.ok) {
          console.error("Failed to upload parking images");
        }
      }

      // Step 4: Upload video if any
      if (videoFile) {
        const videoFormData = new FormData();
        videoFormData.append("video", videoFile);

        const videoResponse = await fetch(
          `http://localhost:8090/properties/${propertyId}/video`,
          {
            method: "POST",
            body: videoFormData,
            credentials: "include",
          }
        );

        if (!videoResponse.ok) {
          console.error("Failed to upload video");
        }
      }

      // Success callback
      onSuccess?.();

      // Reset form
      setFormData({
        agentId: user?.userId || 0,
        managerId: 0,
        footfall: 0,
        snackSpend: 0,
        propertyType: "",
        storeModel: "",
        storeSize: 0,
        storeDimensionsL: 0,
        storeDimensionsW: 0,
        roadFacing: "",
        entryDirection: "",
        cornerPiece: "",
        cornerSide: "",
        storePosition: "",
        shutterL: 0,
        shutterW: 0,
        frontOffset: 0,
        setback: "",
        floor: "",
        rentalValue: 0,
        parkingAvailability: "",
        twoWCapacity: 0,
        fourWCapacity: 0,
        ownerContacted: false,
        washroom: false,
        electricity: false,
        generator: false,
        buildingAge: "",
        waterSupply: false,
        buildingCondition: "",
        landmark: "",
        aboutProperty: "",
        neighbourhoodFacilities: "",
        locationAdvantages: "",
        status: "PENDING",
      });
      setPropertyFiles([]);
      setParkingFiles([]);
      setVideoFile(null);
      setFacilities([]);
      setAdvantages([]);
    } catch (err) {
      console.error("Error submitting property:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  // Facilities toggle
  const toggleOptionFacilities = (option: string) => {
    setFacilities((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  // Advantages toggle
  const toggleOptionAdvantages = (option: string) => {
    setAdvantages((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Core Location Data */}
      <div>
        <h3 className="block font-bold pl-2 mb-1 text-xl">Core Location Data</h3>
        
        {/* Manager Selection */}
        <div className="m-2">
          <label className="block pl-2 mb-1 font-medium">Assigned Manager:</label>
          <input
            type="number"
            name="managerId"
            value={formData.managerId === 0 ? "" : formData.managerId}
            onChange={handleManagerChange}
            className="border rounded p-2 w-full"
            placeholder="Enter Manager ID"
            required
            readOnly
            hidden
          />
          {managerInfo && (
            <p className="text-sm text-gray-600 mt-1 pl-2">
              👤 Manager: {managerInfo.managerFirstName} {managerInfo.managerLastName}
            </p>
          )}
          {error && (
            <p className="text-red-500 text-sm mt-1 pl-2">{error}</p>
          )}
        </div>

        <div className="p-4 m-1 mt-3 border">Maps (Google Maps Pin)</div>
        <div className="p-4 m-1 mt-3 border">
          Input area (Auto calc. from central Kitchen)
        </div>

        <div className="grid grid-cols-2">
          <div className="m-2">
            <label>Footfall per Hour:</label>
            <input
              type="number"
              name="footfall"
              value={formData.footfall === 0 ? "" : formData.footfall}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              placeholder="Enter the value of Footfall per Hour"
              required
            />
          </div>
          <div className="m-2">
            <label>Spends on Snacks per Person:</label>
            <input
              type="number"
              name="snackSpend"
              value={formData.snackSpend === 0 ? "" : formData.snackSpend}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              placeholder="Enter the value of Per Capita Spend on Snacks per person"
              required
            />
          </div>
        </div>
        <div className="my-6 h-2 w-full bg-gray-100"></div>
      </div>

      {/* Physical Details */}
      <div>
        <h2 className="block font-bold pl-2 mb-2 text-xl">Physical Details</h2>

        <div className="grid grid-cols-2">
          {/* Property Type */}
          <div className="mr-3">
            <label className="block pl-2 mb-1 font-medium">Property Type:</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-white hover:bg-gray-100"
              required
            >
              <option value="" disabled hidden>
                Select Type
              </option>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential</option>
              <option value="open_plot">Open Plot</option>
            </select>
          </div>

          {/* Store Model */}
          <div className="ml-3">
            <label className="block pl-2 mb-1 font-medium">Store Model:</label>
            <input
              name="storeModel"
              value={formData.storeModel}
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
            <label className="block pl-2 mb-1 font-medium">Store Size (sq. ft.)</label>
            <input
              type="number"
              name="storeSize"
              value={formData.storeSize === 0 ? "" : formData.storeSize}
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
              <input
                type="number"
                name="storeDimensionsL"
                value={formData.storeDimensionsL === 0 ? "" : formData.storeDimensionsL}
                onChange={handleChange}
                placeholder="Enter store length in ft."
                className="border rounded p-2 w-full mr-2 mb-2"
                required
              />
              <input
                type="number"
                name="storeDimensionsW"
                value={formData.storeDimensionsW === 0 ? "" : formData.storeDimensionsW}
                onChange={handleChange}
                placeholder="Enter store width in ft."
                className="border rounded p-2 w-full ml-2 mb-2"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Road Facing */}
        <div className="mr-2">
          <label className="block bm-1 pl-2 font-medium">Road Facing</label>
          <select
            name="roadFacing"
            value={formData.roadFacing}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="yes">Yes, It is road facing</option>
            <option value="no">No, it is not road facing</option>
          </select>
        </div>

        {/* Entry Direction */}
        <div className="ml-4">
          <label className="block mb-1 pl-2 font-medium">Entry Direction</label>
          <select
            name="entryDirection"
            value={formData.entryDirection}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white hover:bg-gray-100"
            required
          >
            <option value="" disabled hidden>
              Select Direction
            </option>
            <option value="north">North Direction</option>
            <option value="south">South Direction</option>
            <option value="east">East Direction</option>
            <option value="west">West Direction</option>
          </select>
        </div>
      </div>

      {/* Corners */}
      <div className="grid grid-cols-2">
        {/* Corner */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium">Corner Piece</label>
          <select
            name="cornerPiece"
            value={formData.cornerPiece}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="yes">Yes, it is a corner piece</option>
            <option value="no">No, it is not a corner piece</option>
          </select>
        </div>

        {/* Corner Side */}
        {formData.cornerPiece === "yes" && (
          <div className="ml-3">
            <label className="block mb-2 pl-2 font-medium">Corner Side</label>
            <select
              name="cornerSide"
              value={formData.cornerSide}
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

      {/* Store Type */}
      <div className="grid grid-cols-3">
        {/* Store Position */}
        <div className="mr-2">
          <label className="block bm-1 pl-2 font-medium">Store Position</label>
          <select
            name="storePosition"
            value={formData.storePosition}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="corner">Corner</option>
            <option value="middle">Middle</option>
            <option value="standalone">Standalone</option>
          </select>
        </div>

        {/* Shutter Size */}
        <div className="ml-2 col-span-2">
          <label className="block pl-2 mb-1 font-medium">Shutter Size (in ft):</label>
          <div className="flex">
            <input
              type="number"
              name="shutterL"
              value={formData.shutterL === 0 ? "" : formData.shutterL}
              onChange={handleChange}
              placeholder="Enter shutter length in ft."
              className="border rounded p-2 w-full mr-2"
              required
            />
            <input
              type="number"
              name="shutterW"
              value={formData.shutterW === 0 ? "" : formData.shutterW}
              onChange={handleChange}
              placeholder="Enter shutter width in ft."
              className="border rounded p-2 w-full ml-2"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Front Offset */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium">Front Offset (in ft):</label>
          <input
            type="number"
            name="frontOffset"
            value={formData.frontOffset === 0 ? "" : formData.frontOffset}
            onChange={handleChange}
            className="border rounded-md p-2 w-full"
            placeholder="Distance from road / visibility"
            required
          />
        </div>

        {/* Setback */}
        <div className="ml-3">
          <label className="block mb-1 pl-2 font-medium">Setback</label>
          <select
            name="setback"
            value={formData.setback}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white hover:bg-gray-100"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="front">Front Setback</option>
            <option value="rear">Rear Setback</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Floor */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium">Floor</label>
          <input
            type="text"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            className="border rounded-md p-2 w-full"
            placeholder="Enter Floor Value, Ex: Ground, First, etc.."
            required
          />
        </div>

        {/* Rental Value */}
        <div className="ml-2">
          <label className="block mb-1 pl-2 font-medium">Rental Value</label>
          <input
            type="number"
            name="rentalValue"
            value={formData.rentalValue === 0 ? "" : formData.rentalValue}
            onChange={handleChange}
            placeholder="The rent yield must be entered here"
            className="w-full p-2 border rounded-md hover:bg-gray-100"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3">
        {/* Parking Availability */}
        <div className="mr-2">
          <label className="block mb-1 pl-2 font-medium">Parking Availability</label>
          <select
            name="parkingAvailability"
            value={formData.parkingAvailability}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white hover:bg-gray-100"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="yes">Yes, It is available.</option>
            <option value="no">No, It is not available</option>
          </select>
        </div>

        {/* Parking Capacity */}
        {formData.parkingAvailability === "yes" && (
          <div className="ml-2">
            <label className="block mb-1 pl-2 font-medium">Parking Capacity</label>
            <div className="grid grid-cols-2 pr-5">
              <input
                type="number"
                name="twoWCapacity"
                value={formData.twoWCapacity === 0 ? "" : formData.twoWCapacity}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                placeholder="2W Capacity"
                required
              />
              <input
                type="number"
                name="fourWCapacity"
                value={formData.fourWCapacity === 0 ? "" : formData.fourWCapacity}
                onChange={handleChange}
                className="border rounded p-2 w-full ml-3"
                placeholder="4W Capacity"
                required
              />
            </div>
          </div>
        )}

        {/* Owner Contacted */}
        <div className="mr-2">
          <label className="block mb-1 pl-2 font-medium">Owner Contacted</label>
          <select
            name="ownerContacted"
            value={formData.ownerContacted ? "yes" : "no"}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white hover:bg-gray-100"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="yes">Yes, Owner has been contacted</option>
            <option value="no">No, Owner has not been contacted</option>
          </select>
        </div>
      </div>

      {/* Misc Data */}
      <div className="grid grid-cols-3">
        {/* Washroom */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium">Washroom Availability</label>
          <select
            name="washroom"
            value={formData.washroom ? "yes" : "no"}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 mb-2"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="yes">Yes, it is available</option>
            <option value="no">No, it is not available</option>
          </select>
        </div>

        {/* Electricity */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium">Electricity Availability</label>
          <select
            name="electricity"
            value={formData.electricity ? "yes" : "no"}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 mb-2"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="yes">Yes, it is available</option>
            <option value="no">No, it is not available</option>
          </select>
        </div>

        {/* Generator */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium">Generator Availability</label>
          <select
            name="generator"
            value={formData.generator ? "yes" : "no"}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 mb-2"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="yes">Yes, it is available</option>
            <option value="no">No, it is not available</option>
          </select>
        </div>

        {/* Building Age */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium">Building Age</label>
          <select
            name="buildingAge"
            value={formData.buildingAge}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="new">New Building</option>
            <option value="less_than_5">Less than 5 years old</option>
            <option value="between_5_to_10">Between 5 to 10 years old</option>
            <option value="greater_than_10">Greater than 10 years old</option>
          </select>
        </div>

        {/* Water Supply */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium">Water Supply</label>
          <select
            name="waterSupply"
            value={formData.waterSupply ? "yes" : "no"}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="yes">Available</option>
            <option value="no">Not Available</option>
          </select>
        </div>

        {/* Building Condition */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium">Building Condition</label>
          <select
            name="buildingCondition"
            value={formData.buildingCondition}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100"
            required
          >
            <option value="" disabled hidden>
              Choose
            </option>
            <option value="new_building">New Building</option>
            <option value="old_building">Old Building</option>
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
          className="w-full p-2 border rounded-md hover:bg-gray-100"
        />
      </div>
      {/* About Property */}
      <div className="p-2">
        <label className="block mb-1 pl-2 font-medium">About Property</label>
        <textarea
          name="aboutProperty"
          placeholder="Enter a small description about the place"
          value={formData.aboutProperty}
          onChange={handleChange}
          className="w-full p-2 border rounded-md hover:bg-gray-100"
          rows={4}
        />
      </div>

      <div className="my-6 h-2 w-full bg-gray-100"></div>

      {/* Media Details */}
      <div className="p-1">
        <h2 className="block font-bold pl-2 mb-3 text-xl">Media Details</h2>

        <div
          className={`grid gap-4 ${
            formData.parkingAvailability === "yes" ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          {/* Property Photos */}
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
            {propertyFiles.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {propertyFiles.length} file(s) selected
              </p>
            )}
          </div>

          {/* Parking Photos */}
          {formData.parkingAvailability === "yes" && (
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
              {parkingFiles.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {parkingFiles.length} file(s) selected
                </p>
              )}
            </div>
          )}

          {/* Video Upload */}
          <div>
            <label htmlFor="video_upload" className="block pl-2 font-medium">
              Video (Single file)
            </label>
            <input
              id="video_upload"
              type="file"
              accept="video/*"
              className="w-full p-2 rounded-md border"
              onChange={handleVideoChange}
            />
            {videoFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {videoFile.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="my-6 h-2 w-full bg-gray-100"></div>

      {/* Misc. Details */}
      <div className="p-1">
        <h2 className="block font-bold pl-2 mb-3 text-xl">Misc. Details</h2>

        {/* Neighbourhood Facilities */}
        <div>
          <label className="block pl-2 font-medium">
            Neighbourhood Facilities{" "}
            <span className="text-xs">(Select all that apply)</span>
          </label>
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

        {/* Location Advantages */}
        <div className="mt-2">
          <label className="block pl-2 font-medium">
            Location Advantages{" "}
            <span className="text-xs">(Select all that apply)</span>
          </label>
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
          <button
            type="button"
            onClick={onCancel}
            className="border px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Property"}
        </button>
      </div>
    </form>
  );
};