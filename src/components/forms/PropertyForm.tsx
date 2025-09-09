import React, { useState } from "react";

// const [images, setImages] = useState<File[]>([]);

export interface PropertyFormData {
  snack_spend: number ;
  store_size: number ;
  length:  number ;
  width:  number ;
  store_model: string ;
  store_type: string ;
  shutter_length: number ;
  shutter_width: number ;
  front_offset: number ;
  setback: number ;
  parking_capacity_2w: number;
  parking_capacity_4w: number;
  washroom: string ;
  electricity: string ;
  genrator: string ;
  age: number ;
  water: string ;
  condition: string ;
  landmark: string ;
  property_type: string;
  property_size: string;
  floor: string;
  road_facing: string;
  entry_direction: string;
  corner: string;
  corner_side: string;
  parking: string;
  parking_photos: File[];
  front_entry: string;
  rear_entry: string;
  property_photos: File[];
  video: string;
  location: string;
  owner_contacted: string;
  rental_value: number;
  building_age: number;
  about_property: string;
  footfall: number;
  address:string;

}

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PropertyForm({ onSubmit, onSuccess }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    snack_spend: 0,
    store_size: 0,
    length: 0,
    width: 0,
    store_model: "",
    store_type: "",
    shutter_length: 0,
    shutter_width: 0,
    front_offset: 0,
    setback: 0,
    parking_capacity_2w: 0,
    parking_capacity_4w: 0,
    washroom: "",
    electricity: "",
    genrator: "",
    age: 0,
    water: "",
    condition: "",
    landmark: "",
    property_type: "",
    property_size: "",
    floor: "",
    road_facing: "",
    entry_direction: "",
    corner: "",
    corner_side: "",
    parking: "",
    parking_photos: [],
    front_entry: "",
    rear_entry: "",
    property_photos: [],
    video: "",
    location: "",
    owner_contacted: "",
    rental_value: 0,
    building_age: 0,
    about_property: "",
    footfall: 0,
    address: "",
    
  });

  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);

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
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "parking_photos" | "property_photos"
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        [field]: filesArray,
      }));
    }
  };

  const handleVideoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "parking_videos" | "property_videos"
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        [field]: filesArray,
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // fields that should be numbers
    const numericFields = new Set(["rental_value", "building_age", "footfall"]);

    let nextValue: any = value;

    if (numericFields.has(name)) {
      // allow empty while editing; otherwise coerce to number
      nextValue = value === "" ? "" : Number(value);
    } else if (type === "checkbox") {
      // if you ever add checkboxes, map to "yes"/"no"
      nextValue = (e.target as HTMLInputElement).checked ? "yes" : "no";
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData); // call the parent handler
      if (onSuccess) onSuccess();
       // Reset form after successful submit
       setFormData({
        snack_spend: 0,
        store_size: 0,
        length: 0,
        width: 0,
        store_model: "",
        store_type: "",
        shutter_length: 0,
        shutter_width: 0,
        front_offset: 0,
        setback: 0,
        parking_capacity_2w: 0,
        parking_capacity_4w: 0,
        washroom: "",
        electricity: "",
        genrator: "",
        age: 0,
        water: "",
        condition: "",
        landmark: "",
        property_type: "",
        property_size: "",
        floor: "",
        road_facing: "",
        entry_direction: "",
        corner: "",
        corner_side: "",
        parking: "",
        parking_photos: [],
        front_entry: "",
        rear_entry: "",
        property_photos: [],
        video: "",
        location: "",
        owner_contacted: "",
        rental_value: 0,
        building_age: 0,
        about_property: "",
        footfall: 0,
        address: "",
       });
    } catch (err) {
      console.error("Error submitting property:", err);
      setLoading(false);
    }
    // } catch (error) {
    //   console.error("Error submitting property:", error);
      
    // }
  };
  const toggleOption = (facilities_option) => {
    setFacilities((prev) =>
      prev.includes(facilities_option)
        ? prev.filter((item) => item !== facilities_option) // remove if already selected
        : [...prev, facilities_option] // add if not selected
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/*First set of Data */}
      <div>
        <h3 className="block font-bold pl-2 mb-1 text-xl"> Core Location Data </h3>
        
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
              name="footfall"
              value={formData.footfall}
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
              value={formData.snack_spend}
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
        <h2 className="block font-bold pl-2 mb-3 text-xl"> Physicial Details</h2>
        
        <div className="grid grid-cols-3">
          <div className="mr-3">
            <label className="block pl-2 mb-1 font-medium">Store Size(sq. ft.)</label>
            <input 
              type="number"
              name="floostore_size"
              value={formData.store_size}
              onChange={handleChange}
              className="border rounded p-2 w-full mb-2"
              placeholder="Auto calculated from dimension"
              disabled
              required
            />
          </div>
          <div className="ml-4 col-span-2">
            <p className="block pl-2 mb-1 font-medium">Store Dimensions:</p>
            <div className="flex">
              <input type="number"
                name="floostore_length"
                value={formData.length}
                onChange={handleChange}
                placeholder="Enter store length in ft."
                className="border rounded p-2 w-full mr-2 mb-2"
                required/>
              <input type="number"
                name="floostore_width"
                value={formData.width}
                onChange={handleChange}
                placeholder="Enter store width in ft."
                className="border rounded p-2 w-full ml-2 mb-2"
                required/>
            </div>
          </div>
          
        </div>
        
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
            {/* <select
              name="property_size"
              value={formData.property_size}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-white hover:bg-gray-100 "
            >
              <option value="">Select Size</option>
              <option value="50_sqft">50 sqft</option>
              <option value="200_sqft_open">200 sqft Open Field</option>
              <option value="200_sqft">200 sqft</option>
              <option value="350_sqft">350 sqft</option>
              <option value="400_sqft">400 sqft</option>
              <option value="600_sqft">600 sqft</option>
            </select> */}
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
            name="corner"
            value={formData.corner}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="yes">Yes, it is a corner piece</option>
            <option value="no">No, it is not a corner piece</option>
          </select>
        </div>

        {/*Corner Side*/}
        {formData.corner === "yes" && (
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
          <label className="block bm-1 pl-2 font-medium"> Store Type </label>
          <select
            name="store_type"
            value={formData.store_type}
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
          <label className="block pl-2 mb-1 font-medium"> Shutter Size:</label>
          <div className="flex">
            <input type="number"
              name="shutter_length"
              value={formData.shutter_length}
              onChange={handleChange}
              placeholder="Enter shutter length in ft."
              className="border rounded p-2 w-full mr-2"
              required/>
            <input type="number"
              name="shutter_width"
              value={formData.shutter_width}
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
          <label className="block pl-2 mb-1  font-medium">Front Offset</label>
          <input
            type="string"
            name="front_offset"
            value={formData.front_offset}
            onChange={handleChange}
            className="border rounded p-2 w-full"
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
            <option value="yes">Front Setback</option>
            <option value="no">Rear Setback</option>
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
            className="border rounded p-2 w-full"
            placeholder="Enter Floor Value, Ex: Ground, First, etc.. "
            required
          />
        </div>
        {/* Parking */}
        <div className="ml-3">
          <label className="block mb-1 pl-2 font-medium">Parking Availability</label>
          <select
            name="parking"
            value={formData.parking}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="yes">Yes, It is available.</option>
            <option value="no">No, It is not available</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2">
        {/*Parking availbility */}
        <div className="mr-3">
          <label className="block pl-2 mb-1 font-medium"> Parking Availability </label>
          <select
            name="parking"
            value={formData.parking}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="yes">Yes, it is available</option>
            <option value="no">No, it is not available</option>
          </select>
        </div>

        {/*Parking Count*/}
        {formData.parking === "yes" && (
          <div className="ml-3 mr-3">
            <label className="block mb-1 pl-2 font-medium">Parking Capacity</label>
            <div className="grid grid-cols-2">
              <input type="string"
              name="parking_capacity_2w"
              value={formData.parking_capacity_2w}
              onChange={handleChange}
              className="border rounded p-2 w-full "
              placeholder="2W Capacity"
              required/>
              <input type="string"
              name="parking_capacity_4w"
              value={formData.parking_capacity_4w}
              onChange={handleChange}
              className="border rounded p-2 w-full ml-3"
              placeholder="4W Capacity"
              required/>
            </div>
          </div>
        )}
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
          <label className="block pl-2 mb-1 font-medium"> Genrator Availability </label>
          <select
            name="genrator"
            value={formData.genrator}
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
            name="age"
            value={formData.age}
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
            name="condition"
            value={formData.condition}
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
      {/* Footfall */}
      {/* <div>
        <label className="block mb-1 pl-2 font-medium">Footfall</label>
        <input
          type="number"
          name="footfall"
          value={formData.footfall}
          onChange={handleChange}
          className="w-full p-2 border rounded-md hover:bg-gray-100 "
        />
      </div> */}

      

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
        {/* Owner Contact */}
        <div className="p-1 mr-2">
          <label className="block mb-1 pl-2 font-medium">Owner Contacted </label>
          <select
            name="owner_contacted"
            value={formData.owner_contacted}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white hover:bg-gray-100 "
          >
            <option value="" disabled hidden>Choose</option>
            <option value="north">Yes, Owner has been contacted</option>
            <option value="south">No, Owner has not been contacted</option>
          </select>
        </div>

        {/* Rental Value */}
        <div className="ml-2">
          <label className="block mb-1 pl-2 font-medium">Rental Value</label>
          <input
            type="number"
            name="rental_value"
            value={formData.rental_value}
            onChange={handleChange}
            className="w-full p-2 border rounded-md hover:bg-gray-100 "
          />
        </div>
      </div>

      {/* Building Age */}
      {/* <div>
        <label className="block mb-1 pl-2 font-medium">Building Age</label>
        <input
          type="number"
          name="building_age"
          value={formData.building_age}
          onChange={handleChange}
          className="w-full p-2 border rounded-md hover:bg-gray-100 "
        />
      </div> */}

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
        <h2 className="block font-bold pl-2 mb-3 text-xl"> Media Details</h2>
        <div className={`grid ${formData.parking === "yes" ? "grid-cols-3" : "grid-cols-2"}`}>
          {/* Property Photos */}
          <div>
            <label className="block pl-2 font-medium">Property Photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="pl-2 p-2 w-full"
              onChange={(e) => handleImageChange(e, "property_photos")}
            />
          </div>
          {/* Parking Photos */}
          {formData.parking === "yes" && (
            <div>
              <label className="block pl-2 font-medium">Parking Pictures </label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="p-2 w-full"
                onChange={(e) => handleImageChange(e, "parking_photos")}
              />
            </div>
          )}
          {/*Video Upload*/}
          <div>
            <label className="block pl-2 font-medium">Video</label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => handleVideoChange(e, "parking_videos")}
              className="w-full p-2 pl-2 "
            />
          </div>
        </div>
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
                className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={facilities.includes(opt)}
                  onChange={() => toggleOption(opt)}
                  className="w-4 h-4"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block pl-2 font-medium">Location Advantages <span className="text-xs">(Select all that apply)</span></label> 
          <div className="grid grid-cols-2 gap-2 p-2">
            {advantages_option.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={facilities.includes(opt)}
                  onChange={() => toggleOption(opt)}
                  className="w-4 h-4"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Save Property"}
      </button>
    </form>
  );
}
function onSuccess() {
  throw new Error("Function not implemented.");
}

