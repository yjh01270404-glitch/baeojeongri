import type { Shop, ShopStats, ServiceTag } from './types';

export function computeShopStats(shop: Shop): ShopStats {
  const { reviews } = shop;

  if (reviews.length === 0) {
    return { rating: 0, reviewCount: 0, topTags: [], priceRange: null, avgPriceByService: [] };
  }

  const rating =
    Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10;

  const tagCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    r.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag, count]) => ({ tag: tag as ServiceTag, count }));

  const prices = reviews.map((r) => r.price);
  const priceRange = { min: Math.min(...prices), max: Math.max(...prices) };

  const serviceMap: Record<string, number[]> = {};
  reviews.forEach((r) => {
    if (!serviceMap[r.serviceType]) serviceMap[r.serviceType] = [];
    serviceMap[r.serviceType].push(r.price);
  });
  const avgPriceByService = Object.entries(serviceMap)
    .map(([serviceType, ps]) => ({
      serviceType,
      avg: Math.round(ps.reduce((a, b) => a + b, 0) / ps.length),
      count: ps.length,
    }))
    .sort((a, b) => b.count - a.count);

  return { rating, reviewCount: reviews.length, topTags, priceRange, avgPriceByService };
}

/** 전체 정비소 기준 서비스 타입별 글로벌 평균 가격 */
export function computeGlobalAvgByService(shops: Shop[]): Record<string, number> {
  const map: Record<string, number[]> = {};
  shops.forEach((shop) => {
    shop.reviews.forEach((r) => {
      if (!map[r.serviceType]) map[r.serviceType] = [];
      map[r.serviceType].push(r.price);
    });
  });
  const result: Record<string, number> = {};
  Object.entries(map).forEach(([type, prices]) => {
    result[type] = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  });
  return result;
}

/** 이 정비소 vs 글로벌 평균 비교 */
export function getPriceComparison(
  shopAvg: number,
  globalAvg: number
): { label: string; color: string; pct: number } {
  const diff = ((shopAvg - globalAvg) / globalAvg) * 100;
  if (diff <= -15) return { label: '저렴', color: 'text-[#00BFA5]', pct: diff };
  if (diff >= 20) return { label: '비쌈', color: 'text-red-600', pct: diff };
  return { label: '보통', color: 'text-gray-500', pct: diff };
}

/** 추천 정비소 여부 (평점 ≥ 4.7 이고 리뷰 ≥ 3개) */
export function isRecommended(stats: ShopStats): boolean {
  return stats.rating >= 4.7 && stats.reviewCount >= 3;
}

/** 글로벌 팩트 통계 */
export function computePriceFacts(shops: Shop[]): {
  maxRatio: number;
  minExample: number;
  maxExample: number;
  serviceExample: string;
} {
  const map: Record<string, number[]> = {};
  shops.forEach((shop) => {
    shop.reviews.forEach((r) => {
      if (!map[r.serviceType]) map[r.serviceType] = [];
      map[r.serviceType].push(r.price);
    });
  });

  let maxRatio = 1;
  let minExample = 0;
  let maxExample = 0;
  let serviceExample = '';

  Object.entries(map).forEach(([type, prices]) => {
    if (prices.length < 2) return;
    const mn = Math.min(...prices);
    const mx = Math.max(...prices);
    const ratio = mx / mn;
    if (ratio > maxRatio) {
      maxRatio = ratio;
      minExample = mn;
      maxExample = mx;
      serviceExample = type;
    }
  });

  return { maxRatio: Math.round(maxRatio * 10) / 10, minExample, maxExample, serviceExample };
}

export function formatPrice(price: number): string {
  if (price >= 10000) {
    const man = price / 10000;
    return `${man % 1 === 0 ? man : man.toFixed(1)}만원`;
  }
  return `${price.toLocaleString()}원`;
}

export const TAG_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  친절: { bg: 'bg-green-100', text: 'text-green-800', label: '😊 친절' },
  빠름: { bg: 'bg-blue-100', text: 'text-blue-800', label: '⚡ 빠름' },
  기술좋음: { bg: 'bg-purple-100', text: 'text-purple-800', label: '🔧 기술좋음' },
  바가지: { bg: 'bg-red-100', text: 'text-red-700', label: '💸 바가지' },
};

/** 서비스 타입 → 쿠팡 검색 URL */
export const COUPANG_LINKS: Record<string, { label: string; url: string }> = {
  엔진오일: {
    label: '엔진오일 직접 구매',
    url: 'https://www.coupang.com/np/search?q=오토바이+엔진오일',
  },
  타이어: {
    label: '타이어 최저가',
    url: 'https://www.coupang.com/np/search?q=오토바이+타이어',
  },
  '브레이크 패드': {
    label: '브레이크패드 최저가',
    url: 'https://www.coupang.com/np/search?q=오토바이+브레이크+패드',
  },
  배터리: {
    label: '배터리 최저가',
    url: 'https://www.coupang.com/np/search?q=오토바이+배터리',
  },
  에어필터: {
    label: '에어필터 최저가',
    url: 'https://www.coupang.com/np/search?q=오토바이+에어필터',
  },
  체인: {
    label: '체인 최저가',
    url: 'https://www.coupang.com/np/search?q=오토바이+체인',
  },
};
