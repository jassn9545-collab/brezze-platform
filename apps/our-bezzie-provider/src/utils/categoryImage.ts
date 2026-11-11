import { ImageSourcePropType } from 'react-native';
import { images } from '../theme';

const categoryImages: Record<string, ImageSourcePropType> = {
  plumbing: images.plumbing,
  electrician: images.electrician,
  carpenter: images.carpenter,
  cleaning: images.cleaning,
  carpet: images.carpet,
  'carpet-maker': images.carpet,
  appliance: images.appliance,
  acrepair: images.acrepair,
  'ac-repair': images.acrepair,
  garden: images.garden,
};

export const categoryImage = (slug?: string | null, name?: string | null) => {
  const normalizedSlug = slug?.trim().toLowerCase();
  const normalizedName = name?.trim().toLowerCase().replace(/\s+/g, '-');

  return (
    (normalizedSlug ? categoryImages[normalizedSlug] : undefined) ??
    (normalizedName ? categoryImages[normalizedName] : undefined) ??
    images.categories
  );
};
