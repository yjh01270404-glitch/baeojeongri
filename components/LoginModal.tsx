"use client";

import { signIn } from "next-auth/react";

type Props = {
  onClose: () => void;
};

/**
 * 네이버: NextAuth 실제 OAuth
 * 카카오·Google: UI만 유지, 연동 예정 안내
 */
export function LoginModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="mb-1 text-left text-xl font-black text-gray-900">
          로그인
        </h2>
        <p className="mb-6 text-left text-sm leading-relaxed text-gray-500">
          네이버 계정으로 로그인할 수 있습니다. 카카오·Google은 UI만 준비되어
          있으며 OAuth 연동은 순차적으로 추가할 예정입니다.
        </p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              void signIn("naver", { callbackUrl: window.location.href });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#03C75A] bg-[#03C75A] px-4 py-3.5 text-sm font-bold text-white transition hover:brightness-95"
          >
            네이버로 계속하기
          </button>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-3.5 text-left">
            <p className="text-sm font-bold text-gray-700">
              카카오톡으로 계속하기
            </p>
            <p className="mt-1 text-xs text-gray-500">
              OAuth 연동 예정 · 현재는 사용할 수 없습니다.
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-3.5 text-left">
            <p className="text-sm font-bold text-gray-700">Google로 계속하기</p>
            <p className="mt-1 text-xs text-gray-500">
              OAuth 연동 예정 · 현재는 사용할 수 없습니다.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
