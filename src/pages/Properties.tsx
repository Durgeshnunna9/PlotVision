import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Search, Edit, Trash2, Eye, MapPin, Bed, Bath, Square, LandPlot } from 'lucide-react';
// import { mockProperties } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '../components/ui/Modal';
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { PropertyForm, PropertyFormData } from "../components/forms/PropertyForm";

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
              {/* <img 
                src={property.images[0]} 
                alt={property.title}
                className="property-image w-full h-full object-cover group-hover:scale-110"
              /> */}
              {/* <Badge className={`absolute top-3 right-3 ${getStatusColor(property.status)}`}>
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </Badge>
              {property.featured && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                  Featured
                </Badge>
              )} */}
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
                      title={"Property Details"}
                      size="lg"
                      
                    >
                      <div className="space-y-2 grid grid-cols-2 gap-4 ">
                        <p><b>Location:</b> {selectedProperty.location}</p>
                        <p><b>Distance:</b> {selectedProperty.distance}</p>
                        <p><b>Footfall per hour:</b> {selectedProperty.footfall_per_hour}</p>
                        <p><b>Snack Spend:</b> {selectedProperty.snack_spend}</p>
                        <p><b>Property Type:</b> {selectedProperty.property_type}</p>
                        <p><b>Store Model:</b> {selectedProperty.store_model}</p>
                        <p><b>Store Size:</b> {selectedProperty.store_size}</p>
                        <p><b>Store Length:</b> {selectedProperty.store_length}</p>
                        <p><b>Store Width:</b> {selectedProperty.store_width}</p>
                        <p><b>Road Facing:</b> {selectedProperty.road_facing}</p>
                        <p><b>Entry Direction:</b> {selectedProperty.entry_direction}</p>
                        <p><b>Corner Piece:</b> {selectedProperty.corner_peice}</p>
                        <p><b>Corner Side:</b> {selectedProperty.corner_side}</p>
                        <p><b>Store Position:</b> {selectedProperty.store_position}</p>
                        <p><b>Shutter Length:</b> {selectedProperty.shutter_length}</p>
                        <p><b>Shutter Width:</b> {selectedProperty.shutter_width}</p>
                        <p><b>Front Offset:</b> {selectedProperty.front_offset}</p>
                        <p><b>Setback:</b> {selectedProperty.setback}</p>
                        <p><b>Floor:</b> {selectedProperty.floor}</p>
                        <p><b>Parking Availability:</b> {selectedProperty.parking_availability}</p>
                        <p><b>2W Parking Capacity:</b> {selectedProperty.parking_capacity_2w}</p>
                        <p><b>4W Parking Capacity:</b> {selectedProperty.parking_capacity_4w}</p>
                        <p><b>Washroom:</b> {selectedProperty.washroom}</p>
                        <p><b>Electricity:</b> {selectedProperty.electricity}</p>
                        <p><b>Generator:</b> {selectedProperty.generator}</p>
                        <p><b>Building Age:</b> {selectedProperty.building_age}</p>
                        <p><b>Water:</b> {selectedProperty.water}</p>
                        <p><b>Building Condition:</b> {selectedProperty.building_condition}</p>
                        <p><b>Landmark:</b> {selectedProperty.landmark}</p>
                        <p><b>Owner Contacted:</b> {selectedProperty.owner_contacted}</p>
                        <p><b>Rental Value:</b> {selectedProperty.rental_value}</p>
                        <p><b>About Property:</b> {selectedProperty.about_property}</p>
                      </div>
                      {/* Multi-selects */}
                      <div className='mt-2 mb-2'>
                          <b>Facilities:</b>
                          <ul className="list-disc ml-6">
                            {selectedProperty.facilities?.map((f: string, i: number) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <b>Advantages:</b>
                          <ul className="list-disc ml-6">
                            {selectedProperty.advantages?.map((a: string, i: number) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Media (photos/videos in a collage style) */}
                        <div className="mt-4">
                          <b>Parking Photos:</b>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {selectedProperty.parking_photos?.map((file: File, i: number) => (
                              <img
                                key={i}
                                src={URL.createObjectURL(file)}
                                alt={`Parking ${i}`}
                                className="rounded-md object-cover h-24 w-full"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="mt-4">
                          <b>Property Photos:</b>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {selectedProperty.property_photos?.map((file: File, i: number) => (
                              <img
                                key={i}
                                src={URL.createObjectURL(file)}
                                alt={`Property ${i}`}
                                className="rounded-md object-cover h-24 w-full"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="mt-4">
                          <b>Videos:</b>
                          <div className="space-y-2 mt-2">
                            {selectedProperty.video?.map((file: File, i: number) => (
                              <video
                                key={i}
                                controls
                                className="rounded-md w-full max-h-48"
                                src={URL.createObjectURL(file)}
                              />
                            ))}
                          </div>
                        </div>
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