"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LoginModal } from "@/components/LoginModal";
import { Button } from "@/components/ui/button";

const SUPPORT_EMAIL = "support@baeojeongri.kr";

type ReportCategory =
  | "잘못된 정보"
  | "과도한 요금/바가지 의심"
  | "욕설/혐오/비방"
  | "불친절/태도 문제"
  | "광고/스팸"
  | "기타";

export type ReportPayload = {
  category: ReportCategory;
  shopName: string;
  address: string;
  contact: string;
  details: string;
  occurredAt: string;
};

function buildMailto(payload: ReportPayload) {
  const subject = `배오정리 제보·신고: ${payload.category}`;
  const body = [
    `제보·신고 유형: ${payload.category}`,
    `정비소: ${payload.shopName}`,
    `주소: ${payload.address}`,
    `발생일(선택): ${payload.occurredAt || "-"}`,
    `연락처(선택): ${payload.contact || "-"}`,
    "",
    "상세 내용:",
    payload.details,
  ].join("\n");

  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function ReportPage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [payload, setPayload] = useState<ReportPayload>({
    category: "잘못된 정보",
    shopName: "",
    address: "",
    contact: "",
    details: "",
    occurredAt: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const mailto = useMemo(() => buildMailto(payload), [payload]);
  const canSubmit = payload.details.trim().length >= 10 && payload.shopName.trim();

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
              <span className="text-xl font-black text-[#00BFA5]">배오정리</span>
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/policy"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-[#00BFA5]"
            >
              정책
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
              <Button
                type="button"
                variant="outline"
                className="border-gray-200 bg-white px-3 text-xs font-bold"
                onClick={() => void signOut({ callbackUrl: "/" })}
              >
                로그아웃
              </Button>
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
                href="/policy"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                정책
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
            REPORT
          </p>
          <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
            제보·신고
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            잘못된 정보, 과도한 요금, 비방/혐오 표현 등은 접수 후 검토하여 조치합니다.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {submitted ? (
            <div className="space-y-4 text-left">
              <div className="text-5xl">📨</div>
              <h2 className="text-xl font-black text-gray-900">
                제보를 메일로 전송할 준비가 됐어요
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                아래 버튼을 눌러 메일 앱에서 내용이 자동으로 채워지게 해 주세요.
              </p>
              <a
                href={mailto}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#009E88]"
              >
                메일 보내기
              </a>
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-200 bg-white"
                onClick={() => setSubmitted(false)}
              >
                작성 계속하기
              </Button>
              <p className="text-xs text-gray-400">
                운영 메일: {SUPPORT_EMAIL}
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return;
                setSubmitted(true);
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-xs font-bold text-gray-700">
                    제보 유형
                  </span>
                  <select
                    value={payload.category}
                    onChange={(e) =>
                      setPayload((p) => ({
                        ...p,
                        category: e.target.value as ReportCategory,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]"
                  >
                    {(
                      [
                        "잘못된 정보",
                        "과도한 요금/바가지 의심",
                        "욕설/혐오/비방",
                        "불친절/태도 문제",
                        "광고/스팸",
                        "기타",
                      ] as const
                    ).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="block text-xs font-bold text-gray-700">
                    발생 일시(선택)
                  </span>
                  <input
                    type="datetime-local"
                    value={payload.occurredAt}
                    onChange={(e) =>
                      setPayload((p) => ({ ...p, occurredAt: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  정비소 이름
                </label>
                <input
                  value={payload.shopName}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, shopName: e.target.value }))
                  }
                  placeholder="예: 배달바이크 정비소"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  주소(가능하면)
                </label>
                <input
                  value={payload.address}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="예: 서울특별시 ... "
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  연락처(선택: 회신이 필요할 때만)
                </label>
                <input
                  value={payload.contact}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, contact: e.target.value }))
                  }
                  placeholder="이메일 또는 전화번호"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  상세 내용
                </label>
                <textarea
                  value={payload.details}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, details: e.target.value }))
                  }
                  rows={6}
                  placeholder="무엇이 어떻게 잘못되었는지, 어떤 점이 확인되었는지 구체적으로 적어주세요. (최소 10자)"
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]"
                />
                <p className="text-xs text-gray-400">
                  최소 {10}자 이상, 정비소 이름은 필수입니다.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-200 bg-white"
                  onClick={() => {
                    setPayload({
                      category: "잘못된 정보",
                      shopName: "",
                      address: "",
                      contact: "",
                      details: "",
                      occurredAt: "",
                    });
                    setSubmitted(false);
                  }}
                >
                  초기화
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-[#00BFA5] text-sm font-bold text-white hover:bg-[#009E88] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  제보 내용 확인
                </Button>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                현재는 DB 저장 없이 운영 메일로 전달하는 MVP 흐름입니다. 향후 API/DB가
                추가되면 이 폼의 입력값을 그대로 저장하도록 확장할 수 있게 설계했습니다.
              </p>
            </form>
          )}
        </div>
      </main>

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
                <span className="text-xl font-black text-[#00BFA5]">배오정리</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-gray-500">
                제보는 더 나은 정비 정보로 이어집니다.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {[
                {
                  title: "서비스",
                  links: [
                    { label: "정비소 찾기", href: "/#shop-finder" },
                    { label: "자가정비 정보", href: "/#services" },
                  ],
                },
                {
                  title: "고객센터",
                  links: [
                    { label: "정책", href: "/policy" },
                    { label: "제보·신고", href: "/report" },
                  ],
                },
                {
                  title: "법적 고지",
                  links: [
                    {
                      label: "문의하기",
                      href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("배오정리 문의")}`,
                    },
                    {
                      label: "서비스 이용약관(문의)",
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
            © {new Date().getFullYear()} 배오정리. All rights reserved. ·{" "}
            <span className="text-gray-300">
              이 페이지에는 쿠팡 파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있습니다.
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

