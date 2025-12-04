const request = require('supertest');
const app = require('../server');
const svc = require('../src/services/couponService');

describe('Coupon API - integration', () => {
  beforeAll(() => {
    // clear any coupons
    svc._internal.coupons.length = 0;
  });

  test('create coupon and then get best coupon (usage limit 1)', async () => {
    const createRes = await request(app)
      .post('/coupon/create')
      .send({
        code: 'LIMIT1',
        description: 'Flat 50',
        discountType: 'FLAT',
        discountValue: 50,
        startDate: '2025-01-01',
        endDate: '2026-01-01',
        usageLimitPerUser: 1,
        eligibility: {
          minCartValue: 0
        }
      });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.coupon.code).toBe('LIMIT1');

    const bestRes1 = await request(app)
      .post('/coupon/best')
      .send({
        userContext: {
          userId: 'u1',
          userTier: 'NEW',
          country: 'IN',
          lifetimeSpend: 0,
          ordersPlaced: 0
        },
        cart: {
          items: [{ productId: 'p1', category: 'electronics', unitPrice: 500, quantity: 1 }]
        }
      });

    expect(bestRes1.body.discount).toBe(50);
    expect(bestRes1.body.coupon.code).toBe('LIMIT1');

    // second call should not apply (limit reached)
    const bestRes2 = await request(app)
      .post('/coupon/best')
      .send({
        userContext: {
          userId: 'u1',
          userTier: 'NEW',
          country: 'IN',
          lifetimeSpend: 0,
          ordersPlaced: 0
        },
        cart: {
          items: [{ productId: 'p1', category: 'electronics', unitPrice: 500, quantity: 1 }]
        }
      });

    expect(bestRes2.body.coupon).toBeNull();
    expect(bestRes2.body.discount).toBe(0);
  });

  test('percent with cap and tie-breaking', async () => {
    // clear coupons
    svc._internal.coupons.length = 0;

    await request(app).post('/coupon/create').send({
      code: 'PERC1',
      description: '20% upto 100',
      discountType: 'PERCENT',
      discountValue: 20,
      maxDiscountAmount: 100,
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      eligibility: { minCartValue: 0 }
    });

    await request(app).post('/coupon/create').send({
      code: 'FLAT100',
      description: 'Flat 100',
      discountType: 'FLAT',
      discountValue: 100,
      startDate: '2025-01-01',
      endDate: '2026-01-01',
      eligibility: { minCartValue: 0 }
    });

    const res = await request(app).post('/coupon/best').send({
      userContext: { userId: 'u2', userTier: 'REGULAR', country: 'IN', lifetimeSpend: 0, ordersPlaced: 1 },
      cart: { items: [{ productId: 'x', category: 'electronics', unitPrice: 1000, quantity: 1 }] }
    });

    // Both give 100, tie-breaker: earliest endDate same -> lexicographically smaller code
    // Codes: 'FLAT100' vs 'PERC1' => 'FLAT100' < 'PERC1' (F < P) so FLAT100 wins
    expect(res.body.discount).toBe(100);
    expect(res.body.coupon.code).toBe('FLAT100');
  });
});
