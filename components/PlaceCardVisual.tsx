"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { KakaoMiniMap } from "@/components/KakaoMiniMap";

type Props = {
  lat: number;
  lng: number;
  placeName: string;
  /** null: 설정 로딩 중 / true: Street View 시도 / false: 지도만 */
  streetViewConfig: boolean | null;
};

/**
 * 1) (선택) Google Street View 정적 이미지 — 좌표 인근 실제 거리 사진
 * 2) 실패·비활성 → 카카오 미니맵
 * 카카오 장소 API는 업체 대표 사진 URL을 제공하지 않습니다.
 */
export function PlaceCardVisual({
  lat,
  lng,
  placeName,
  streetViewConfig,
}: Props) {
  const [streetFailed, setStreetFailed] = useState(false);

  const streetSrc = `/api/streetview?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}&w=640&h=320`;

  const onImgError = useCallback(() => {
    setStreetFailed(true);
  }, []);

  if (streetViewConfig === null) {
    return (
      <div
        className="relative aspect-[2/1] w-full animate-pulse bg-gray-200"
        aria-hidden
      />
    );
  }

  if (!streetViewConfig || streetFailed) {
    return (
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-gray-200">
        <KakaoMiniMap lat={lat} lng={lng} />
      </div>
    );
  }

  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden bg-gray-200">
      <Image
        src={streetSrc}
        alt={`${placeName} 인근 거리 보기`}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        unoptimized
        onError={onImgError}
      />
      <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
        거리 뷰 · 실제 좌표 기준
      </span>
    </div>
  );
}
