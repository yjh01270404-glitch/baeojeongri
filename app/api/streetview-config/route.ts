import { NextResponse } from "next/server";

/** 클라이언트가 Street View 이미지를 시도할지 여부 (키 존재만 공개) */
export function GET() {
  return NextResponse.json({
    enabled: Boolean(process.env.GOOGLE_MAPS_API_KEY),
  });
}
