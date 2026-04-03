import { NextResponse } from "next/server";

/**
 * Google Street View Static API 프록시 — 정비소 좌표 인근 실사(거리) 이미지
 * (카카오 API에는 업체 사진 필드가 없음)
 * GOOGLE_MAPS_API_KEY 필요 + Street View Static API 사용 설정
 */
export async function GET(req: Request) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return new NextResponse(null, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if (!lat || !lng) {
    return NextResponse.json({ error: "lat, lng required" }, { status: 400 });
  }

  const latN = Number(lat);
  const lngN = Number(lng);
  if (!Number.isFinite(latN) || !Number.isFinite(lngN)) {
    return NextResponse.json({ error: "invalid coordinates" }, { status: 400 });
  }

  const w = Math.min(640, Math.max(200, Number(searchParams.get("w")) || 640));
  const h = Math.min(640, Math.max(120, Number(searchParams.get("h")) || 320));

  const url = new URL("https://maps.googleapis.com/maps/api/streetview");
  url.searchParams.set("size", `${w}x${h}`);
  url.searchParams.set("location", `${latN},${lngN}`);
  url.searchParams.set("fov", "80");
  url.searchParams.set("pitch", "5");
  url.searchParams.set("key", key);

  const upstream = await fetch(url.toString(), { next: { revalidate: 86400 } });

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status });
  }

  const buf = await upstream.arrayBuffer();
  const ct = upstream.headers.get("content-type") || "image/jpeg";
  return new NextResponse(buf, {
    headers: {
      "Content-Type": ct,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
