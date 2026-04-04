"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { KakaoMiniMap } from "@/components/KakaoMiniMap";

type Props = {
  lat: number;
  lng: number;
  placeName: string;
  streetViewConfig: boolean | null;
};

/** 목록 카드 우측 정사각형 썸네일 (네이버 지도 결과 카드 스타일) */
export function PlaceCardThumb({
  lat,
  lng,
  placeName,
  streetViewConfig,
}: Props) {
  const [streetFailed, setStreetFailed] = useState(false);
  const streetSrc = `/api/streetview?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}&w=200&h=200`;

  const onImgError = useCallback(() => {
    setStreetFailed(true);
  }, []);

  if (streetViewConfig === null) {
    return (
      <div
        className="h-[4.5rem] w-[4.5rem] shrink-0 animate-pulse rounded-lg bg-gray-200"
        aria-hidden
      />
    );
  }

  if (!streetViewConfig || streetFailed) {
    return (
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-gray-200">
        <KakaoMiniMap lat={lat} lng={lng} />
      </div>
    );
  }

  return (
    <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-gray-200">
      <Image
        src={streetSrc}
        alt=""
        fill
        className="object-cover"
        sizes="72px"
        unoptimized
        onError={onImgError}
      />
    </div>
  );
}
