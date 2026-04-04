"use client";

import { useEffect, useRef } from "react";
import type { KakaoPlaceItem } from "@/lib/kakao-place";

type Props = {
  places: KakaoPlaceItem[];
  centerLat: number;
  centerLng: number;
  onSelectPlace: (p: KakaoPlaceItem) => void;
  /** 컨테이너 높이·모서리 (기본: 큰 지도 뷰) */
  className?: string;
};

/** 목록 결과를 카카오 지도에 전부 표시 (마커 클릭 → 상세) */
export function KakaoFullMapView({
  places,
  centerLat,
  centerLng,
  onSelectPlace,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !window.kakao?.maps?.Map) return;

    const kakao = window.kakao;
    const center = new kakao.maps.LatLng(centerLat, centerLng);
    const map = new kakao.maps.Map(el, {
      center,
      level: 6,
    });

    const bounds = new kakao.maps.LatLngBounds();
    bounds.extend(center);

    const markers: InstanceType<(typeof kakao)["maps"]["Marker"]>[] = [];
    for (const p of places) {
      const pos = new kakao.maps.LatLng(Number(p.y), Number(p.x));
      bounds.extend(pos);
      const marker = new kakao.maps.Marker({ position: pos, title: p.place_name });
      marker.setMap(map);
      kakao.maps.event.addListener(marker, "click", () => {
        onSelectPlace(p);
      });
      markers.push(marker);
    }

    if (places.length > 0) {
      map.setBounds(bounds);
    }

    const relayout = () => {
      try {
        map.relayout();
      } catch {
        /* ignore */
      }
    };
    requestAnimationFrame(relayout);
    const t1 = window.setTimeout(relayout, 120);
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
      for (const m of markers) m.setMap(null);
      el.innerHTML = "";
    };
  }, [places, centerLat, centerLng, onSelectPlace]);

  return (
    <div
      ref={containerRef}
      className={
        className ??
        "h-[min(70vh,560px)] w-full rounded-2xl border border-gray-200 bg-gray-200 shadow-inner"
      }
      role="presentation"
    />
  );
}
