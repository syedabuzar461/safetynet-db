import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Package, Edit, Trash2 } from 'lucide-react';

interface ResourceCardProps {
  resource: {
    id: string;
    name: string;
    type: string;
    description?: string;
    location_name: string;
    address: string;
    status: string;
    quantity?: number;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
  };
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-success text-success-foreground';
    case 'low_stock':
      return 'bg-warning text-warning-foreground';
    case 'out_of_stock':
      return 'bg-destructive text-destructive-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getTypeIcon = (type: string) => {
  return <Package className="h-4 w-4" />;
};

const ResourceCard = ({ resource, canEdit, onEdit, onDelete }: ResourceCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon(resource.type)}
              <Badge variant="outline" className="capitalize">
                {resource.type.replace('_', ' ')}
              </Badge>
              <Badge className={getStatusColor(resource.status)}>
                {resource.status.replace('_', ' ')}
              </Badge>
            </div>
            <CardTitle className="text-xl">{resource.name}</CardTitle>
            {resource.quantity && (
              <CardDescription className="mt-1">
                Quantity: {resource.quantity}
              </CardDescription>
            )}
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {resource.description && (
          <p className="text-sm text-muted-foreground">{resource.description}</p>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{resource.location_name}</p>
              <p className="text-muted-foreground">{resource.address}</p>
            </div>
          </div>

          {resource.contact_name && (
            <div className="pt-2 border-t">
              <p className="font-medium mb-1">Contact Information</p>
              <p className="text-muted-foreground">{resource.contact_name}</p>
              {resource.contact_phone && (
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-3 w-3" />
                  <a href={`tel:${resource.contact_phone}`} className="text-primary hover:underline">
                    {resource.contact_phone}
                  </a>
                </div>
              )}
              {resource.contact_email && (
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-3 w-3" />
                  <a href={`mailto:${resource.contact_email}`} className="text-primary hover:underline">
                    {resource.contact_email}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
