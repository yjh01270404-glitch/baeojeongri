"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KakaoFullMapView } from "@/components/KakaoFullMapView";
import { PlaceCardVisual } from "@/components/PlaceCardVisual";
import { PlaceDetailModal } from "@/components/PlaceDetailModal";
import { REQUEST_NEARBY_LOCATION_EVENT } from "@/lib/boj-events";
import type { KakaoPlaceItem } from "@/lib/kakao-place";
import { loadKakaoMapsScript } from "@/lib/kakao-loader";
import { naverMapSearchUrl } from "@/lib/map-links";

export type { KakaoPlaceItem } from "@/lib/kakao-place";

const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.978;

const SEARCH_KEYWORDS = ["오토바이 정비", "바이크 정비", "이륜차 정비"];

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
}: Props) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [places, setPlaces] = useState<KakaoPlaceItem[]>([]);
  const [locLabel, setLocLabel] = useState("위치 확인 중…");
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
        radius: 12_000,
        size: 15,
        sort: kakao.maps.services.SortBy.DISTANCE,
      };

      for (const keyword of SEARCH_KEYWORDS) {
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
            searchOpts,
          );
        });
      }

      const list = [...merged.values()].sort((a, b) => {
        const da = Number(a.distance) || Infinity;
        const db = Number(b.distance) || Infinity;
        return da - db;
      });

      setPlaces(list.slice(0, 48));
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setStatus("error");
      setErrorMsg(
        e instanceof Error ? e.message : "주변 검색에 실패했습니다.",
      );
    }
  }, []);

  useEffect(() => {
    if (realtimeTick === 0) return;
    const c = lastCenterRef.current;
    if (c) void searchNearby(c.lat, c.lng);
  }, [realtimeTick, searchNearby]);

  const requestUserGpsLocation = useCallback(() => {
    setLocationHint(null);
    if (!navigator.geolocation) {
      setLocationHint(
        "이 브라우저는 위치 정보를 지원하지 않습니다. 지도 앱에서 지역을 옮겨 검색해 주세요.",
      );
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
      (err) => {
        setLocationLoading(false);
        setIsApproximateLocation(true);
        if (err.code === 1) {
          setLocationHint(
            "위치 사용이 꺼져 있어요. 주소창 왼쪽 자물쇠(또는 i 표시)를 눌러 ‘위치’를 허용한 뒤, 아래 버튼을 다시 눌러 주세요. 이미 ‘차단’이면 브라우저 설정에서 이 사이트의 위치 권한을 허용해야 합니다.",
          );
        } else if (err.code === 3) {
          setLocationHint(
            "위치 응답이 지연되었습니다. GPS/와이파이를 켠 뒤 다시 시도해 주세요.",
          );
        } else {
          setLocationHint(
            "위치를 가져오지 못했습니다. 잠시 후 다시 눌러 주세요.",
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 18_000,
        maximumAge: 0,
      },
    );
  }, [searchNearby]);

  useEffect(() => {
    const onRequestNearby = () => {
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
  }, [requestUserGpsLocation]);

  useEffect(() => {
    let cancelled = false;
    const key = getAppKey();
    if (!key) {
      setStatus("error");
      setErrorMsg("NEXT_PUBLIC_KAKAO_MAP_APP_KEY를 설정해 주세요.");
      return;
    }

    (async () => {
      if (!navigator.geolocation) {
        if (!cancelled) {
          setLocLabel("위치 미지원 · 서울 시청 기준");
          setIsApproximateLocation(true);
          await searchNearby(DEFAULT_LAT, DEFAULT_LNG);
        }
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (cancelled) return;
          setIsApproximateLocation(false);
          setLocLabel("내 위치 기준");
          await searchNearby(pos.coords.latitude, pos.coords.longitude);
        },
        async () => {
          if (cancelled) return;
          setLocLabel("서울 시청 기준(임시) · 아래에서 내 위치를 켤 수 있어요");
          setIsApproximateLocation(true);
          await searchNearby(DEFAULT_LAT, DEFAULT_LNG);
        },
        { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [searchNearby]);

  const retryDefault = () => {
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

  const tabHint =
    finderTab === "realtime"
      ? "실시간: 카카오 장소 API를 다시 불러옵니다."
      : finderTab === "distance"
        ? "거리순: 현재 목록을 거리 가까운 순으로 정렬합니다."
        : "지도: 검색된 정비소를 한 화면 지도에서 봅니다. 마커를 누르면 상세가 열립니다.";

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
            <div className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-white sm:flex-row sm:items-stretch">
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
                    : "border-gray-100 bg-white hover:border-gray-200"
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

          <p className="mt-2 text-xs leading-relaxed text-gray-400">{tabHint}</p>

          {isApproximateLocation && (
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

          {locationHint && (
            <p className="mx-auto mt-4 max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm leading-relaxed text-amber-950">
              {locationHint}
            </p>
          )}

          {status === "error" && (
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
        </div>

        {status === "loading" && (
          <div className="py-16 text-left text-sm font-medium text-gray-400">
            주변 정비소를 불러오는 중…
          </div>
        )}

        {status === "ready" && filteredPlaces.length === 0 && (
          <div className="py-16 text-left text-sm text-gray-500">
            {places.length === 0
              ? "반경 내 검색 결과가 없습니다."
              : "조건에 맞는 정비소가 없습니다. 검색어나 작업 필터를 바꿔 보세요."}
          </div>
        )}

        {status === "ready" &&
          finderTab === "map" &&
          filteredPlaces.length > 0 &&
          kakaoSdkReady && (
            <div className="mb-6">
              <KakaoFullMapView
                places={filteredPlaces}
                centerLat={mapCenter.lat}
                centerLng={mapCenter.lng}
                onSelectPlace={onMapSelectPlace}
              />
            </div>
          )}

        {status === "ready" &&
          finderTab === "map" &&
          filteredPlaces.length > 0 &&
          !kakaoSdkReady && (
            <p className="mb-6 text-left text-sm text-gray-500">
              지도 SDK를 불러오는 중입니다. 잠시 후 다시 전환해 주세요.
            </p>
          )}

        {status === "ready" &&
          filteredPlaces.length > 0 &&
          finderTab !== "map" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPlaces.map((p) => (
                <article
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetailPlace(p);
                    }
                  }}
                  onClick={() => setDetailPlace(p)}
                  className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-[#00BFA5] hover:shadow-md"
                >
                  <div className="shrink-0">
                    <PlaceCardVisual
                      lat={Number(p.y)}
                      lng={Number(p.x)}
                      placeName={p.place_name}
                      streetViewConfig={streetViewConfig}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-3 text-left">
                    <h3 className="line-clamp-2 text-base font-bold text-gray-900">
                      {p.place_name}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                      {p.category_name}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-sm text-gray-600">
                      {p.road_address_name || p.address_name}
                    </p>
                    {p.phone ? (
                      <div className="mt-2">
                        {isLoggedIn ? (
                          <p className="text-sm font-medium text-gray-800">
                            📞 {p.phone}
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestLogin();
                            }}
                            className="text-left text-sm font-medium text-[#00BFA5] underline-offset-2 hover:underline"
                          >
                            📞 {maskPhone(p.phone)} — 로그인하고 전화번호 보기
                          </button>
                        )}
                      </div>
                    ) : null}
                    <div className="mt-auto space-y-1.5 pt-2">
                      {p.distance ? (
                        <p className="text-xs font-bold text-[#00BFA5]">
                          {formatDistance(p.distance)} · 근처
                        </p>
                      ) : null}
                      <div
                        className="flex flex-wrap gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={naverMapSearchUrl(p.place_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-w-[8rem] flex-1 items-center justify-center rounded-lg border border-[#03C75A] bg-[#03C75A] px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-95"
                        >
                          네이버지도에서 보기
                        </a>
                        <a
                          href={p.place_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-w-[8rem] flex-1 items-center justify-center rounded-lg border border-[#FEE500] bg-[#FEE500] px-3 py-1.5 text-xs font-bold text-[#3C1E1E] transition hover:brightness-95"
                        >
                          카카오맵에서 보기
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

        <p className="mt-10 text-left text-[11px] leading-relaxed text-gray-400">
          장소 데이터 © Kakao · 미로그인 시 전화번호는 일부만 표시됩니다.
        </p>
      </div>
    </section>
  );
}
