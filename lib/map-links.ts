/** 네이버 지도 v5 장소 검색 (정비소 이름으로 검색 결과 이동) */
export function naverMapSearchUrl(placeName: string): string {
  const q = encodeURIComponent(placeName.trim() || "정비소");
  return `https://map.naver.com/v5/search/${q}`;
}
