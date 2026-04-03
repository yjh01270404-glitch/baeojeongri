"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Shop } from "@/lib/types";
import {
  computeShopStats,
  computeGlobalAvgByService,
  getPriceComparison,
  isRecommended,
  formatPrice,
  TAG_STYLE,
  COUPANG_LINKS,
} from "@/lib/shop-utils";

function ReviewModal({ shopName, onClose, onSubmit }: { shopName: string; onClose: () => void; onSubmit: () => void }) {
  const [content, setContent] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 10) return;
    setDone(true);
    setTimeout(() => { onSubmit(); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        {done ? (
          <div className="py-8 text-left">
            <div className="mb-3 text-5xl">🎉</div>
            <p className="text-lg font-black text-gray-900">리뷰가 등록됐어요!</p>
            <p className="mt-1 text-sm text-gray-500">전체 정보가 열립니다.</p>
          </div>
        ) : (
          <>
            <h2 className="mb-1 text-xl font-black text-gray-900">리뷰 작성하기</h2>
            <p className="mb-6 text-sm text-gray-500"><span className="font-bold text-[#00BFA5]">{shopName}</span>에 대한 리뷰를 남겨주세요.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">기종</label>
                  <input className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]" placeholder="PCX125" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">작업 종류</label>
                  <input className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]" placeholder="엔진오일" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">지불 금액 (원)</label>
                <input type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]" placeholder="30000" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">후기 <span className="font-normal text-gray-400">(10자 이상)</span></label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]"
                  placeholder="경험을 자유롭게 작성해주세요."
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50">취소</button>
                <button
                  type="submit"
                  disabled={content.trim().length < 10}
                  className="flex-1 rounded-xl bg-[#00BFA5] py-3 text-sm font-bold text-white hover:bg-[#009E88] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  제출하기
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ShopDetailClient({ shop }: { shop: Shop }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return localStorage.getItem("boj_unlocked") === "true";
    } catch {
      return false;
    }
  });
  const [showModal, setShowModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleUnlock = () => {
    localStorage.setItem("boj_unlocked", "true");
    setIsUnlocked(true);
  };

  const stats = useMemo(() => computeShopStats(shop), [shop]);
  const globalAvg = useMemo(() => computeGlobalAvgByService([]), []);
  const recommended = isRecommended(stats);

  return (
    <div className="min-h-screen bg-white font-sans">
      {showModal && (
        <ReviewModal shopName={shop.name} onClose={() => setShowModal(false)} onSubmit={handleUnlock} />
      )}

      {/* 네비게이션 */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00BFA5]">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-black text-[#00BFA5]">배오정리</span>
          </Link>
          <div className="hidden items-center md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 hover:text-[#00BFA5] transition-colors"
            >
              ← 목록으로
            </Link>
          </div>
          <div className="flex items-center md:hidden">
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
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="mx-auto max-w-5xl px-6 py-3">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ← 목록으로
              </Link>
              <Link
                href="/policy"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                가입·리뷰·혜택 정책
              </Link>
              <Link
                href="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                제보·신고
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#E6F9F7] px-3 py-1 text-xs font-bold text-[#009E88]">{shop.city} {shop.district}</span>
            {recommended && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">✓ 추천 정비소</span>
            )}
            {shop.specialties.map((sp) => (
              <span key={sp} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{sp}</span>
            ))}
          </div>
          <h1 className="text-4xl font-black text-gray-900">{shop.name}</h1>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-lg font-bold text-amber-500">★ {stats.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">리뷰 {stats.reviewCount}개</span>
            <span className="text-sm text-gray-400">{shop.distanceKm}km</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 사이드바 */}
          <div className="space-y-5">
            {/* 연락처 */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-gray-400">정비소 정보</h2>
              {isUnlocked ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-base">📍</span>
                    <span className="text-sm text-gray-700">{shop.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base">📞</span>
                    <a href={`tel:${shop.phone}`} className="text-sm font-bold text-[#00BFA5] hover:underline">{shop.phone}</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-base">🕐</span>
                    <span className="text-sm text-gray-700">{shop.hours}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📍</span>
                    <span className="text-sm text-gray-500">{shop.city} {shop.district}</span>
                  </div>
                  <div className="rounded-xl border border-dashed border-[#00BFA5]/40 bg-[#00BFA5]/5 p-4 text-left">
                    <p className="mb-3 text-xs text-gray-500">주소·전화번호·영업시간은<br />리뷰 작성 후 공개됩니다</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="w-full rounded-lg bg-[#00BFA5] py-2.5 text-sm font-bold text-white hover:bg-[#009E88] transition-colors"
                    >
                      🔓 리뷰 쓰고 열기
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 태그 통계 */}
            {stats.topTags.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-gray-400">라이더 평가</h2>
                <div className="space-y-3">
                  {stats.topTags.map(({ tag, count }) => {
                    const s = TAG_STYLE[tag];
                    const pct = Math.round((count / stats.reviewCount) * 100);
                    const barColor = tag === '친절' ? 'bg-[#00BFA5]' : tag === '빠름' ? 'bg-blue-400' : tag === '기술좋음' ? 'bg-purple-400' : 'bg-red-400';
                    return (
                      <div key={tag}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>
                          <span className="text-xs text-gray-400">{count}명 ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div className={`h-2 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 작업별 평균 가격 + vs 평균 비교 */}
            {stats.avgPriceByService.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-gray-400">작업별 가격 비교</h2>
                <div className="space-y-4">
                  {stats.avgPriceByService.map(({ serviceType, avg, count }) => {
                    const gAvg = globalAvg[serviceType];
                    const comp = gAvg ? getPriceComparison(avg, gAvg) : null;
                    return (
                      <div key={serviceType}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{serviceType}</p>
                            <p className="text-xs text-gray-400">{count}건 기준</p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-black text-gray-900">{formatPrice(avg)}</p>
                            {comp && (
                              <span className={`text-xs font-bold ${comp.color}`}>
                                {comp.label === "저렴" ? "👍 저렴" : comp.label === "비쌈" ? "⚠️ 비쌈" : "보통"}
                              </span>
                            )}
                          </div>
                        </div>
                        {gAvg && (
                          <div className="rounded-lg bg-gray-50 px-3 py-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">이 정비소</span>
                              <span className="font-bold text-gray-800">{formatPrice(avg)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs mt-1">
                              <span className="text-gray-500">전체 평균</span>
                              <span className="text-gray-600">{formatPrice(gAvg)}</span>
                            </div>
                            {/* 비교 바 */}
                            <div className="mt-2 space-y-1">
                              <div className="relative h-2 w-full rounded-full bg-gray-200">
                                <div
                                  className={`h-2 rounded-full transition-all ${comp?.label === '저렴' ? 'bg-[#00BFA5]' : comp?.label === '비쌈' ? 'bg-red-400' : 'bg-gray-300'}`}
                                  style={{ width: `${Math.min(100, Math.round((avg / Math.max(avg, gAvg)) * 100))}%` }}
                                />
                              </div>
                              <div className="relative h-2 w-full rounded-full bg-gray-200">
                                <div
                                  className="h-2 rounded-full bg-gray-300 transition-all"
                                  style={{ width: `${Math.min(100, Math.round((gAvg / Math.max(avg, gAvg)) * 100))}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {/* 쿠팡 버튼 */}
                        {COUPANG_LINKS[serviceType] && (
                          <a
                            href={COUPANG_LINKS[serviceType].url}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            🛒 {COUPANG_LINKS[serviceType].label}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
                {stats.priceRange && (
                  <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-left">
                    <p className="text-xs text-gray-400">전체 가격 범위</p>
                    <p className="mt-0.5 text-sm font-black text-gray-700">
                      {formatPrice(stats.priceRange.min)} ~ {formatPrice(stats.priceRange.max)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 리뷰 목록 */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900">라이더 리뷰 {stats.reviewCount}개</h2>
              <button
                onClick={() => setShowModal(true)}
                className="rounded-lg bg-[#00BFA5] px-4 py-2 text-sm font-bold text-white hover:bg-[#009E88] transition-colors"
              >
                + 리뷰 작성
              </button>
            </div>

            {isUnlocked ? (
              <div className="space-y-4">
                {shop.reviews.map((review) => {
                  const gAvg = globalAvg[review.serviceType];
                  const comp = gAvg ? getPriceComparison(review.price, gAvg) : null;
                  return (
                    <div key={review.id} className="rounded-2xl border border-gray-200 bg-white p-6">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <span className="text-sm font-bold text-gray-800">{review.authorNickname}</span>
                          <span className="ml-2 text-xs text-gray-400">{review.model} · {review.serviceType}</span>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-gray-900">{formatPrice(review.price)}</span>
                            {comp && (
                              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                comp.label === '저렴' ? 'bg-[#E6F9F7] text-[#009E88]' :
                                comp.label === '비쌈' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {comp.label}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-amber-500">★ {review.rating}</div>
                        </div>
                      </div>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {review.tags.map((tag) => {
                          const s = TAG_STYLE[tag];
                          return (
                            <span key={tag} className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>
                          );
                        })}
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600">{review.content}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-gray-400">{review.date}</p>
                        {COUPANG_LINKS[review.serviceType] && (
                          <a
                            href={COUPANG_LINKS[review.serviceType].url}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            🛒 {review.serviceType} 직접 구매
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-left">
                <div className="mb-4 text-5xl">🔒</div>
                <p className="mb-2 text-lg font-black text-gray-800">리뷰 {stats.reviewCount}개가 잠겨있습니다</p>
                <p className="mb-6 text-sm text-gray-500">
                  리뷰 1개를 작성하면 이 정비소를 포함한<br />모든 정비소의 리뷰를 열람할 수 있습니다.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="rounded-xl bg-[#00BFA5] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#009E88] transition-colors"
                >
                  리뷰 작성하고 전체 열람하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
