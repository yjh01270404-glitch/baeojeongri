const KAKAO_MAP_SCRIPT_BASE = "https://dapi.kakao.com/v2/maps/sdk.js";

function runWhenMapsReady(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.load) {
      reject(new Error("Kakao Maps load() unavailable"));
      return;
    }
    window.kakao.maps.load(() => resolve());
  });
}

export function loadKakaoMapsScript(appKey: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window is undefined"));
  }

  const existing = document.querySelector(
    `script[src^="${KAKAO_MAP_SCRIPT_BASE}"]`,
  );

  if (existing && window.kakao?.maps?.load) {
    return runWhenMapsReady();
  }

  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => {
        runWhenMapsReady().then(resolve).catch(reject);
      });
      existing.addEventListener("error", () =>
        reject(new Error("Kakao Maps script failed")),
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${KAKAO_MAP_SCRIPT_BASE}?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      runWhenMapsReady().then(resolve).catch(reject);
    };
    script.onerror = () => reject(new Error("Kakao Maps script load error"));
    document.head.appendChild(script);
  });
}
