"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KakaoFullMapView } from "@/components/KakaoFullMapView";
import { PlaceDetailModal } from "@/components/PlaceDetailModal";
import { ShopResultCard } from "@/components/ShopResultCard";
import { REQUEST_NEARBY_LOCATION_EVENT } from "@/lib/rjb-events";
import type { KakaoPlaceItem } from "@/lib/kakao-place";
import { loadKakaoMapsScript } from "@/lib/kakao-loader";

export type { KakaoPlaceItem } from "@/lib/kakao-place";

const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.978;

const SEARCH_KEYWORDS = [
  "오토바이 정비",
  "바이크 정비",
  "이륜차 정비",
  "오토바이 수리",
  "바이크 수리",
  "오토바이 센터",
];
const SEARCH_PAGES = [1, 2, 3, 4] as const;

export type FinderTab = "realtime" | "distance" | "map";

function getAppKey() {
  return process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? "";
}

function formatDistance(meters: string | undefined) {
  if (!meters) return "";
  const m = Number(meters);
  if (!Number.isFinite(m) || m < 0) return "";
  if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
  return `${Math.round(m)}m`;
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length < 8) return "로그인 후 확인";
  return `${d.slice(0, 3)}-****-${d.slice(-4)}`;
}

function shortAddress(p: KakaoPlaceItem, max = 40) {
  const s = p.road_address_name || p.address_name || "";
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

type Props = {
  heroFilter: string;
  onHeroFilterChange: (value: string) => void;
  isLoggedIn: boolean;
  onRequestLogin: () => void;
  finderTab: FinderTab;
  /** 실시간 탭 클릭 시 증가 → 카카오 API 재검색 */
  realtimeTick: number;
  onRealtimeTab: () => void;
  onDistanceTab: () => void;
  onMapTab: () => void;
  /** 검색·실시간·내 주변 실행 전까지 목록/지도 미표시 */
  resultsOpen: boolean;
  onOpenResults: () => void;
};

export function KakaoShopFinderSection({
  heroFilter,
  onHeroFilterChange,
  isLoggedIn,
  onRequestLogin,
  finderTab,
  realtimeTick,
  onRealtimeTab,
  onDistanceTab,
  onMapTab,
  resultsOpen,
  onOpenResults,
}: Props) {
  const PAGE_SIZE = 18;
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [places, setPlaces] = useState<KakaoPlaceItem[]>([]);
  const [locLabel, setLocLabel] = useState(
    "검색하기 · 실시간 · 내 주변을 누르면 목록이 열립니다",
  );
  const [streetViewConfig, setStreetViewConfig] = useState<boolean | null>(
    null,
  );
  const [isApproximateLocation, setIsApproximateLocation] = useState(false);
  const [locationHint, setLocationHint] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
  });
  const [detailPlace, setDetailPlace] = useState<KakaoPlaceItem | null>(null);
  const [kakaoSdkReady, setKakaoSdkReady] = useState(false);
  const [page, setPage] = useState(1);

  const lastCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  const onMapSelectPlace = useCallback((p: KakaoPlaceItem) => {
    setDetailPlace(p);
  }, []);

  useEffect(() => {
    fetch("/api/streetview-config")
      .then((r) => r.json())
      .then((d: { enabled?: boolean }) =>
        setStreetViewConfig(Boolean(d.enabled)),
      )
      .catch(() => setStreetViewConfig(false));
  }, []);

  const searchNearby = useCallback(async (lat: number, lng: number) => {
    const key = getAppKey();
    if (!key) {
      setStatus("error");
      setErrorMsg("카카오맵 앱 키가 설정되지 않았습니다.");
      return;
    }

    setStatus("loading");
    setErrorMsg(null);

    try {
      await loadKakaoMapsScript(key);
      const kakao = window.kakao;
      if (!kakao?.maps?.services) {
        throw new Error("Kakao Maps services unavailable");
      }
      setKakaoSdkReady(Boolean(kakao.maps.Map));

      lastCenterRef.current = { lat, lng };
      setMapCenter({ lat, lng });

      const ps = new kakao.maps.services.Places();
      const loc = new kakao.maps.LatLng(lat, lng);
      const merged = new Map<string, KakaoPlaceItem>();

      const searchOpts = {
        location: loc,
        radius: 20_000,
        size: 15,
        sort: kakao.maps.services.SortBy.DISTANCE,
      };

      for (const keyword of SEARCH_KEYWORDS) {
        for (const page of SEARCH_PAGES) {
          await new Promise<void>((resolve) => {
            ps.keywordSearch(
              keyword,
              (data, searchStatus) => {
                if (
                  searchStatus === kakao.maps.services.Status.OK &&
                  Array.isArray(data)
                ) {
                  for (const p of data) {
                    merged.set(p.id, {
                      id: p.id,
                      place_name: p.place_name,
                      category_name: p.category_name,
                      phone: p.phone,
                      address_name: p.address_name,
                      road_address_name: p.road_address_name,
                      x: p.x,
                      y: p.y,
                      place_url: p.place_url,
                      distance: p.distance,
                    });
                  }
                }
                resolve();
              },
              { ...searchOpts, page },
            );
          });
        }
      }

      const list = [...merged.values()].sort((a, b) => {
        const da = Number(a.distance) || Infinity;
        const db = Number(b.distance) || Infinity;
        return da - db;
      });

      setPlaces(list.slice(0, 120));
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setStatus("error");
      setErrorMsg(
        e instanceof Error ? e.message : "주변 검색에 실패했습니다.",
      );
    }
  }, []);

  const ensureLocationThenSearch = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocLabel("위치 미지원 · 서울 시청 기준");
      setIsApproximateLocation(true);
      await searchNearby(DEFAULT_LAT, DEFAULT_LNG);
      return;
    }
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setIsApproximateLocation(false);
          setLocLabel("내 위치 기준");
          await searchNearby(pos.coords.latitude, pos.coords.longitude);
          resolve();
        },
        async () => {
          setLocLabel("서울 시청 기준(임시) · 아래에서 내 위치를 켤 수 있어요");
          setIsApproximateLocation(true);
          await searchNearby(DEFAULT_LAT, DEFAULT_LNG);
          resolve();
        },
        { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
      );
    });
  }, [searchNearby]);

  useEffect(() => {
    if (!resultsOpen) return;
    if (realtimeTick === 0) return;
    const c = lastCenterRef.current;
    if (c) {
      void searchNearby(c.lat, c.lng);
    } else {
      void ensureLocationThenSearch();
    }
  }, [realtimeTick, resultsOpen, searchNearby, ensureLocationThenSearch]);

  /** 거리순·지도만 먼저 눌렀을 때 첫 데이터 로드 */
  useEffect(() => {
    if (!resultsOpen) return;
    if (finderTab === "realtime") return;
    if (status !== "idle") return;
    if (places.length > 0) return;
    void ensureLocationThenSearch();
  }, [
    resultsOpen,
    finderTab,
    status,
    places.length,
    ensureLocationThenSearch,
  ]);

  const requestUserGpsLocation = useCallback(() => {
    onOpenResults();
    setLocationHint(null);
    if (!navigator.geolocation) {
      setLocationHint(
        "이 브라우저는 위치 정보를 지원하지 않습니다. 우선 서울 시청 기준으로 목록을 불러옵니다.",
      );
      setLocLabel("위치 미지원 · 서울 시청 기준");
      setIsApproximateLocation(true);
      void searchNearby(DEFAULT_LAT, DEFAULT_LNG);
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsApproximateLocation(false);
        setLocLabel("내 위치 기준");
        await searchNearby(pos.coords.latitude, pos.coords.longitude);
        setLocationLoading(false);
      },
      async (err) => {
        setLocationLoading(false);
        setIsApproximateLocation(true);
        if (err.code === 1) {
          setLocationHint(
            "위치 사용이 꺼져 있어요. 주소창 왼쪽 자물쇠(또는 i 표시)를 눌러 ‘위치’를 허용한 뒤, 아래 버튼을 다시 눌러 주세요. 이미 ‘차단’이면 브라우저 설정에서 이 사이트의 위치 권한을 허용해야 합니다. 우선 서울 시청 기준으로 목록을 보여 드립니다.",
          );
        } else if (err.code === 3) {
          setLocationHint(
            "위치 응답이 지연되었습니다. GPS/와이파이를 켠 뒤 다시 시도해 주세요. 우선 서울 시청 기준으로 목록을 보여 드립니다.",
          );
        } else {
          setLocationHint(
            "위치를 가져오지 못했습니다. 잠시 후 다시 눌러 주세요. 우선 서울 시청 기준으로 목록을 보여 드립니다.",
          );
        }
        setLocLabel("서울 시청 기준(임시) · 아래에서 내 위치를 켤 수 있어요");
        await searchNearby(DEFAULT_LAT, DEFAULT_LNG);
      },
      {
        enableHighAccuracy: true,
        timeout: 18_000,
        maximumAge: 0,
      },
    );
  }, [searchNearby, onOpenResults]);

  useEffect(() => {
    const onRequestNearby = () => {
      onOpenResults();
      document.getElementById("shop-finder")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      requestUserGpsLocation();
    };
    window.addEventListener(REQUEST_NEARBY_LOCATION_EVENT, onRequestNearby);
    return () =>
      window.removeEventListener(
        REQUEST_NEARBY_LOCATION_EVENT,
        onRequestNearby,
      );
  }, [requestUserGpsLocation, onOpenResults]);

  useEffect(() => {
    if (resultsOpen) return;
    if (!getAppKey()) {
      setStatus("error");
      setErrorMsg("NEXT_PUBLIC_KAKAO_MAP_APP_KEY를 설정해 주세요.");
      return;
    }
    setPlaces([]);
    setStatus("idle");
    setErrorMsg(null);
    setPage(1);
    lastCenterRef.current = null;
    setKakaoSdkReady(false);
    setLocationHint(null);
    setDetailPlace(null);
    setLocLabel("검색하기 · 실시간 · 내 주변을 누르면 목록이 열립니다");
    setIsApproximateLocation(false);
  }, [resultsOpen]);

  const retryDefault = () => {
    onOpenResults();
    setLocLabel("서울 시청 기준");
    setIsApproximateLocation(true);
    setLocationHint(null);
    void searchNearby(DEFAULT_LAT, DEFAULT_LNG);
  };

  const filteredPlaces = useMemo(() => {
    const h = normalize(heroFilter);
    let list = places.filter((p) => {
      const blob = normalize(
        `${p.place_name} ${p.category_name} ${p.address_name} ${p.road_address_name}`,
      );
      if (h && !blob.includes(h)) return false;
      return true;
    });

    if (finderTab === "distance") {
      list = [...list].sort(
        (a, b) =>
          (Number(a.distance) || Infinity) - (Number(b.distance) || Infinity),
      );
    }

    return list;
  }, [places, heroFilter, finderTab]);

  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / PAGE_SIZE));
  const pagedPlaces = filteredPlaces.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [heroFilter, finderTab, places.length]);

  return (
    <section
      id="shop-finder"
      className="scroll-mt-20 border-y border-gray-100 bg-[#fafafa] py-16"
    >
      <PlaceDetailModal
        place={detailPlace}
        onClose={() => setDetailPlace(null)}
        isLoggedIn={isLoggedIn}
        onRequestLogin={onRequestLogin}
        streetViewConfig={streetViewConfig}
      />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 text-left">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#00BFA5]">
            FIND
          </p>
          <h2 className="text-3xl font-black text-gray-900">
            주변 오토바이 정비소
          </h2>
          <p className="mt-3 text-sm text-gray-500">{locLabel}</p>

          <div className="mt-4 max-w-2xl">
            <div className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg sm:flex-row sm:items-stretch">
              <div className="flex flex-1 items-center gap-3 px-5 py-3 sm:py-0">
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5 shrink-0"
                >
                  <path
                    d="M10 2C6.686 2 4 4.686 4 8C4 12.5 10 18 10 18S16 12.5 16 8C16 4.686 13.314 2 10 2Z"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="10"
                    cy="8"
                    r="2.5"
                    stroke="#9CA3AF"
                    strokeWidth="1.5"
                  />
                </svg>
                <input
                  type="text"
                  value={heroFilter}
                  onChange={(e) => onHeroFilterChange(e.target.value)}
                  placeholder="지역·정비소명·증상"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={onRealtimeTab}
                className="m-2 shrink-0 rounded-xl bg-[#00BFA5] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#009E88] sm:self-center"
              >
                검색하기
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              예: 송파 타이어, 영등포 야간
            </p>
          </div>

          {!resultsOpen && (
            <div className="mt-4 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
              {(
                [
                  {
                    key: "realtime" as const,
                    title: "실시간",
                    sub: "카카오 재검색",
                    onClick: onRealtimeTab,
                  },
                  {
                    key: "distance" as const,
                    title: "거리순",
                    sub: "가까운 순 정렬",
                    onClick: onDistanceTab,
                  },
                  {
                    key: "map" as const,
                    title: "지도",
                    sub: "전체 지도 뷰",
                    onClick: onMapTab,
                  },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={t.onClick}
                  className={`rounded-xl border px-2 py-4 text-left transition sm:px-4 ${
                    finderTab === t.key
                      ? "border-[#00BFA5] bg-[#00BFA5]/10 shadow-sm"
                      : "border-gray-100 bg-white shadow-sm hover:border-gray-200"
                  }`}
                >
                  <div className="text-lg font-black tracking-tight text-gray-900 sm:text-xl">
                    {t.title}
                  </div>
                  <div className="mt-1 text-[11px] leading-snug text-gray-400 sm:text-xs">
                    {t.sub}
                  </div>
                </button>
              ))}
            </div>
          )}

          {resultsOpen && isApproximateLocation && (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-[#00BFA5]/25 bg-white px-5 py-5 text-left shadow-sm">
              <p className="text-sm font-bold text-gray-900">
                내 근처 기준으로 다시 찾기
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                첫 화면에서 위치를 거절하셨다면, 아래 버튼을 눌러 브라우저에
                위치 허용 후 목록을 내 주변 기준으로 바꿀 수 있어요.
              </p>
              <button
                type="button"
                onClick={requestUserGpsLocation}
                disabled={locationLoading}
                className="mt-4 w-full rounded-xl bg-[#00BFA5] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#009E88] disabled:cursor-wait disabled:opacity-80 sm:w-auto"
              >
                {locationLoading
                  ? "위치 확인 중…"
                  : "📍 내 근처 정비소 찾기 (위치 다시 허용)"}
              </button>
            </div>
          )}

          {resultsOpen && locationHint && (
            <p className="mx-auto mt-4 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm leading-relaxed text-amber-950">
              {locationHint}
            </p>
          )}

          {status === "error" &&
            errorMsg &&
            (resultsOpen || !getAppKey()) && (
            <div className="mt-6 space-y-2">
              <p className="text-sm text-red-600">{errorMsg}</p>
              <button
                type="button"
                onClick={retryDefault}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                서울 기준으로 다시 검색
              </button>
            </div>
          )}

          {!resultsOpen && getAppKey() && status === "idle" && (
            <p className="mt-6 text-left text-sm leading-relaxed text-gray-500">
              정비소 카드 목록은{" "}
              <span className="font-semibold text-gray-700">검색하기</span>·
              <span className="font-semibold text-gray-700">실시간</span> 또는
              메뉴의{" "}
              <span className="font-semibold text-gray-700">내 주변 정비소</span>
              를 누른 뒤에 표시됩니다.
            </p>
          )}
        </div>

        {resultsOpen && status === "loading" && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="h-[min(36vh,280px)] animate-pulse bg-gray-200" />
            <div className="flex justify-center py-2 md:hidden">
              <div className="h-1 w-9 rounded-full bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl bg-gray-100"
                  aria-hidden
                />
              ))}
            </div>
            <p className="pb-4 text-center text-sm text-gray-400">
              주변 정비소를 불러오는 중…
            </p>
          </div>
        )}

        {resultsOpen &&
          status === "ready" &&
          filteredPlaces.length === 0 && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-10 text-left text-sm text-gray-500 shadow-lg">
              {places.length === 0
                ? "반경 내 검색 결과가 없습니다."
                : "조건에 맞는 정비소가 없습니다. 검색어를 바꿔 보세요."}
            </div>
          )}

        {resultsOpen &&
          status === "ready" &&
          filteredPlaces.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              {/* 상단 검색 요약 (네이버 지도 검색창 느낌) */}
              <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                  {heroFilter.trim()
                    ? heroFilter
                    : "오토바이 정비 · 주변 검색 결과"}
                </span>
                {heroFilter.trim() ? (
                  <button
                    type="button"
                    onClick={() => onHeroFilterChange("")}
                    className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="검색어 지우기"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                ) : null}
              </div>

              {/* 지도 영역 */}
              {kakaoSdkReady ? (
                <KakaoFullMapView
                  places={filteredPlaces}
                  centerLat={mapCenter.lat}
                  centerLng={mapCenter.lng}
                  onSelectPlace={onMapSelectPlace}
                  className={
                    finderTab === "map"
                      ? "h-[min(52vh,440px)] w-full border-0 border-b border-gray-200 bg-gray-200 shadow-inner"
                      : "h-[min(36vh,300px)] w-full border-0 border-b border-gray-200 bg-gray-200 shadow-inner md:h-[min(40vh,360px)]"
                  }
                />
              ) : (
                <div className="flex h-[min(36vh,300px)] items-center justify-center border-b border-gray-200 bg-gray-100 text-sm text-gray-500">
                  지도를 불러오는 중입니다…
                </div>
              )}

              {/* 바텀 시트 핸들 */}
              <div className="flex justify-center bg-white py-2 md:hidden">
                <div className="h-1 w-10 rounded-full bg-gray-200" />
              </div>

              {/* 정렬 · 뷰 (네이버 필터 바 느낌) */}
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-[#f5f6f8] px-3 py-2.5">
                <span className="text-xs font-medium text-gray-600">
                  현재 위치 기준
                </span>
                <div className="ml-auto flex flex-wrap justify-end gap-1">
                  {(
                    [
                      {
                        key: "realtime" as const,
                        label: "실시간",
                        onClick: onRealtimeTab,
                      },
                      {
                        key: "distance" as const,
                        label: "거리순",
                        onClick: onDistanceTab,
                      },
                      {
                        key: "map" as const,
                        label: "지도",
                        onClick: onMapTab,
                      },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={t.onClick}
                      className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                        finderTab === t.key
                          ? "border-[#00BFA5] bg-white text-[#00BFA5] shadow-sm"
                          : "border-transparent bg-white/60 text-gray-600 hover:bg-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 결과 그리드: 모바일 2열 */}
              <div className="max-h-[min(52vh,560px)] overflow-y-auto overscroll-contain bg-[#fafafa] px-2 py-3 md:max-h-none md:overflow-visible">
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 lg:grid-cols-4">
                  {pagedPlaces.map((p) => (
                    <ShopResultCard
                      key={p.id}
                      place={p}
                      distanceLabel={formatDistance(p.distance)}
                      addressShort={shortAddress(p)}
                      isLoggedIn={isLoggedIn}
                      onRequestLogin={onRequestLogin}
                      onOpenDetail={() => setDetailPlace(p)}
                      streetViewConfig={streetViewConfig}
                      maskPhone={maskPhone}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2 pb-2">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      이전
                    </button>
                    <span className="text-xs font-medium text-gray-500">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page === totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      다음 페이지
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        <p className="mt-10 text-left text-[11px] leading-relaxed text-gray-400">
          로그인 시 상세내용 확인 가능합니다.
        </p>
      </div>
    </section>
  );
}
