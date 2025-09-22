import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/onboarding",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          }) as (User & { password: string }) | null;

          if (!user || !user.password) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && user) {
        // If it's a Google sign in, ensure we have the user data
        if (account.provider === 'google' && profile) {
          console.log("Google profile data:", profile);
          // Update user information if needed
          await prisma.user.update({
            where: { id: user.id },
            data: {
              name: profile.name || user.name,
              // For Google, the image is in the profile object with a different property name
              image: (profile as any).image || (profile as any).picture || user.image,
              emailVerified: new Date(),
            },
          });
        }
        
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.image,
        };
      }
      
      // Return previous token if the user hasn't changed
      return token;
    },
    async redirect({ url, baseUrl }) {
      console.log("NextAuth redirect callback:", { url, baseUrl });
      
      // After successful authentication, redirect to dashboard
      if (url.includes('/api/auth/callback')) {
        console.log("Successful authentication, redirecting to dashboard");
        return `${baseUrl}/dashboard`;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        console.log(`Redirecting to relative URL: ${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        console.log(`Redirecting to same-origin URL: ${url}`);
        return url;
      }
      
      console.log(`Redirecting to baseUrl: ${baseUrl}`);
      return baseUrl;
    },
    // Add signIn callback to handle account linking
    async signIn({ user, account, profile, email, credentials }) {
      // Allow sign in if using credentials provider
      if (account?.provider === 'credentials') {
        return true;
      }
      
      // For OAuth providers (like Google)
      if (account?.provider === 'google' && profile?.email) {
        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email.toLowerCase() },
          include: { accounts: true }
        });
        
        // If user exists but doesn't have a Google account linked
        if (existingUser && existingUser.accounts.length === 0) {
          console.log(`User exists with email ${profile.email} but no linked accounts. Linking Google account...`);
          
          // Link the Google account to the existing user
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
          });
          
          // Update the user with Google profile data
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: profile.name || existingUser.name,
              image: (profile as any).image || (profile as any).picture || existingUser.image,
              emailVerified: new Date(),
            },
          });
          
          return true;
        }
      }
      
      // Default allow sign in
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // You could add additional logic here when a user is created
      console.log("New user created:", user.id);
    },
    async signIn({ user, account, profile }) {
      // You could add additional logic here when a user signs in
      console.log("User signed in:", user.id, "with provider:", account?.provider);
      
      // If signing in with Google, make sure the user has all required data
      if (account?.provider === 'google' && profile) {
        try {
          // Update user with Google profile data if needed
          await prisma.user.update({
            where: { id: user.id },
            data: {
              name: user.name || profile.name,
              // For Google, the image is in the profile object with a different property name
              image: user.image || (profile as any).image || (profile as any).picture,
              emailVerified: new Date(),
            },
          });
        } catch (error) {
          console.error("Error updating user with Google profile data:", error);
        }
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
}; 