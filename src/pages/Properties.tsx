import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Search, Edit, Trash2, Eye, MapPin, Bed, Bath, Square, LandPlot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '../components/ui/Modal';
import { supabase } from "@/lib/supabaseClient";
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
// import { PropertyForm } from "../components/forms/PropertyForm";

interface Property{
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
      let query = supabase.from("properties").select("*");
      
      // Filter based on user role
      if (user?.role === 'agent') {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
  
      if (mounted) {
        if (error) {
          console.error("Error fetching properties:", error);
          setProperties([]);
        } else {
          console.log(data);
          setProperties(data || []);
        }
      }
    };

    if (user) {
      fetchProperties();
    }

    // Set up real-time subscription
    const channel = supabase
      .channel('properties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          console.log('Properties change received:', payload);
          if (mounted) {
            fetchProperties(); // Refetch data on any change
          }
        }
      )
      .subscribe();
  
    return () => { 
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.location?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         property.landmark?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.about_property?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || property.property_type?.toLowerCase() === typeFilter.toLowerCase();

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

  

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground">
            {user?.role === 'agent' ? 'Manage your property listings' : 'Manage all property listings'}
          </p>
        </div>
        {(user?.role === 'agent') && (
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
        {filteredProperties.map((property) => (
          <Card key={property.id} className="property-card group">
            <div className="relative h-48 overflow-hidden">
              <img
                src={property.property_photos?.[0] ?? "/placeholder.jpg"} // fallback if undefined or empty
                alt={property.title ?? "Property Image"}                 // fallback alt
                className="property-image w-full h-full object-cover group-hover:scale-110"
              />
              {/* <Badge className={`absolute top-3 right-3 ${getStatusColor(property.status)}`}>
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </Badge> */}
              {property.featured && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                  Featured
                </Badge>
              )}
            </div>
            <CardContent className="p-4" >
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{property.location}</h3>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.landmark}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  {/* <div className="text-2xl font-bold text-primary">
                    ${property.price.toLocaleString()}
                  </div> */}
                  <Badge variant="outline" className="text-xs">
                    {property.store_model}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <LandPlot className="h-5 w-5 mr-1" />
                    {property.store_size} sqft
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {property.about_property}
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // Open modal and set selected property
                      setSelectedProperty(property);
                      setShowViewModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {showViewModal && selectedProperty && (
                    <Modal
                      isOpen={showViewModal}
                      onClose={() => setShowViewModal(false)}
                      title="Property Details"
                      size="xl"
                    >
                      {/* Location & Distance */}
                      <section className="mb-6 p-4 bg-white rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Location & Distance</h2>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <PlaceIcon className="text-gray-600" />
                            <span className="font-semibold">Location:</span>
                            <span>{selectedProperty.location || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapIcon className="text-gray-600" />
                            <span className="font-semibold">Distance:</span>
                            <span>{selectedProperty.distance || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GroupsIcon className="text-gray-600" />
                            <span className="font-semibold">Footfall/hr:</span>
                            <span>{selectedProperty.footfall_per_hour || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <LocalCafeIcon className="text-gray-600" />
                            <span className="font-semibold">Snack Spend:</span>
                            <span>{selectedProperty.snack_spend || "-"}</span>
                          </div>
                        </div>
                      </section>

                      {/* Store Details */}
                      <section className="mb-6 p-4 bg-white rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Store Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            ["Property Type", selectedProperty.property_type, <StorefrontIcon />],
                            ["Store Model", selectedProperty.store_model, <StorefrontIcon />],
                            ["Store Size (ft.)", selectedProperty.store_size, <SquareFootIcon />],
                            ["Store Length (ft.)", selectedProperty.store_length, <StraightenIcon />],
                            ["Store Width (ft.)", selectedProperty.store_width, <StraightenIcon />],
                            ["Road Facing", selectedProperty.road_facing, <DirectionsCarIcon />],
                            ["Entry Direction", selectedProperty.entry_direction, <ExitToAppIcon />],
                            ["Corner Piece", selectedProperty.corner_peice, <CropSquareIcon />],
                            ["Corner Side", selectedProperty.corner_side, <CropSquareIcon />],
                            ["Store Position", selectedProperty.store_position, <PlaceIcon />],
                            ["Shutter Length (ft.)", selectedProperty.shutter_length, <StraightenIcon />],
                            ["Shutter Width (ft.)", selectedProperty.shutter_width, <StraightenIcon />],
                            ["Front Offset (ft.)", selectedProperty.front_offset, <StraightenIcon />],
                            ["Setback", selectedProperty.setback, <StraightenIcon />],
                            ["Floor", selectedProperty.floor, <LayersIcon />],
                          ].map(([label, value, icon], idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {icon}
                              <span className="font-semibold">{label}:</span>
                              <span>{value || "-"}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Parking & Utilities */}
                      <section className="mb-6 p-4 bg-white rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">Parking & Utilities</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            ["Parking Available", selectedProperty.parking_availability, <LocalParkingIcon />],
                            ["2W Capacity", selectedProperty.parking_capacity_2w, <TwoWheelerIcon />],
                            ["4W Capacity", selectedProperty.parking_capacity_4w, <DirectionsCarIcon />],
                            ["Washroom", selectedProperty.washroom, <WcIcon />],
                            ["Electricity", selectedProperty.electricity, <BoltIcon />],
                            ["Generator", selectedProperty.generator, <PowerIcon />],
                            ["Water", selectedProperty.water, <WaterDropIcon />],
                            ["Building Age", selectedProperty.building_age, <HistoryIcon />],
                            ["Building Condition", selectedProperty.building_condition, <HomeRepairServiceIcon />],
                          ].map(([label, value, icon], idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {icon}
                              <span className="font-semibold">{label}:</span>
                              <span>{value || "-"}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                      {/* ================== Image Galleries ================== */}
                      {[
                        { title: "Parking Photos", key: "parking_photos" },
                        { title: "Property Photos", key: "property_photos" },
                      ].map(({ title, key }) => (
                        <section key={key} className="mb-6 p-4 bg-white rounded shadow">
                          <h2 className="text-xl font-semibold mb-2">{title}</h2>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {selectedProperty[key]?.length > 0 ? (
                              selectedProperty[key].map((url: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`${title} ${idx}`}
                                  className="rounded-md object-cover w-full h-32 shadow"
                                />
                              ))
                            ) : (
                              <div className="text-gray-400 italic">No {title.toLowerCase()}</div>
                            )}
                          </div>
                        </section>
                      ))}

                      {/* ================== Videos ================== */}
                      <section className="mb-6 p-4 bg-white rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">Videos</h2>
                        <div className="flex flex-col gap-4">
                          {selectedProperty.video && selectedProperty.video.length > 0 ? (
                            selectedProperty.video.map((item: File | string, idx: number) => {
                              // If it's a File, create a temporary URL
                              const src = typeof item === "string" ? item : URL.createObjectURL(item);

                              return (
                                <video
                                  key={idx}
                                  controls
                                  className="rounded-md w-full max-h-64 mx-auto shadow"
                                  src={src}
                                />
                              );
                            })
                          ) : (
                            <div className="text-gray-400 italic">No Videos</div>
                          )}
                        </div>
                      </section>
                    </Modal>
                  )}


                  {(user?.role === 'admin' || (user?.role === 'agent' && property.agentId === user.id)) && (
                    <>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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