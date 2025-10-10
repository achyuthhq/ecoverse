import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

export interface AdminUser {
  id: string;
  username: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AccessCodeData {
  id: string;
  code: string;
  subscriptionType: "monthly" | "lifetime";
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  usedAt?: Date;
  userId?: string;
}

// Admin authentication
export async function authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    return {
      id: admin.id,
      username: admin.username,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin
    };
  } catch (error) {
    console.error("Admin authentication error:", error);
    return null;
  }
}

// Generate secure 6-digit access code
export async function generateAccessCode(subscriptionType: "monthly" | "lifetime"): Promise<AccessCodeData> {
  let code: string;
  let isUnique = false;

  // Generate unique 6-digit code
  while (!isUnique) {
    code = randomInt(100000, 999999).toString();
    
    // Check if code already exists
    const existingCode = await prisma.accessCode.findUnique({
      where: { code }
    });
    
    isUnique = !existingCode;
  }

  // Calculate expiration date
  const expiresAt = subscriptionType === "monthly" 
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    : null; // Lifetime

  // Create access code
  const accessCode = await prisma.accessCode.create({
    data: {
      code: code!,
      subscriptionType,
      expiresAt,
      isActive: true
    }
  });

  return {
    id: accessCode.id,
    code: accessCode.code,
    subscriptionType: accessCode.subscriptionType as "monthly" | "lifetime",
    expiresAt: accessCode.expiresAt,
    isActive: accessCode.isActive,
    createdAt: accessCode.createdAt,
    usedAt: accessCode.usedAt,
    userId: accessCode.userId
  };
}

// Validate access code
export async function validateAccessCode(code: string): Promise<{ valid: boolean; accessCode?: AccessCodeData; user?: any }> {
  try {
    const accessCode = await prisma.accessCode.findUnique({
      where: { code },
      include: { user: true }
    });

    if (!accessCode) {
      return { valid: false };
    }

    // Check if code is active
    if (!accessCode.isActive) {
      return { valid: false };
    }

    // Check if code is expired (for monthly subscriptions)
    if (accessCode.expiresAt && new Date() > accessCode.expiresAt) {
      return { valid: false };
    }

    // If code is already used, check if the user's subscription is still valid
    if (accessCode.usedAt && accessCode.user) {
      // Check if user's subscription is still valid
      if (accessCode.user.subscriptionType === "lifetime") {
        return {
          valid: true,
          accessCode: {
            id: accessCode.id,
            code: accessCode.code,
            subscriptionType: accessCode.subscriptionType as "monthly" | "lifetime",
            expiresAt: accessCode.expiresAt,
            isActive: accessCode.isActive,
            createdAt: accessCode.createdAt,
            usedAt: accessCode.usedAt,
            userId: accessCode.userId
          },
          user: accessCode.user
        };
      } else if (accessCode.user.subscriptionType === "monthly" && accessCode.user.subscriptionExpires && new Date() < accessCode.user.subscriptionExpires) {
        return {
          valid: true,
          accessCode: {
            id: accessCode.id,
            code: accessCode.code,
            subscriptionType: accessCode.subscriptionType as "monthly" | "lifetime",
            expiresAt: accessCode.expiresAt,
            isActive: accessCode.isActive,
            createdAt: accessCode.createdAt,
            usedAt: accessCode.usedAt,
            userId: accessCode.userId
          },
          user: accessCode.user
        };
      } else {
        return { valid: false };
      }
    }

    // Code is not used yet, so it's valid
    return {
      valid: true,
      accessCode: {
        id: accessCode.id,
        code: accessCode.code,
        subscriptionType: accessCode.subscriptionType as "monthly" | "lifetime",
        expiresAt: accessCode.expiresAt,
        isActive: accessCode.isActive,
        createdAt: accessCode.createdAt,
        usedAt: accessCode.usedAt,
        userId: accessCode.userId
      },
      user: accessCode.user
    };
  } catch (error) {
    console.error("Access code validation error:", error);
    return { valid: false };
  }
}

// Use access code (create user and mark code as used)
export async function useAccessCode(code: string, deviceInfo?: string, ipAddress?: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const validation = await validateAccessCode(code);
    
    if (!validation.valid) {
      return { success: false, error: "Invalid or expired code" };
    }

    const accessCode = validation.accessCode!;

    // If user already exists, return existing user
    if (validation.user) {
      return { success: true, user: validation.user };
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        name: `User-${code}`,
        subscriptionType: accessCode.subscriptionType,
        subscriptionExpires: accessCode.expiresAt,
        accessCode: {
          connect: { id: accessCode.id }
        }
      }
    });

    // Mark code as used
    await prisma.accessCode.update({
      where: { id: accessCode.id },
      data: {
        usedAt: new Date(),
        userId: user.id,
        deviceInfo,
        ipAddress
      }
    });

    return { success: true, user };
  } catch (error) {
    console.error("Use access code error:", error);
    return { success: false, error: "Failed to create user account" };
  }
}

// Get admin dashboard statistics
export async function getAdminStats() {
  try {
    const [
      totalUsers,
      activeUsers,
      totalCodes,
      activeCodes,
      monthlySubscriptions,
      lifetimeSubscriptions,
      recentAnalyses
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          OR: [
            { subscriptionType: "lifetime" },
            { 
              subscriptionType: "monthly",
              subscriptionExpires: { gt: new Date() }
            }
          ]
        }
      }),
      prisma.accessCode.count(),
      prisma.accessCode.count({
        where: { isActive: true, usedAt: null }
      }),
      prisma.user.count({
        where: { subscriptionType: "monthly" }
      }),
      prisma.user.count({
        where: { subscriptionType: "lifetime" }
      }),
      prisma.analysis.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    return {
      totalUsers,
      activeUsers,
      totalCodes,
      activeCodes,
      monthlySubscriptions,
      lifetimeSubscriptions,
      recentAnalyses
    };
  } catch (error) {
    console.error("Get admin stats error:", error);
    return null;
  }
}

// Get recent access codes
export async function getRecentAccessCodes(limit: number = 10) {
  try {
    const codes = await prisma.accessCode.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: true }
    });

    return codes;
  } catch (error) {
    console.error("Get recent access codes error:", error);
    return [];
  }
}
