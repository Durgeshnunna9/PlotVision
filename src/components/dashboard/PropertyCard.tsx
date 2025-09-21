import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import { Property } from '@/data/mockData';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'sold':
        return 'bg-destructive text-destructive-foreground';
      case 'rented':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className="property-card group">
      <div className="relative h-48 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0] || '/placeholder.png'}
            alt={property.title || "Property image"}
            className="property-image w-full h-full object-cover group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            No Image
          </div>
        )}

        <Badge className={`absolute top-3 right-3 ${getStatusColor(property.status)}`}>
          {property.status
            ? property.status.charAt(0).toUpperCase() + property.status.slice(1)
            : "Unknown"}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              {property.title || "Untitled Property"}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4" />
              <span>{property.address || "Address not available"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">
              {(property.price ?? 0).toLocaleString()}
            </div>

            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                <span>{(property.sqft ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
