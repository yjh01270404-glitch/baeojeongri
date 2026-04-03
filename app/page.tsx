"use client";

import { useState, useEffect, type MouseEvent as ReactMouseEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/LoginModal";
import {
  KakaoShopFinderSection,
  type FinderTab,
} from "@/components/KakaoShopFinderSection";
import { dispatchRequestNearbyLocation } from "@/lib/boj-events";

const SUPPORT_EMAIL = "support@baeojeongri.kr";

type NavItem =
  | { label: string; href: string }
  | { label: string; href: string; requestNearbyGps: true };

const NAV_LINKS: NavItem[] = [
  { label: "정비소 찾기", href: "#shop-finder" },
  { label: "내 주변 정비소", href: "#shop-finder", requestNearbyGps: true },
  { label: "자가정비 정보", href: "#services" },
  { label: "가입·리뷰·혜택 정책", href: "/policy" },
  { label: "제보·신고", href: "/report" },
  {
    label: "정비소 등록 문의",
    href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("배오정리 정비소 등록·제휴 문의")}`,
  },
  { label: "이용안내", href: "#cta" },
];

const SERVICES = [
  {
    title: "정비소 가격 비교",
    desc: "기종별·작업별 실제 지불 금액을 투명하게 비교합니다.",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="12" fill="#E6F9F7"/><rect x="13" y="20" width="5" height="14" rx="2" fill="#00BFA5" fill-opacity="0.15" stroke="#00BFA5" stroke-width="1.5"/><rect x="21.5" y="14" width="5" height="20" rx="2" fill="#00BFA5" fill-opacity="0.15" stroke="#00BFA5" stroke-width="1.5"/><rect x="30" y="26" width="5" height="8" rx="2" fill="#00BFA5" fill-opacity="0.15" stroke="#00BFA5" stroke-width="1.5"/><circle cx="34" cy="22" r="3.5" fill="#009E88"/><circle cx="24" cy="10" r="3.5" fill="#009E88"/><circle cx="14" cy="16" r="3.5" fill="#009E88"/></svg>`,
  },
  {
    title: "내 주변 정비소 찾기",
    desc: "거리와 만족도 기준으로 가까운 정비소를 찾아보세요.",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="12" fill="#E6F9F7"/><path d="M24 11C18.477 11 14 15.477 14 21C14 28.5 24 39 24 39C24 39 34 28.5 34 21C34 15.477 29.523 11 24 11Z" fill="#00BFA5" fill-opacity="0.12" stroke="#00BFA5" stroke-width="2"/><circle cx="24" cy="21" r="5" fill="#009E88"/><circle cx="24" cy="21" r="2.5" fill="white"/></svg>`,
  },
  {
    title: "익명 리뷰 작성",
    desc: "익명이 보장되니 부담 없이 경험을 공유해주세요.",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="12" fill="#E6F9F7"/><path d="M31 13L35 17L19 33L13 35L15 29L31 13Z" fill="#00BFA5" fill-opacity="0.12" stroke="#00BFA5" stroke-width="2" stroke-linejoin="round"/><path d="M28 16L32 20" stroke="#009E88" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    title: "라이더 자가정비 정보공유",
    desc: "오일 교환·체인 슬랙·에어필터 같은 자가정비 노하우와 주의점을 라이더끼리 나눕니다.",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="12" fill="#E6F9F7"/><path d="M22 12C15.373 12 10 16.925 10 23C10 26.3 11.6 29.3 14.2 31.3L12 38L19 35.5C20.1 35.8 21 36 22 36C28.627 36 34 31.075 34 24.5" stroke="#00BFA5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#00BFA5" fill-opacity="0.08"/><circle cx="18" cy="23" r="1.5" fill="#00BFA5"/><circle cx="23" cy="23" r="1.5" fill="#00BFA5"/><circle cx="28" cy="23" r="1.5" fill="#00BFA5"/><circle cx="36" cy="14" r="6" fill="#009E88"/><path d="M34 14H38M36 12V16" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  },
];

export default function Home() {
  const [heroSearch, setHeroSearch] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [finderTab, setFinderTab] = useState<FinderTab>("realtime");
  const [realtimeTick, setRealtimeTick] = useState(0);
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("boj_auth_session_v1");
    } catch {
      /* ignore */
    }
  }, []);

  const isLoggedIn = status === "authenticated";

  const scrollToFinder = () => {
    document.getElementById("shop-finder")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const onRealtimeTab = () => {
    setFinderTab("realtime");
    setRealtimeTick((n) => n + 1);
    setTimeout(scrollToFinder, 80);
  };

  const onDistanceTab = () => {
    setFinderTab("distance");
    setTimeout(scrollToFinder, 80);
  };

  const onMapTab = () => {
    setFinderTab("map");
    setTimeout(scrollToFinder, 80);
  };

  const onNavClick = (
    e: ReactMouseEvent<HTMLAnchorElement>,
    item: NavItem,
  ) => {
    setMobileMenuOpen(false);
    if ("requestNearbyGps" in item && item.requestNearbyGps) {
      e.preventDefault();
      dispatchRequestNearbyLocation();
      return;
    }
    if (item.href.startsWith("#")) {
      e.preventDefault();
      document
        .getElementById(item.href.slice(1))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* 상단 안내바 */}
      <div className="bg-[#00BFA5] py-2 text-xs text-white/80">
        <div className="mx-auto max-w-7xl px-6 text-center">
          배달라이더 전용 정비소 정보 플랫폼
          <br />
          로그인 시 정비소의 상세정보가 표시됩니다
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:h-16 md:py-0">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00BFA5]">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-xl font-black leading-none text-[#00BFA5]">
                배오정리
              </div>
              <div className="mt-0.5 text-[10px] text-gray-400">
                배달 오토바이 정비소 · 실데이터
              </div>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => onNavClick(e, link)}
                  className="text-sm font-medium text-gray-500 transition-colors hover:text-[#00BFA5]"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {session ? (
              <div className="flex items-center gap-2">
                <span className="max-w-[7rem] truncate text-xs text-gray-600">
                  {session.user?.name ?? session.user?.email ?? "회원"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-200 text-xs font-bold sm:text-sm"
                  onClick={() => void signOut({ callbackUrl: "/" })}
                >
                  로그아웃
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                className="rounded-lg bg-[#00BFA5] px-4 font-bold text-white hover:bg-[#009E88]"
                onClick={() => setShowLogin(true)}
              >
                로그인
              </Button>
            )}
          </div>

          {/* Mobile menu */}
          <div className="flex items-center gap-2 md:hidden">
            {session ? (
              <>
                <span className="max-w-[7rem] truncate text-xs font-medium text-gray-600">
                  {session.user?.name ?? session.user?.email ?? "회원"}님
                </span>
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-200 bg-white px-3 text-xs font-bold"
                  onClick={() => void signOut({ callbackUrl: "/" })}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <Button
                type="button"
                className="rounded-lg bg-[#00BFA5] px-3 text-xs font-bold text-white hover:bg-[#009E88]"
                onClick={() => setShowLogin(true)}
              >
                로그인
              </Button>
            )}

            <button
              type="button"
              aria-label="메뉴 열기"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="#00BFA5"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white md:hidden">
            <div className="mx-auto max-w-7xl px-6 py-3">
              <div className="flex flex-col gap-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    메뉴
                  </span>
                  <button
                    type="button"
                    aria-label="메뉴 닫기"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:border-[#00BFA5]/60 hover:text-[#00BFA5]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => onNavClick(e, link)}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {link.label}
                  </a>
                ))}

                <div className="mt-2 border-t border-gray-100 pt-3">
                  {session ? (
                    <button
                      type="button"
                      onClick={() => void signOut({ callbackUrl: "/" })}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                    >
                      로그아웃
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowLogin(true)}
                      className="w-full rounded-xl bg-[#00BFA5] px-4 py-3 text-sm font-bold text-white hover:bg-[#009E88]"
                    >
                      로그인
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 히어로 */}
      <section className="border-b border-[#00B89A] bg-[#00B89A] py-[60px] [word-break:keep-all]">
        <div className="mx-auto w-full max-w-3xl px-5">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-xs font-semibold text-white">
              배달라이더 전용 · 카카오맵/네이버지도 검색
            </span>
          </div>
          <h1 className="text-left text-[28px] font-bold leading-[1.3] text-white md:text-[40px]">
            정비소마다 가격이 왜 이렇게 다를까요?
          </h1>
          <p className="mt-3 text-left text-[18px] font-bold leading-[1.3] text-[#FFFBE6]">
            라이더가 직접 만든 정비소 비교 플랫폼
          </p>

          <div className="mt-6 text-left text-[14px] leading-[1.8] text-white/90">
            <p>견적마다 설명은 애매하고, 부품값은 훌쩍 올라가 있습니다.</p>
            <p>라이더가 직접 남긴 실제 정비 금액으로 합리적인 선택을 하세요.</p>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#00B89A] transition hover:bg-gray-50"
            >
              로그인하기
            </button>
            <button
              type="button"
              onClick={scrollToFinder}
              className="rounded-full border border-white px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              정비소 찾기
            </button>
          </div>

        </div>
      </section>

      <KakaoShopFinderSection
        heroFilter={heroSearch}
        onHeroFilterChange={setHeroSearch}
        isLoggedIn={isLoggedIn}
        onRequestLogin={() => setShowLogin(true)}
        finderTab={finderTab}
        realtimeTick={realtimeTick}
        onRealtimeTab={onRealtimeTab}
        onDistanceTab={onDistanceTab}
        onMapTab={onMapTab}
      />

      {/* 주요 서비스 */}
      <section id="services" className="scroll-mt-20 bg-gray-50/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-left">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#00BFA5]">
              SERVICES
            </p>
            <h2 className="text-3xl font-black text-gray-900">주요 서비스</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    (e.currentTarget as HTMLDivElement).click();
                  }
                }}
                onClick={() => {
                  if (s.title.includes("내 주변")) {
                    dispatchRequestNearbyLocation();
                    return;
                  }
                  if (s.title.includes("가격")) {
                    scrollToFinder();
                    return;
                  }
                  if (s.title.includes("리뷰")) {
                    document.getElementById("cta")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    return;
                  }
                  document.getElementById("services")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-7 transition-all hover:border-[#00BFA5]"
              >
                <div
                  className="mb-5 h-12 w-12"
                  dangerouslySetInnerHTML={{ __html: s.svg }}
                />
                <h3 className="mb-2 text-base font-bold text-gray-900 transition-colors group-hover:text-[#00BFA5]">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="scroll-mt-20 bg-[#00BFA5] py-24 text-left">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            직접 경험한 리뷰를 공유하고
            <br />
            정비소 상세정보를 한눈에
          </h2>
          <p className="mb-10 text-sm leading-relaxed text-white/70">
            직접 작성한 리뷰로 정비소 상세정보가 잠금 해제됩니다. 네이버 계정으로 로그인하면 연락처까지 한 번에 확인할 수 있어요.
          </p>
          <div className="flex flex-wrap justify-start gap-3">
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-[#00BFA5] transition-colors hover:bg-gray-50"
            >
              로그인하기
            </button>
            <button
              type="button"
              onClick={scrollToFinder}
              className="rounded-xl border border-white/40 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              정비소 찾기
            </button>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer id="footer" className="scroll-mt-20 border-t border-gray-100 bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00BFA5]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path
                      d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xl font-black text-[#00BFA5]">
                  배오정리
                </span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-gray-500">
                배달라이더 전용 오토바이 정비소 검색·비교 서비스.
                <br />
                정보의 사전 확인으로 불필요한 지출을 줄이세요.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {[
                {
                  title: "서비스",
                  links: [
                    { label: "정비소 찾기", href: "/#shop-finder" },
                    { label: "자가정비 정보", href: "/#services" },
                    {
                      label: "제휴·등록",
                      href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("배오정리 제휴·정비소 등록")}`,
                    },
                  ],
                },
                {
                  title: "고객센터",
                  links: [
                    { label: "이용안내", href: "/#cta" },
                    { label: "가입·리뷰·혜택 정책", href: "/policy" },
                    { label: "제보·신고", href: "/report" },
                    {
                      label: "문의하기",
                      href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("배오정리 문의")}`,
                    },
                  ],
                },
                {
                  title: "법적 고지",
                  links: [
                    {
                      label: "개인정보처리방침",
                      href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("개인정보처리방침 문서 요청")}`,
                    },
                    {
                      label: "서비스 이용약관",
                      href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("이용약관 문서 요청")}`,
                    },
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    {col.title}
                  </p>
                  <ul className="space-y-2.5">
                    {col.links.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          className="text-sm text-gray-500 transition-colors hover:text-[#00BFA5]"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-12 border-t border-gray-100 pt-6 text-left text-xs text-gray-400">
            © {new Date().getFullYear()} 배오정리. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
