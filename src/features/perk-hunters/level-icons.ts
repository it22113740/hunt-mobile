import {
  Binoculars,
  Building2,
  Camera,
  Compass,
  Crown,
  Footprints,
  Gem,
  MapPin,
  Mountain,
  Route,
  Star,
  Utensils,
  type LucideIcon,
} from 'lucide-react-native';

const ICONS: LucideIcon[] = [
  Compass,
  Footprints,
  Binoculars,
  Camera,
  Mountain,
  MapPin,
  Utensils,
  Route,
  Building2,
  Gem,
  Star,
  Crown,
];

export function levelIcon(number: number): LucideIcon {
  return ICONS[number - 1] ?? Compass;
}
