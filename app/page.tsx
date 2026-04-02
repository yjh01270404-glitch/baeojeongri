"use client";

import { useState } from "react";

const NAV_LINKS = ["정비소 찾기", "내 주변 정비소", "리뷰 작성", "정비소 등록 문의", "이용안내"];

const SERVICES = [
  {
    title: "정비소 가격 비교",
    desc: "기종별·작업별 실제 지불 금액을 투명하게 비교합니다.",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="12" fill="#EEF2FF"/><rect x="13" y="20" width="5" height="14" rx="2" fill="#1B3560" fill-opacity="0.15" stroke="#1B3560" stroke-width="1.5"/><rect x="21.5" y="14" width="5" height="20" rx="2" fill="#1B3560" fill-opacity="0.15" stroke="#1B3560" stroke-width="1.5"/><rect x="30" y="26" width="5" height="8" rx="2" fill="#1B3560" fill-opacity="0.15" stroke="#1B3560" stroke-width="1.5"/><circle cx="34" cy="22" r="3.5" fill="#E8603A"/><circle cx="24" cy="10" r="3.5" fill="#E8603A"/><circle cx="14" cy="16" r="3.5" fill="#E8603A"/></svg>`,
  },
  {
    title: "내 주변 정비소 찾기",
    desc: "거리와 만족도 기준으로 가까운 정비소를 찾아보세요.",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="12" fill="#EEF2FF"/><path d="M24 11C18.477 11 14 15.477 14 21C14 28.5 24 39 24 39C24 39 34 28.5 34 21C34 15.477 29.523 11 24 11Z" fill="#1B3560" fill-opacity="0.12" stroke="#1B3560" stroke-width="2"/><circle cx="24" cy="21" r="5" fill="#E8603A"/><circle cx="24" cy="21" r="2.5" fill="white"/></svg>`,
  },
  {
    title: "익명 리뷰 작성",
    desc: "익명이 보장되니 부담 없이 경험을 공유해주세요.",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="12" fill="#EEF2FF"/><path d="M31 13L35 17L19 33L13 35L15 29L31 13Z" fill="#1B3560" fill-opacity="0.12" stroke="#1B3560" stroke-width="2" stroke-linejoin="round"/><path d="M28 16L32 20" stroke="#E8603A" stroke-width="2.5" stroke-linecap="round"/><path d="M14 34L15 29L19 33L14 34Z" fill="#1B3560"/></svg>`,
  },
  {
    title: "라이더 커뮤니티",
    desc: "기종·정비 이슈 정보를 빠르게 교환할 수 있습니다.",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="12" fill="#EEF2FF"/><path d="M22 12C15.373 12 10 16.925 10 23C10 26.3 11.6 29.3 14.2 31.3L12 38L19 35.5C20.1 35.8 21 36 22 36C28.627 36 34 31.075 34 24.5C34 24.2 34 23.8 33.9 23.5" stroke="#1B3560" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#1B3560" fill-opacity="0.08"/><circle cx="18" cy="23" r="1.5" fill="#1B3560"/><circle cx="23" cy="23" r="1.5" fill="#1B3560"/><circle cx="28" cy="23" r="1.5" fill="#1B3560"/><circle cx="36" cy="14" r="6" fill="#E8603A"/><path d="M34 14H38M36 12V16" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  },
];

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5">
        <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none">
          <path d="M7 1L8.5 5H13L9.5 7.5L11 12L7 9.5L3 12L4.5 7.5L1 5H5.5L7 1Z" fill="#92400e"/>
        </svg>
        <span className="text-xs font-black text-amber-900">1위</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-slate-300 px-3 py-1.5">
        <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none">
          <circle cx="7" cy="6" r="5" fill="#64748b"/>
          <rect x="4.5" y="10" width="5" height="2.5" rx="0.5" fill="#64748b"/>
          <text x="7" y="8.5" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="bold">2</text>
        </svg>
        <span className="text-xs font-black text-slate-600">2위</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-orange-300 px-3 py-1.5">
      <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none">
        <circle cx="7" cy="6" r="5" fill="#c2410c"/>
        <rect x="4.5" y="10" width="5" height="2.5" rx="0.5" fill="#c2410c"/>
        <text x="7" y="8.5" textAnchor="middle" fontSize="5.5" fill="white" fontWeight="bold">3</text>
      </svg>
      <span className="text-xs font-black text-orange-900">3위</span>
    </div>
  );
};

const SHOPS = [
  {
    rank: 1,
    name: "강남 라이더 모터스",
    area: "서울 강남구",
    tags: ["PCX", "NMAX", "엔진오일"],
    price: "엔진오일 2.8만원",
    rating: 4.9,
    reviews: 128,
  },
  {
    rank: 2,
    name: "송파 오토케어",
    area: "서울 송파구",
    tags: ["전기/전장 특화", "브레이크 패드"],
    price: "브레이크 패드 4.2만원",
    rating: 4.8,
    reviews: 94,
  },
  {
    rank: 3,
    name: "영등포 바이크프로",
    area: "서울 영등포구",
    tags: ["종합정비", "출장 가능"],
    price: "타이어 교체 3.5만원~",
    rating: 4.7,
    reviews: 76,
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* 상단 안내바 */}
      <div className="bg-[#1B3560] py-2 text-center text-xs text-white/70">
        배달라이더 전용 정비소 정보 플랫폼 ·{" "}
        <span className="font-semibold text-[#E8603A]">리뷰 1개 작성 시 전체 열람 무료</span>
      </div>

      {/* 네비게이션 */}
      <nav className="sticky top-0 z-50 border-b-2 border-[#1B3560] bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B3560]">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-xl font-black text-[#1B3560] leading-tight">배오정리</div>
              <div className="text-[10px] text-gray-400 leading-tight">배달 오토바이 정비소 리뷰</div>
            </div>
          </div>
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link} href="#" className="text-sm font-medium text-gray-600 hover:text-[#1B3560]">
                {link}
              </a>
            ))}
          </div>
          <button className="rounded-lg bg-[#E8603A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#d4522e]">
            네이버로 시작하기
          </button>
        </div>
      </nav>

      {/* 히어로 배너 */}
      <div className="bg-gradient-to-br from-[#0F2040] via-[#1B3560] to-[#2A4A7F] py-24 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-5 inline-block rounded-full border border-[#E8603A]/40 bg-[#E8603A]/20 px-4 py-1.5 text-xs font-semibold text-[#E8603A]">
            배달라이더 전용 정비소 비교 플랫폼
          </div>
          <h1 className="mb-6 text-4xl font-black leading-tight text-white md:text-5xl">
            모르면 바가지, 알면 제값.
            <br />
            <span className="text-[#E8603A]">정비소 비교</span>는 배오정리
          </h1>
          <p className="mb-10 text-sm leading-loose text-white/60">
            정비소마다 제각각인 가격, 모르면 바가지고 알면 제값입니다.<br />
            정보가 없어 불합리한 걸 당연하게 받아들이고 있진 않으신가요?<br /><br />
            배오정리는 배달라이더들이 직접 발로 뛰며 경험한 정비 정보를 모아,<br />
            더 이상 아무것도 모른 채 정비소를 찾아 헤매지 않아도 되는 세상을 만듭니다.<br /><br />
            <span className="font-semibold text-white/90">당신의 리뷰 하나가, 오늘도 달리는 동료 라이더를 지킵니다.</span>
          </p>

          {/* 검색창 - 위치 기반 */}
          <div className="mx-auto max-w-xl">
            <div className="flex overflow-hidden rounded-xl bg-white shadow-xl">
              <div className="flex flex-1 items-center gap-2 px-5">
                <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-gray-400 flex-shrink-0">
                  <path d="M10 2C6.686 2 4 4.686 4 8C4 12.5 10 18 10 18C10 18 16 12.5 16 8C16 4.686 13.314 2 10 2Z" stroke="#9CA3AF" strokeWidth="1.5"/>
                  <circle cx="10" cy="8" r="2.5" stroke="#9CA3AF" strokeWidth="1.5"/>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="내 위치 기반으로 정비소 찾기"
                  className="flex-1 py-4 text-sm text-gray-700 outline-none bg-transparent"
                />
              </div>
              <button className="bg-[#E8603A] px-8 py-4 text-sm font-bold text-white hover:bg-[#d4522e] whitespace-nowrap">
                검색
              </button>
            </div>
            <p className="mt-2 text-xs text-white/30">또는 지역명, 정비소명, 작업종류로 검색하세요</p>
          </div>

          {/* 통계 */}
          <div className="mt-12 flex justify-center gap-12 border-t border-white/10 pt-10">
            {[["1,248", "등록된 정비소"], ["4,821", "라이더 리뷰"], ["98%", "실방문 후기"]].map(([num, label]) => (
              <div key={label}>
                <div className="text-3xl font-black text-white">{num}</div>
                <div className="mt-1 text-xs text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 주요 서비스 */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#E8603A]">SERVICES</p>
            <h2 className="text-3xl font-black text-gray-900">주요 서비스</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div key={s.title} className="cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition hover:border-[#1B3560] hover:shadow-lg">
                <div className="mb-4 w-12 h-12" dangerouslySetInnerHTML={{ __html: s.svg }} />
                <h3 className="mb-2 text-base font-bold text-gray-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 정비소 목록 */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#E8603A]">LIST</p>
              <h2 className="text-3xl font-black text-gray-900">정비소 목록</h2>
              <p className="mt-1 text-sm text-gray-500">선택한 조건에 맞는 정비소를 확인하세요.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[["지역", "서울"], ["작업", "전체"], ["기종", "125cc 이하"], ["정렬", "가까운 순"]].map(([label, val]) => (
                <select key={label} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 outline-none">
                  <option>{val}</option>
                </select>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {SHOPS.map((shop) => (
              <div key={shop.name} className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-[#1B3560] hover:shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{shop.name}</h3>
                    <p className="mt-0.5 text-xs text-gray-400">{shop.area}</p>
                  </div>
                  <RankBadge rank={shop.rank} />
                </div>
                <div className="px-5 py-4">
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {shop.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-[#EEF2FF] px-2.5 py-1 text-xs font-medium text-[#1B3560]">{tag}</span>
                    ))}
                  </div>
                  <p className="mb-3 text-sm font-semibold text-[#E8603A]">{shop.price}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900">★ {shop.rating}</span>
                      <span className="text-xs text-gray-400">리뷰 {shop.reviews}</span>
                    </div>
                    <button className="rounded-lg border border-[#1B3560] px-4 py-1.5 text-xs font-bold text-[#1B3560] transition hover:bg-[#1B3560] hover:text-white">
                      상세 보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#1B3560] py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-4 text-3xl font-black text-white">받은 만큼, 쓴 만큼 남기는 리뷰</h2>
          <p className="mb-8 text-sm leading-relaxed text-white/50">
            짧은 리뷰 하나로 전체 정비소·가격 정보 열람이 무료로 열립니다.<br />
            동료 라이더를 위해 경험을 공유해 주세요.
          </p>
          <div className="flex justify-center gap-4">
            <button className="rounded-xl bg-[#E8603A] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#d4522e]">리뷰 작성하기</button>
            <button className="rounded-xl border border-white/25 bg-white/10 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/20">이용 안내 보기</button>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xl font-black text-[#1B3560]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B3560]">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                배오정리
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
                배달라이더 전용 오토바이 정비소 리뷰·비교 서비스.<br />
                정보의 사전 확인으로 불필요한 지출을 줄이세요.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">서비스</p>
                <ul className="space-y-2">
                  {["정비소 찾기", "리뷰", "제휴·등록"].map((item) => (
                    <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-[#E8603A]">{item}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">고객센터</p>
                <ul className="space-y-2">
                  {["이용안내", "문의하기"].map((item) => (
                    <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-[#E8603A]">{item}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">법적 고지</p>
                <ul className="space-y-2">
                  {["개인정보처리방침", "서비스 이용약관"].map((item) => (
                    <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-[#E8603A]">{item}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-10 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} 배오정리. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
