"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";

const SUPPORT_EMAIL = "support@riderjeongbibi.kr";

export default function PolicyPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const memberStatusLine = useMemo(() => {
    if (status === "loading") return "세션 확인 중…";
    if (!isLoggedIn) return "로그인 상태가 아닙니다.";
    return `${session?.user?.name ?? session?.user?.email ?? "회원"}님 환영합니다`;
  }, [isLoggedIn, session?.user?.email, session?.user?.name, status]);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 네비게이션 */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-3 md:h-16 md:py-0">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00BFA5]">
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
              <span className="text-xl font-black text-[#00BFA5]">라이더정비비교</span>
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/report"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-[#00BFA5]"
            >
              제보·신고
            </Link>
            {isLoggedIn ? (
              <Button
                type="button"
                variant="outline"
                className="border-gray-200 text-xs font-bold sm:text-sm"
                onClick={() => void signOut({ callbackUrl: "/" })}
              >
                로그아웃
              </Button>
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

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            {isLoggedIn ? (
              <span className="max-w-[7rem] truncate text-xs font-medium text-gray-600">
                {session?.user?.name ?? session?.user?.email ?? "회원"}님
              </span>
            ) : null}
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
              <Link
                href="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                제보·신고
              </Link>
              {isLoggedIn ? (
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
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="mb-8 text-left">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#00BFA5]">
            POLICY
          </p>
          <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
            정책 사항
          </h1>
          <p className="mt-3 text-sm text-gray-500">{memberStatusLine}</p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-black text-gray-900">1. 라이더정비비교의 원칙</h2>
            <div className="space-y-2 text-sm leading-relaxed text-gray-600">
              <p>
                라이더정비비교는 “정비소 선택을 더 합리적으로” 돕기 위한 리뷰·정보 플랫폼입니다.
                가격·품질·서비스 경험을 공유해, 불필요한 시행착오를 줄이는 데 목적이 있습니다.
              </p>
              <p>
                리뷰는 이용자 간 신뢰를 바탕으로 운영되며, 부정확한 정보나 악의적 게시물은
                서비스 품질을 위해 조치될 수 있습니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black text-gray-900">
              2. 회원가입(로그인)과 정보 보호
            </h2>
            <div className="space-y-2 text-sm leading-relaxed text-gray-600">
              <p>
                회원가입은 네이버 OAuth 로그인 기반으로 운영됩니다. (현재 OAuth 연동은 네이버가 우선입니다.)
              </p>
              <p>
                수집되는 정보는 서비스 제공에 필요한 범위에서 최소화하며, 리뷰 내용은 공개 여부 및
                잠금 정책에 따라 표시됩니다.
              </p>
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
                로그인 동의 화면이 뜨지 않거나 오류가 발생하면, 운영 환경 변수 설정이 아직 반영되지
                않았거나 서버 설정이 갱신 중일 수 있습니다. 잠시 후 다시 시도해 주세요.
                문제가 지속되면 아래 메일로 문의해 주세요.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black text-gray-900">3. 리뷰 작성 조건</h2>
            <div className="space-y-2 text-sm leading-relaxed text-gray-600">
              <p>
                리뷰는 “실제로 다녀온 경험”을 바탕으로 작성해 주세요. 부정확하거나 특정인을
                공격하는 목적의 내용은 제한될 수 있습니다.
              </p>
              <p>
                현재 MVP(데모) 기준으로는 “리뷰 제출 시 잠금이 해제”되는 방식으로 동작합니다.
                즉, 리뷰 1회 작성만으로도 연락처 및 상세 정보가 열릴 수 있습니다.
              </p>
              <p>
                문구·형식 정책(예: 최소 글자 수, 금지 표현)은 운영 중 점진적으로 강화될 예정입니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black text-gray-900">4. 정보 열람(잠금) 정책</h2>
            <div className="space-y-2 text-sm leading-relaxed text-gray-600">
              <p>
                라이더정비비교에서는 “리뷰 작성 기여”를 통해 더 많은 정보(정비소 상세 연락처/주소 등)를
                열람할 수 있도록 설계했습니다.
              </p>
              <p>
                <span className="font-bold text-gray-900">중요:</span> 현재 배포본은 리뷰 1회 제출 후
                잠금 해제가 적용되는 데모 흐름을 사용합니다. 리뷰 횟수 구간(예: n개 이상)을
                기반으로 한 혜택 체계는 추후 정교화할 계획입니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black text-gray-900">5. 혜택 정책(예정 포함)</h2>
            <div className="space-y-2 text-sm leading-relaxed text-gray-600">
              <p>
                라이더정비비교는 “함께 만드는 서비스”를 목표로 하고 있습니다. 그래서 리뷰 품질과 기여도를
                기반으로 한 혜택을 단계적으로 제공하려고 합니다.
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="shrink-0 rounded-full bg-[#E6F9F7] px-2 py-0.5 text-xs font-bold text-[#009E88]">
                    MVP
                  </span>
                  <span>리뷰 1회 제출 시 잠금 해제(연락처/상세 열람)</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
                    예정
                  </span>
                  <span>리뷰 3개 이상: 뱃지 · 리뷰 작성자 배지 표시</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
                    예정
                  </span>
                  <span>리뷰 10개 이상: 이벤트 응모 기회 · 우선 노출</span>
                </li>
              </ul>
              <p className="mt-2">
                현 단계에서는 금전적 지급을 약속하지 않으며, 혜택은 운영 정책에 따라 변경될 수 있습니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black text-gray-900">6. 운영/중재 원칙</h2>
            <div className="space-y-2 text-sm leading-relaxed text-gray-600">
              <p>
                라이더정비비교는 업체/이용자 간 분쟁의 직접 당사자가 아니며, 리뷰는 정보 제공의 목적을 가집니다.
              </p>
              <p>
                허위·부정확 정보, 명예훼손, 욕설/혐오 표현 등은 신고 접수 후 검토하여 삭제·제한될 수 있습니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black text-gray-900">7. 문의/신고/변경 공지</h2>
            <div className="space-y-2 text-sm leading-relaxed text-gray-600">
              <p>
                정책이나 운영 방식에 대한 문의는 <a className="text-[#00BFA5] underline" href={`mailto:${SUPPORT_EMAIL}`}>{
                  SUPPORT_EMAIL
                }</a>
                로 연락해 주세요.
              </p>
              <p>
                신고/제보는 메뉴의 “제보·신고” 페이지를 이용해 주세요.
              </p>
              <p>
                정책은 서비스 개선 목적에 따라 변경될 수 있으며, 변경 내용은 본 페이지에 반영합니다.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link
                  href="/report"
                  className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  제보·신고 하러 가기
                </Link>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("라이더정비비교 문의")}`}
                  className="rounded-xl bg-[#00BFA5] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#009E88]"
                >
                  문의 메일 보내기
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

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
                <span className="text-xl font-black text-[#00BFA5]">라이더정비비교</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-gray-500">
                배달라이더 전용 오토바이 정비소 리뷰·비교 서비스.
                <br />
                함께 만드는 기록을 부탁드립니다.
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
                      href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                        "라이더정비비교 제휴·정비소 등록",
                      )}`,
                    },
                  ],
                },
                {
                  title: "고객센터",
                  links: [
                    { label: "이용안내", href: "/#cta" },
                    {
                      label: "제보·신고",
                      href: "/report",
                    },
                  ],
                },
                {
                  title: "법적 고지",
                  links: [
                    {
                      label: "개인정보처리방침(문의)",
                      href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                        "개인정보처리방침 문서 요청",
                      )}`,
                    },
                    {
                      label: "서비스 이용약관(문의)",
                      href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                        "이용약관 문서 요청",
                      )}`,
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
            © {new Date().getFullYear()} 라이더정비비교. All rights reserved. ·{" "}
            <span className="text-gray-300">
              이 페이지에는 쿠팡 파트너스 활동을 통해 일정액의 수수료를 제공받을
              수 있습니다.
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

