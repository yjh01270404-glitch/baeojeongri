import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SHOPS } from "@/lib/data";
import { computeShopStats, formatPrice } from "@/lib/shop-utils";
import ShopDetailClient from "./ShopDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return SHOPS.map((shop) => ({ id: shop.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const shop = SHOPS.find((s) => s.id === id);
  if (!shop) return { title: "정비소를 찾을 수 없습니다 | 라이더정비비교" };

  const stats = computeShopStats(shop);
  const topService = stats.avgPriceByService[0];
  const priceDesc = topService
    ? `${topService.serviceType} 평균 ${formatPrice(topService.avg)}.`
    : "";

  const title = `${shop.name} | ${shop.city} ${shop.district} 오토바이 정비소 - 라이더정비비교`;
  const description = `${shop.city} ${shop.district} 오토바이 정비소 ${shop.name}. ${priceDesc} 라이더 리뷰 ${stats.reviewCount}개. 배달라이더가 직접 작성한 실방문 후기를 확인하세요.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `/shop/${shop.id}`,
    },
  };
}

export default async function ShopPage({ params }: Props) {
  const { id } = await params;
  const shop = SHOPS.find((s) => s.id === id);

  if (!shop) notFound();

  const stats = computeShopStats(shop);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: shop.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: shop.district,
      addressRegion: shop.city,
      addressCountry: "KR",
    },
    aggregateRating: stats.reviewCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: stats.rating,
          reviewCount: stats.reviewCount,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShopDetailClient shop={shop} />
    </>
  );
}
