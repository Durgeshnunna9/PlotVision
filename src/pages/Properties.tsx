import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Search, Edit, Trash2, Eye, MapPin, Bed, Bath, Square, LandPlot, CheckCircle, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '../components/ui/Modal';
// import { supabase } from "@/lib/supabaseClient";
// Icons
import PlaceIcon from '@mui/icons-material/Place';
import MapIcon from '@mui/icons-material/Map';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import StraightenIcon from '@mui/icons-material/Straighten';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import LayersIcon from '@mui/icons-material/Layers';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import WcIcon from '@mui/icons-material/Wc';
import BoltIcon from '@mui/icons-material/Bolt';
import PowerIcon from '@mui/icons-material/Power';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import HistoryIcon from '@mui/icons-material/History';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { PropertyForm, PropertyFormData } from "../components/forms/PropertyForm";

interface Property{
  footfall: string;
  snackSpend: string;
  propertyType: any;
  storeModel: any;
  storeSize: any;
  storeDimensionsL: any;
  storeDimensionsW: any;
  roadFacing: any;
  entryDirection: any;
  cornerPiece: any;
  cornerSide: any;
  storePosition: any;
  shutterL: any;
  shutterW: any;
  frontOffset: any;
  parkingAvailability: any;
  twoWCapacity: any;
  fourWCapacity: any;
  buildingAge: any;
  buildingCondition: any;
  waterSupply: any;
  user_id: string ;
  location: string ;
  distance: string ;
  setback: string ;
  floor: string;
  washroom: string ;
  electricity: string ;
  generator: string ;
  facilities: string[];
  advantages: string[];
  parking_photos: File[];
  property_photos: File[];
  video: File[]; 
}

const Properties = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;


    const fetchProperties = async () => {
      if (!user) return;
      try{
        const response = await fetch(`http://localhost:8090/properties/agent/${user.userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error("Failed to get properties");
        const data = await response.json();
        setProperties(data || []);
        console.log(data)
      }
      catch(error){
        console.error("Error fetching properties:", error);
        setProperties([]);
      }
    };
    fetchProperties();
  },[user]);
  const filteredProperties = properties.filter(item => {
    const matchesSearch =  
                         item.property.landmark?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.property.aboutProperty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.property.propertyType?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'sold': return 'bg-primary/10 text-primary';
      case 'rented': return 'bg-accent/10 text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const BASE_URL = "http://localhost:8080";

  const formatImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
      return url; // ✅ Already a usable URL
    }
    return `${BASE_URL}${url}`; // ✅ For relative URLs from backend
  };
  
  const formatMediaUrl = (url: string) => {
    if (!url) return "";
    
    // ✅ Already a usable URL
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
      return url;
    }
  
    // ✅ For relative paths returned from backend (e.g., /properties/8/video)
    return `${BASE_URL}${url}`;
  };
  

  // const videoResponse = await fetch(`http://localhost:8090/properties/${propertyId}/video`, {
  //   method: "GET",
  //   credentials: "include",
  // });
  
  // if (videoResponse.ok) {
  //   const blob = await videoResponse.blob();
  //   const videoUrl = URL.createObjectURL(blob);
  //   setVideo({ video: [videoUrl] }); // store this URL to render later
  // }


  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground">
            {user?.role === 'AGENT' ? 'Manage your property listings' : 'Manage all property listings'}
          </p>
        </div>
        {(user?.role === 'AGENT') && (
          <div>
            <Button className="btn-primary" onClick={() => setShowPropertyForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
            {/* Property Form Modal */}
            <Modal
              isOpen={showPropertyForm}
              onClose={() => setShowPropertyForm(false)}
              title="Property Details"
              size="xl"
            >
              <PropertyForm
                onSuccess={() => {
                  setShowPropertyForm(false);
                  // The useProperties hook will automatically refresh the data
                } }
                onCancel={() => setShowPropertyForm(false)}/>
            </Modal>
          </div>
          
        )}
        
      </div>

      {/* Filters */}
      <Card >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-primary"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="open_plot">Open Plot</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              {filteredProperties.length} properties found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((item) =>{
           const property = item.property; // ✅ unwrap nested object safely
           const video = item.video;
           const images = item.images;
        
          return (
          <Card key={property.id} className="property-card group">
            <div className="relative h-48 overflow-hidden">
              <img
                src={images.property_photos?.[0] ?? "/placeholder.jpg"} // fallback if undefined or empty
                alt={property.title ?? "Property Image"}                 // fallback alt
                className="property-image w-full h-full object-cover group-hover:scale-110"
              />
              <Badge
                className={`absolute top-3 right-3 ${getStatusColor(property.status)}`}
              >
                {property.status
                  ? property.status.charAt(0).toUpperCase() + property.status.slice(1)
                  : "Unknown"}
              </Badge>
              {property.featured && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                  Featured
                </Badge>
              )}
            </div>
            <CardContent className="p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="space-y-4">
                {/* ---------- Property Header ---------- */}
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{property.location}</h3>
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    {property.landmark || "No landmark"}
                  </div>
                </div>

                {/* ---------- Model Badge ---------- */}
                <div className="flex justify-between items-center">
                  <Badge
                    variant="outline"
                    className="text-xs border-primary text-primary font-semibold rounded-full px-3 py-1 bg-primary/5"
                  >
                    {property.storeModel}
                  </Badge>
                </div>

                {/* ---------- Size & Price ---------- */}
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center">
                    <LandPlot className="h-5 w-5 mr-1 text-muted-foreground" />
                    <span>{property.storeSize} sqft</span>
                  </div>
                  {/* Optional price */}
                  {/* <div className="text-lg font-semibold text-primary">
                    ₹{property.price.toLocaleString()}
                  </div> */}
                </div>

                {/* ---------- About ---------- */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {property.aboutProperty || "No description available."}
                </p>

                {/* ---------- Buttons ---------- */}
                <div className="flex gap-2 pt-3">
                  {/* View Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-gray-300 hover:border-primary hover:text-primary transition-all"
                    onClick={() => {
                      setSelectedProperty(property);
                      setShowViewModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>

                  {/* Edit / Delete (role-based) */}
                  {(user?.role === "admin" || (user?.role === "agent" && property.agentId === user.userId)) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:border-yellow-500 hover:text-yellow-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:border-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* ---------- Modal ---------- */}
                {showViewModal && selectedProperty && (
                  <Modal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    title="Property Details"
                    size="xl"
                  >
                    <div className="space-y-6">
                      {/* ================== Location Section ================== */}
                      <section className="p-4 bg-gray-50 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">
                          📍 Location & Distance
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {[
                            ["Location", selectedProperty.location, <PlaceIcon />],
                            ["Distance", selectedProperty.distance, <MapIcon />],
                            ["Footfall/hr", selectedProperty.footfall, <GroupsIcon />],
                            ["Snack Spend", selectedProperty.snackSpend, <LocalCafeIcon />],
                          ].map(([label, value, icon], idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-gray-600">{icon}</span>
                              <span className="font-semibold">{label}:</span>
                              <span>{value || "-"}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* ================== Store Details ================== */}
                      <section className="p-4 bg-gray-50 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">
                          🏬 Store Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {[
                            ["Property Type", selectedProperty.propertyType, <StorefrontIcon />],
                            ["Store Model", selectedProperty.storeModel, <StorefrontIcon />],
                            ["Store Size (ft.)", selectedProperty.storeSize, <SquareFootIcon />],
                            ["Store Length (ft.)", selectedProperty.storeDimensionsL, <StraightenIcon />],
                            ["Store Width (ft.)", selectedProperty.storeDimensionsW, <StraightenIcon />],
                            ["Road Facing", selectedProperty.roadFacing, <DirectionsCarIcon />],
                            ["Entry Direction", selectedProperty.entryDirection, <ExitToAppIcon />],
                            ["Corner Piece", selectedProperty.cornerPiece, <CropSquareIcon />],
                            ["Corner Side", selectedProperty.cornerSide, <CropSquareIcon />],
                            ["Store Position", selectedProperty.storePosition, <PlaceIcon />],
                            ["Shutter Length (ft.)", selectedProperty.shutterL, <StraightenIcon />],
                            ["Shutter Width (ft.)", selectedProperty.shutterW, <StraightenIcon />],
                            ["Front Offset (ft.)", selectedProperty.frontOffset, <StraightenIcon />],
                            ["Setback", selectedProperty.setback, <StraightenIcon />],
                            ["Floor", selectedProperty.floor, <LayersIcon />],
                          ].map(([label, value, icon], idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-gray-600">{icon}</span>
                              <span className="font-semibold">{label}:</span>
                              <span>{value || "-"}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* ================== Parking ================== */}
                      <section className="p-4 bg-gray-50 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">
                          🅿️ Parking
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {[
                            ["Parking Available", selectedProperty.parkingAvailability, <LocalParkingIcon />],
                            ["2W Capacity", selectedProperty.twoWCapacity, <TwoWheelerIcon />],
                            ["4W Capacity", selectedProperty.fourWCapacity, <DirectionsCarIcon />],
                            ["Building Age", selectedProperty.buildingAge, <HistoryIcon />],
                            ["Building Condition", selectedProperty.buildingCondition, <HomeRepairServiceIcon />],
                          ].map(([label, value, icon], idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-gray-600">{icon}</span>
                              <span className="font-semibold">{label}:</span>
                              <span>{value || "-"}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* ================== Utilities ================== */}
                      <section className="p-4 bg-gray-50 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">⚙️ Utilities</h2>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            ["Washroom", selectedProperty.washroom, <WcIcon />],
                            ["Electricity", selectedProperty.electricity, <BoltIcon />],
                            ["Generator", selectedProperty.generator, <PowerIcon />],
                            ["Water", selectedProperty.waterSupply, <WaterDropIcon />],
                          ].map(([label, value, icon]) => (
                            <div
                              key={label}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                value
                                  ? "bg-green-50 border-green-200 text-green-700"
                                  : "bg-red-50 border-red-200 text-red-700"
                              }`}
                            >
                              <span className="text-lg">{icon}</span>
                              <span className="font-medium">{label}</span>
                              <span className="ml-auto text-xs font-semibold tracking-wide uppercase">
                                {value ? "Available" : "Not Available"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                      <section className='p-4 bg-gray-50 rounded-xl border'>
                        {/* 🏙️ Location Highlights Section */}
                        <div className="">
                          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4">
                            <MapPin className="h-5 w-5 text-primary" />
                            Location Highlights
                          </h3>

                          {/* Neighbourhood Facilities */}
                          <div className="mb-4">
                            <h4 className="text-md  text-gray-800 mb-3">
                              Neighbourhood Facilities
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(property.neighbourhoodFacilities
                                ?.split(",")
                                .map((item) => item.trim())
                                .filter(Boolean) || []
                              ).map((facility, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all duration-200"
                                >
                                  <Building className="w-4 h-4 mr-1 text-blue-600" />
                                  {facility}
                                </span>
                              ))}

                              {!property.neighbourhoodFacilities && (
                                <span className="text-gray-400 italic text-sm">No data available</span>
                              )}
                            </div>
                          </div>

                          {/* Location Advantages */}
                          <div>
                            <h4 className="text-md  text-gray-800 mb-3">
                              Location Advantages
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(property.locationAdvantages
                                ?.split(",")
                                .map((item) => item.trim())
                                .filter(Boolean) || []
                              ).map((adv, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all duration-200"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                                  {adv}
                                </span>
                              ))}

                              {!property.locationAdvantages && (
                                <span className="text-gray-400 italic text-sm">No data available</span>
                              )}
                            </div>
                          </div>
                        </div>

                      </section>


                      {/* ================== Photos ================== */}
                      {[
                        { title: "Parking Photos", key: "parking_photos" },
                        { title: "Property Photos", key: "property_photos" },
                      ].map(({ title, key }) => (
                        <section key={key} className="p-4 bg-gray-50 rounded-xl border">
                          <h2 className="text-lg font-semibold mb-3 text-gray-800">{title}</h2>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {images?.[key]?.length > 0 ? (
                              images?.[key].map((url: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={formatImageUrl(url)}
                                  onError={() => console.log("Image not found:", formatImageUrl(url))}
                                  alt={`${title} ${idx}`}
                                  className="rounded-lg object-cover w-full h-32 shadow-sm hover:shadow-md transition"
                                />
                              ))
                            ) : (
                              <p className="text-gray-400 italic">No {title.toLowerCase()}</p>
                            )}
                          </div>
                        </section>
                      ))}

                      {/* ================== Videos ================== */}
                      <section className="p-4 bg-gray-50 rounded-xl border">
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">🎥 Videos</h2>

                        <div className="flex flex-col gap-3">
                          {video?.video && video.video.length > 0 ? (
                            video.video.map((item: File | string, idx: number) => {
                              // 🧠 Determine the video source
                              const src =
                                typeof item === "string"
                                  ? formatMediaUrl(item)
                                  : URL.createObjectURL(item);

                              return (
                                <video
                                  key={idx}
                                  controls
                                  className="rounded-lg w-full max-h-64 shadow-sm hover:shadow-md transition"
                                  src={src}
                                />
                              );
                            })
                          ) : (
                            <p className="text-gray-400 italic">No Videos</p>
                          )}
                        </div>
                      </section>
                    </div>
                  </Modal>
                )}
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {filteredProperties.length === 0 && (
        <Card className={`card-premium ${showViewModal ? "no-hover" : ""}`}>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Properties;