"use client";

import { useEffect, useMemo, useState } from "react";
import { PlaceCardVisual } from "@/components/PlaceCardVisual";
import type { KakaoPlaceItem } from "@/lib/kakao-place";
import { naverMapSearchUrl } from "@/lib/map-links";
import { useSession } from "next-auth/react";

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

type PlaceUserReview = {
  id: string;
  placeId: string;
  userEmail: string;
  userName: string;
  content: string;
  createdAt: number;
};

const REVIEWS_KEY = "boj_place_reviews_v1";

function safeReadReviews(): PlaceUserReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PlaceUserReview[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function safeWriteReviews(next: PlaceUserReview[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function createReviewId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function PlaceDetailModal({
  place,
  onClose,
  isLoggedIn,
  onRequestLogin,
  streetViewConfig,
}: Props) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const userName = session?.user?.name ?? session?.user?.email ?? "회원";

  const [content, setContent] = useState("");
  const [reviewsVersion, setReviewsVersion] = useState(0);

  useEffect(() => {
    if (!place) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [place, onClose]);

  const reviews = useMemo(() => {
    // localStorage는 외부 상태라 lint가 의존성 추적을 못하므로,
    // 리뷰 작성 시 reviewsVersion을 통해 재계산되도록 의도적으로 참조합니다.
    void reviewsVersion;
    if (!place?.id || !userEmail) return [];
    const all = safeReadReviews();
    return all.filter((r) => r.placeId === place.id && r.userEmail === userEmail);
  }, [place, userEmail, reviewsVersion]);

  const canSubmit = useMemo(() => content.trim().length >= 10, [content]);

  if (!place) return null;

  const lat = Number(place.y);
  const lng = Number(place.x);
  const hoursText = "영업시간: 정보 없음";

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
          <p className="mt-2 text-sm text-gray-600">{hoursText}</p>
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
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#03C75A] bg-[#03C75A] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
            >
              네이버지도에서 보기
            </a>
            <a
              href={place.place_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#FEE500] bg-[#FEE500] px-4 py-3 text-sm font-bold text-[#3C1E1E] transition hover:brightness-95"
            >
              카카오맵에서 보기
            </a>
          </div>

          {/* 리뷰 섹션 */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-black text-gray-900">이용자 리뷰</h3>

            {isLoggedIn ? (
              <>
                {reviews.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-600">
                    첫 번째 리뷰를 남겨보세요.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {reviews
                      .slice()
                      .sort((a, b) => b.createdAt - a.createdAt)
                      .map((r) => (
                        <div
                          key={r.id}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-gray-800">
                              {r.userName}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-gray-700">
                            {r.content}
                          </p>
                        </div>
                      ))}
                  </div>
                )}

                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!place?.id || !userEmail) return;
                    if (!canSubmit) return;
                    const next: PlaceUserReview = {
                      id: createReviewId(),
                      placeId: place.id,
                      userEmail,
                      userName,
                      content: content.trim(),
                      createdAt: Date.now(),
                    };
                    const all = safeReadReviews();
                    safeWriteReviews([...all, next]);
                    setReviewsVersion((v) => v + 1);
                    setContent("");
                  }}
                >
                  <label className="block">
                    <span className="text-xs font-bold text-gray-700">
                      리뷰 내용
                    </span>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={4}
                      className="mt-2 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]"
                      placeholder="직접 경험한 가격/설명/작업 품질을 구체적으로 남겨주세요. (최소 10자)"
                    />
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setContent("")}
                      className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="flex-1 rounded-xl bg-[#00BFA5] py-3 text-sm font-bold text-white hover:bg-[#009E88] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      리뷰 등록
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-gray-600">
                  로그인을 하면 이 정비소에 대한 리뷰를 남길 수 있어요.
                </p>
                <button
                  type="button"
                  onClick={onRequestLogin}
                  className="w-full rounded-xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white hover:bg-[#009E88]"
                >
                  로그인하고 리뷰 작성
                </button>
              </div>
            )}
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
