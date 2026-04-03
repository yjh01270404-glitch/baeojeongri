export type ServiceTag = '친절' | '바가지' | '빠름' | '기술좋음';

export type Review = {
  id: string;
  authorNickname: string;
  model: string;
  serviceType: string;
  price: number;
  tags: ServiceTag[];
  content: string;
  rating: number;
  date: string;
};

export type Shop = {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  hours: string;
  distanceKm: number;
  specialties: string[];
  reviews: Review[];
};

export type ShopStats = {
  rating: number;
  reviewCount: number;
  topTags: { tag: ServiceTag; count: number }[];
  priceRange: { min: number; max: number } | null;
  avgPriceByService: { serviceType: string; avg: number; count: number }[];
};
