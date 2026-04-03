"use client";

import { signIn } from "next-auth/react";

type Props = {
  onClose: () => void;
};

export function LoginModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="mb-1 text-left text-xl font-black text-gray-900">
          로그인
        </h2>
        <p className="mb-6 text-left text-sm leading-relaxed text-gray-500">
          네이버 또는 카카오로 로그인해 주세요.
        </p>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              void signIn("naver", { callbackUrl: "/" });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#03C75A] bg-[#03C75A] px-4 py-3.5 text-sm font-bold text-white transition hover:brightness-95"
          >
            네이버로 계속하기
          </button>
          <button
            type="button"
            onClick={() => {
              void signIn("kakao", { callbackUrl: "/" });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#FEE500] bg-[#FEE500] px-4 py-3.5 text-sm font-bold text-black transition hover:brightness-95"
          >
            카카오로 계속하기
          </button>
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
