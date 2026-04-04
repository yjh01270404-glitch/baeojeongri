import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://baeojeongri.vercel.app"),
  title:
    "라이더정비비교 | 배달라이더 오토바이 정비소 가격·거리 검색·리뷰 비교",
  description:
    "라이더정비비교 — 배달라이더 전용 오토바이 정비소 검색, 거리순·실시간 조회, 정비 금액·리뷰 비교 플랫폼.",
  keywords: [
    "라이더정비비교",
    "배달라이더 정비",
    "오토바이 정비소",
    "바이크 정비",
    "정비소 비교",
    "정비 가격",
  ],
  openGraph: {
    title:
      "라이더정비비교 | 배달라이더 오토바이 정비소 가격·거리 검색·리뷰 비교",
    description:
      "라이더정비비교 — 배달라이더 전용 오토바이 정비소 검색·비교 플랫폼.",
    url: "https://baeojeongri.vercel.app",
    siteName: "라이더정비비교",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansKr.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-gray-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
