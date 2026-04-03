import NextAuth from "next-auth";
import Naver from "next-auth/providers/naver";
import Kakao from "next-auth/providers/kakao";

const naverConfigured =
  Boolean(process.env.NAVER_CLIENT_ID) &&
  Boolean(process.env.NAVER_CLIENT_SECRET);

const kakaoConfigured =
  Boolean(process.env.KAKAO_CLIENT_ID) &&
  Boolean(process.env.KAKAO_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(naverConfigured
      ? [
          Naver({
            clientId: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(kakaoConfigured
      ? [
          Kakao({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.name =
          (token.name as string | undefined) ?? session.user.name;
        session.user.email =
          (token.email as string | null | undefined) ?? session.user.email;
        session.user.image =
          (token.picture as string | null | undefined) ?? session.user.image;
      }
      return session;
    },
    jwt({ token, profile }) {
      if (profile && typeof profile === "object") {
        const p = profile as {
          name?: string;
          email?: string;
          image?: string;
        };
        if (p.name) token.name = p.name;
        if (p.email !== undefined) token.email = p.email;
        if (p.image !== undefined) token.picture = p.image;
      }
      return token;
    },
  },
  trustHost: true,
});
