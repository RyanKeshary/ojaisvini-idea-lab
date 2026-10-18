import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/auth/staff/verify/route";

describe("Staff verify API", () => {
  it("verifies sakhi demo user", async () => {
    const req = new Request("http://localhost:3000/api/auth/staff/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "sakhi@ojas.demo", password: "demo1234" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.role).toBe("SAKHI");
    expect(typeof json.ticket).toBe("string");
  });

  it("verifies admin demo user", async () => {
    const req = new Request("http://localhost:3000/api/auth/staff/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "admin@ojas.demo", password: "demo1234" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.role).toBe("ADMIN");
  });

  it("returns 401 with ok: false on incorrect password", async () => {
    const req = new Request("http://localhost:3000/api/auth/staff/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "sakhi@ojas.demo", password: "wrongpassword" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.ok).toBe(false);
    expect(json.code).toBe("pin-wrong");
  });
});
