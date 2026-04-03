import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00BFA5]">
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="mb-2 text-4xl font-black text-gray-900">404</h1>
      <p className="mb-2 text-lg font-bold text-gray-700">페이지를 찾을 수 없습니다</p>
      <p className="mb-8 text-sm text-gray-500">요청하신 정비소 또는 페이지가 존재하지 않습니다.</p>
      <Link
        href="/"
        className="rounded-xl bg-[#00BFA5] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#009E88] transition-colors"
      >
        정비소 목록으로 돌아가기
      </Link>
    </div>
  );
}
