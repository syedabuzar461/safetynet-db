import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';
import { z } from 'zod';

const resourceSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name too long'),
  type: z.enum(['shelter', 'food', 'medical', 'logistics', 'water', 'clothing']),
  description: z.string().max(1000, 'Description too long').optional(),
  location_name: z.string().trim().min(1, 'Location name is required').max(200, 'Location name too long'),
  address: z.string().trim().min(1, 'Address is required').max(300, 'Address too long'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  status: z.enum(['available', 'low_stock', 'out_of_stock', 'unavailable']),
  quantity: z.number().int().min(0).optional(),
  contact_name: z.string().max(100, 'Contact name too long').optional(),
  contact_phone: z.string().max(20, 'Phone too long').optional(),
  contact_email: z.string().email('Invalid email').max(255, 'Email too long').optional(),
});

interface ResourceFormProps {
  resource?: any;
  onSuccess?: () => void;
}

const ResourceForm = ({ resource, onSuccess }: ResourceFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'food' as const,
    description: '',
    location_name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    status: 'available' as const,
    quantity: 0,
    contact_name: '',
    contact_phone: '',
    contact_email: '',
  });

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || '',
        type: resource.type || 'food',
        description: resource.description || '',
        location_name: resource.location_name || '',
        address: resource.address || '',
        latitude: Number(resource.latitude) || 0,
        longitude: Number(resource.longitude) || 0,
        status: resource.status || 'available',
        quantity: resource.quantity || 0,
        contact_name: resource.contact_name || '',
        contact_phone: resource.contact_phone || '',
        contact_email: resource.contact_email || '',
      });
      setOpen(true);
    }
  }, [resource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = resourceSchema.parse(formData);
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (resource) {
        const { error } = await supabase
          .from('resources')
          .update({
            name: validated.name,
            type: validated.type,
            description: validated.description,
            location_name: validated.location_name,
            address: validated.address,
            latitude: validated.latitude,
            longitude: validated.longitude,
            status: validated.status,
            quantity: validated.quantity,
            contact_name: validated.contact_name,
            contact_phone: validated.contact_phone,
            contact_email: validated.contact_email,
          })
          .eq('id', resource.id);

        if (error) throw error;

        toast({
          title: 'Resource updated',
          description: 'The resource has been successfully updated.',
        });
      } else {
        const { error } = await supabase
          .from('resources')
          .insert([{
            name: validated.name,
            type: validated.type,
            description: validated.description,
            location_name: validated.location_name,
            address: validated.address,
            latitude: validated.latitude,
            longitude: validated.longitude,
            status: validated.status,
            quantity: validated.quantity,
            contact_name: validated.contact_name,
            contact_phone: validated.contact_phone,
            contact_email: validated.contact_email,
            created_by: user.id,
          }]);

        if (error) throw error;

        toast({
          title: 'Resource created',
          description: 'The resource has been successfully created.',
        });
      }

      setOpen(false);
      if (onSuccess) onSuccess();
      
      // Reset form
      setFormData({
        name: '',
        type: 'food',
        description: '',
        location_name: '',
        address: '',
        latitude: 0,
        longitude: 0,
        status: 'available',
        quantity: 0,
        contact_name: '',
        contact_phone: '',
        contact_email: '',
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to save resource',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!resource && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
          <DialogDescription>
            {resource ? 'Update the resource details below.' : 'Fill in the details to add a new resource to the database.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Resource Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shelter">Shelter</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="medical">Medical Aid</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_name">Location Name *</Label>
              <Input
                id="location_name"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_name">Contact Name</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : resource ? 'Update Resource' : 'Create Resource'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceForm;
