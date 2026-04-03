"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** 위도 */
  lat: number;
  /** 경도 */
  lng: number;
};

/**
 * 카카오맵 JavaScript SDK로 카드 내부 미니 지도 + 정비소 위치 마커
 */
export function KakaoMiniMap({ lat, lng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !window.kakao?.maps?.Map) return;

    const kakao = window.kakao;
    const position = new kakao.maps.LatLng(lat, lng);
    const map = new kakao.maps.Map(el, {
      center: position,
      level: 4,
      scrollwheel: false,
    });
    const marker = new kakao.maps.Marker({ position });
    marker.setMap(map);

    const relayout = () => {
      try {
        map.relayout();
      } catch {
        /* ignore */
      }
    };

    requestAnimationFrame(relayout);
    const t1 = window.setTimeout(relayout, 100);
    const t2 = window.setTimeout(relayout, 400);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => relayout())
        : null;
    ro?.observe(el);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro?.disconnect();
      marker.setMap(null);
      el.innerHTML = "";
    };
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full min-h-[120px] w-full bg-gray-200"
      role="presentation"
    />
  );
}
