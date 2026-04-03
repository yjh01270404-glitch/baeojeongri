export {};

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        LatLngBounds: new () => KakaoLatLngBounds;
        Map: new (
          container: HTMLElement,
          options: {
            center: KakaoLatLng;
            level: number;
            scrollwheel?: boolean;
            draggable?: boolean;
          },
        ) => KakaoMap;
        Marker: new (options: {
          position: KakaoLatLng;
          title?: string;
        }) => KakaoMarker;
        event: {
          addListener: (
            target: KakaoMarker,
            type: string,
            handler: () => void,
          ) => void;
        };
        services: {
          Places: new () => KakaoPlaces;
          Status: { OK: string };
          SortBy: { DISTANCE: number };
        };
      };
    };
  }
}

type KakaoLatLng = object;

type KakaoLatLngBounds = {
  extend: (latlng: KakaoLatLng) => void;
};

type KakaoMap = {
  relayout: () => void;
  setBounds: (bounds: KakaoLatLngBounds) => void;
};

type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
};

type KakaoPlaces = {
  keywordSearch: (
    keyword: string,
    callback: (
      data: KakaoPlace[],
      status: string,
      pagination: { hasNextPage: boolean; nextPage: () => void },
    ) => void,
    options?: {
      location?: KakaoLatLng;
      radius?: number;
      size?: number;
      page?: number;
      sort?: number;
    },
  ) => void;
};

type KakaoPlace = {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance: string;
};
