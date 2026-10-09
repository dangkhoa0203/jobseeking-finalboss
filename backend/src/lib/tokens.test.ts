import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./tokens";

describe("tokens", () => {
  it("round-trips a userId through sign and verify", () => {
    const token = signToken({ userId: 42 });
    const payload = verifyToken(token);
    expect(payload?.userId).toBe(42);
  });

  it("rejects a garbage token", () => {
    expect(verifyToken("not-a-real-token")).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    // jwt.verify should reject a signature that doesn't match our configured secret —
    // this is the whole point of signing: a forged token must not pass verification.
    const jwt = require("jsonwebtoken");
    const forged = jwt.sign({ userId: 1 }, "wrong-secret");
    expect(verifyToken(forged)).toBeNull();
  });
});
