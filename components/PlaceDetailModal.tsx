"use client";

import { useEffect } from "react";
import { PlaceCardVisual } from "@/components/PlaceCardVisual";
import type { KakaoPlaceItem } from "@/lib/kakao-place";
import { naverMapSearchUrl } from "@/lib/map-links";

function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length < 8) return "로그인 후 확인";
  return `${d.slice(0, 3)}-****-${d.slice(-4)}`;
}

function formatDistance(meters: string | undefined) {
  if (!meters) return "";
  const m = Number(meters);
  if (!Number.isFinite(m) || m < 0) return "";
  if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
  return `${Math.round(m)}m`;
}

type Props = {
  place: KakaoPlaceItem | null;
  onClose: () => void;
  isLoggedIn: boolean;
  onRequestLogin: () => void;
  streetViewConfig: boolean | null;
};

export function PlaceDetailModal({
  place,
  onClose,
  isLoggedIn,
  onRequestLogin,
  streetViewConfig,
}: Props) {
  useEffect(() => {
    if (!place) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [place, onClose]);

  if (!place) return null;

  const lat = Number(place.y);
  const lng = Number(place.x);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="place-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="max-h-[40vh] shrink-0 overflow-hidden sm:max-h-[240px]">
          <PlaceCardVisual
            lat={lat}
            lng={lng}
            placeName={place.place_name}
            streetViewConfig={streetViewConfig}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 text-left">
          <h2
            id="place-detail-title"
            className="text-lg font-black text-gray-900 sm:text-xl"
          >
            {place.place_name}
          </h2>
          <p className="mt-1 text-xs text-gray-400">{place.category_name}</p>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            {place.road_address_name || place.address_name}
          </p>
          {place.distance ? (
            <p className="mt-2 text-xs font-bold text-[#00BFA5]">
              검색 기준 약 {formatDistance(place.distance)}
            </p>
          ) : null}
          {place.phone ? (
            <div className="mt-4 border-t border-gray-100 pt-4">
              {isLoggedIn ? (
                <p className="text-sm font-semibold text-gray-900">
                  📞 {place.phone}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={onRequestLogin}
                  className="text-left text-sm font-semibold text-[#00BFA5] underline-offset-2 hover:underline"
                >
                  📞 {maskPhone(place.phone)} — 로그인 후 전체 번호 보기
                </button>
              )}
            </div>
          ) : null}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <a
              href={naverMapSearchUrl(place.place_name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#03C75A] bg-[#03C75A]/10 px-4 py-3 text-sm font-bold text-[#03C75A] transition hover:bg-[#03C75A] hover:text-white"
            >
              네이버지도에서 보기
            </a>
            <a
              href={place.place_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#00BFA5] px-4 py-3 text-sm font-bold text-[#00BFA5] transition hover:bg-[#00BFA5] hover:text-white"
            >
              카카오맵에서 보기
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
