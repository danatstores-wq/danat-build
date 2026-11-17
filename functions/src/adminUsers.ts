import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { Timestamp, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

if (getApps().length === 0) initializeApp();

const adminAuth = getAuth();
const db = getFirestore();

function requireAdmin(request: { auth?: { uid: string; token: Record<string, unknown> } | null }): string {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in is required.");
  }
  if (request.auth.token.admin !== true) {
    throw new HttpsError("permission-denied", "Administrator access is required.");
  }
  return request.auth.uid;
}

export const adminLookupUser = onCall(
  { region: "us-central1", maxInstances: 5 },
  async request => {
    requireAdmin(request);
    const email = typeof request.data?.email === "string"
      ? request.data.email.trim().toLowerCase()
      : "";
    if (!email || email.length > 254 || !email.includes("@")) {
      throw new HttpsError("invalid-argument", "Enter a valid email address.");
    }

    let user;
    try {
      user = await adminAuth.getUserByEmail(email);
    } catch (error: any) {
      if (error?.code === "auth/user-not-found") {
        throw new HttpsError("not-found", "No Danat Build account uses this email.");
      }
      throw error;
    }

    const snapshot = await db.collection("entitlements").doc(user.uid).get();
    const data = snapshot.data();
    const hasOverride = data?.adminOverride === true;
    const expiresAt = data?.expiresAt?.toMillis?.() ?? null;
    const isProfessional = hasOverride
      ? data?.adminStatus === "professional"
      : data?.status === "active" && typeof expiresAt === "number" && expiresAt > Date.now();

    return {
      uid: user.uid,
      email: user.email || email,
      access: isProfessional ? "professional" : "free",
      source: hasOverride ? "admin" : "subscription",
      expiresAt: hasOverride ? null : expiresAt,
    };
  }
);

export const adminSetUserAccess = onCall(
  { region: "us-central1", maxInstances: 5 },
  async request => {
    const adminUid = requireAdmin(request);
    const uid = typeof request.data?.uid === "string" ? request.data.uid : "";
    const access = request.data?.access;
    if (!uid || uid.length > 128 || uid.includes("/") || !["free", "professional"].includes(access)) {
      throw new HttpsError("invalid-argument", "A valid user and access status are required.");
    }
    if (uid === adminUid) {
      throw new HttpsError("failed-precondition", "You cannot change your own administrator account access here.");
    }

    try {
      await adminAuth.getUser(uid);
    } catch (error: any) {
      if (error?.code === "auth/user-not-found") {
        throw new HttpsError("not-found", "The selected account no longer exists.");
      }
      throw error;
    }

    const isProfessional = access === "professional";
    await db.collection("entitlements").doc(uid).set({
      adminOverride: true,
      adminStatus: access,
      status: isProfessional ? "active" : "revoked",
      expiresAt: isProfessional ? Timestamp.fromDate(new Date("9999-12-31T23:59:59.000Z")) : null,
      source: "admin",
      platform: "admin",
      productId: null,
      adminUpdatedBy: adminUid,
      adminUpdatedAt: Timestamp.now(),
    }, { merge: true });

    return { success: true };
  }
);
