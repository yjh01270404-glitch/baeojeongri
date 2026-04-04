import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /** 상위 폴더(oz-4)의 package-lock.json 오인 방지 */
  turbopack: {
    root: path.join(process.cwd()),
  },
};

export default nextConfig;
