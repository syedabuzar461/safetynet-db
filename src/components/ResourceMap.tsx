import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';

// Fix Leaflet default marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Resource {
  id: string;
  name: string;
  type: string;
  location_name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface ResourceMapProps {
  resources: Resource[];
  onResourceClick?: (resource: Resource) => void;
}

const getMarkerColor = (status: string, type: string) => {
  if (status === 'available') return '#10b981'; // green
  if (status === 'low_stock') return '#f59e0b'; // yellow/warning
  if (status === 'out_of_stock') return '#ef4444'; // red
  return '#6b7280'; // gray
};

const ResourceMap = ({ resources, onResourceClick }: ResourceMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on US
    map.current = L.map(mapContainer.current).setView([37.0902, -95.7129], 4);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    resources.forEach(resource => {
      if (!map.current) return;

      const color = getMarkerColor(resource.status, resource.type);
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([resource.latitude, resource.longitude], { icon: customIcon })
        .addTo(map.current)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${resource.name}</h3>
            <p class="text-xs text-gray-600 capitalize">${resource.type.replace('_', ' ')}</p>
            <p class="text-xs mt-1">${resource.location_name}</p>
            <p class="text-xs capitalize mt-1 font-medium" style="color: ${color}">${resource.status.replace('_', ' ')}</p>
          </div>
        `);

      if (onResourceClick) {
        marker.on('click', () => onResourceClick(resource));
      }

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (resources.length > 0) {
      const bounds = L.latLngBounds(
        resources.map(r => [r.latitude, r.longitude] as L.LatLngTuple)
      );
      map.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [resources, onResourceClick]);

  return (
    <Card className="overflow-hidden">
      <div ref={mapContainer} className="w-full h-[500px]" />
    </Card>
  );
};

export default ResourceMap;
