import { NextResponse } from "next/server";

/** 카카오 Static Map 이미지 프록시 (REST API 키는 서버에서만 사용) */
export async function GET(req: Request) {
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

  const restKey =
    process.env.KAKAO_REST_API_KEY ||
    process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ||
    "";

  if (!restKey) {
    return new NextResponse(null, { status: 503 });
  }

  const w = Math.min(640, Math.max(120, Number(searchParams.get("w")) || 480));
  const h = Math.min(640, Math.max(120, Number(searchParams.get("h")) || 240));
  const level = Math.min(14, Math.max(1, Number(searchParams.get("level")) || 4));

  const center = `${lngN},${latN}`;
  const marker = `type:d|size:mid|color:0x00bfa5|pos:${lngN} ${latN}`;
  const url = new URL("https://dapi.kakao.com/v2/maps/staticmap");
  url.searchParams.set("center", center);
  url.searchParams.set("level", String(level));
  url.searchParams.set("w", String(w));
  url.searchParams.set("h", String(h));
  url.searchParams.set("markers", marker);
  url.searchParams.set("scale", "2");

  const upstream = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${restKey}` },
    next: { revalidate: 86400 },
  });

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status });
  }

  const buf = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("content-type") || "image/png";
  return new NextResponse(buf, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
