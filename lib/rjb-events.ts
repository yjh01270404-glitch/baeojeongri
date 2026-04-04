/** 홈에서 정비소 섹션으로 스크롤 후 GPS 위치를 다시 요청할 때 */
export const REQUEST_NEARBY_LOCATION_EVENT = "rjb-request-nearby-location";

export function dispatchRequestNearbyLocation() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(REQUEST_NEARBY_LOCATION_EVENT));
}
