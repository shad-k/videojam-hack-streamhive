import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import prisma from "@/lib/prisma";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth(req: any, res: any) {
  const providers = [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
        name: {
          label: "Name",
          type: "text",
        },
        email: {
          label: "Email",
          type: "email",
        },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req }),
          });

          let user = await prisma.user.findUnique({
            where: {
              address: siwe.address,
            },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                name: credentials?.name,
                email: credentials?.email,
                address: siwe.address,
              },
            });
            // create account
            await prisma.account.create({
              data: {
                address: siwe.address,
                type: "credentials",
                provider: "Ethereum",
                providerAccountId: siwe.address,
              },
            });
          }

          if (result.success) {
            return {
              address: siwe.address,
            };
          }
          return null;
        } catch (e) {
          return null;
        }
      },
    }),
  ];

  const isDefaultSigninPage =
    req.method === "GET" && req.query.nextauth.includes("signin");

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop();
  }

  return await NextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token }: { session: any; token: any }) {
        const user = await prisma.user.findUnique({
          where: {
            address: token.sub,
          },
        });
        session.address = user?.address;
        session.user.name = user?.name;
        session.user.email = user?.email;
        return session;
      },
    },
  });
}
