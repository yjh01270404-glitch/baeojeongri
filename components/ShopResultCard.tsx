"use client";

import { PlaceCardThumb } from "@/components/PlaceCardThumb";
import type { KakaoPlaceItem } from "@/lib/kakao-place";

type Props = {
  place: KakaoPlaceItem;
  distanceLabel: string;
  addressShort: string;
  isLoggedIn: boolean;
  onRequestLogin: () => void;
  onOpenDetail: () => void;
  streetViewConfig: boolean | null;
  maskPhone: (phone: string) => string;
};

export function ShopResultCard({
  place,
  distanceLabel,
  addressShort,
  isLoggedIn,
  onRequestLogin,
  onOpenDetail,
  streetViewConfig,
  maskPhone,
}: Props) {
  const lat = Number(place.y);
  const lng = Number(place.x);

  return (
    <article
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail();
        }
      }}
      onClick={onOpenDetail}
      className="flex cursor-pointer gap-2 rounded-xl border border-gray-100 bg-white p-2.5 text-left shadow-sm transition hover:border-gray-200 hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#0068C3]">
          {place.place_name}
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">
          {place.category_name || "오토바이 정비"}
        </p>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-600">
          {distanceLabel ? `${distanceLabel} · ` : ""}
          {addressShort}
        </p>
        <div
          className="mt-2 flex flex-wrap gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {place.phone ? (
            isLoggedIn ? (
              <a
                href={`tel:${place.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-800 hover:bg-gray-100"
              >
                <span aria-hidden>📞</span>
                전화
              </a>
            ) : (
              <button
                type="button"
                onClick={onRequestLogin}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-800 hover:bg-gray-100"
              >
                <span aria-hidden>📞</span>
                전화 ({maskPhone(place.phone)})
              </button>
            )
          ) : (
            <span className="inline-flex items-center rounded-full border border-dashed border-gray-200 px-2.5 py-1 text-[11px] text-gray-400">
              전화 없음
            </span>
          )}
          <a
            href={place.place_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-800 hover:bg-gray-100"
          >
            <span aria-hidden>🧭</span>
            길찾기
          </a>
        </div>
      </div>
      <PlaceCardThumb
        lat={lat}
        lng={lng}
        placeName={place.place_name}
        streetViewConfig={streetViewConfig}
      />
    </article>
  );
}
