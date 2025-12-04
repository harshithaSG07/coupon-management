const request = require("supertest");
const app = require("../server");

describe("Coupon API Tests", () => {
  it("should create a coupon", async () => {
    const res = await request(app)
      .post("/coupon/create")
      .send({
        code: "TEST100",
        description: "Test Coupon",
        discountType: "FLAT",
        discountValue: 100,
        maxDiscount: 100,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        userEligibility: { minUserAge: 18 },
        cartEligibility: { minCartValue: 500 },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.code).toBe("TEST100");
  });

  it("should reject invalid coupon input", async () => {
    const res = await request(app)
      .post("/coupon/create")
      .send({
        code: "",
        discountValue: -10
      });

    expect(res.statusCode).toBe(400);
  });
});
