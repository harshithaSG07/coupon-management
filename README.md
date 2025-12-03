# Coupon Management Service  
### Author: **Harshitha SG**

---

## 📌 Overview

This project is a backend service for **managing coupons** and **selecting the best applicable coupon** based on user context and cart details.  
It is built exactly as required in the assignment specification.

The service supports:

- Creating coupons with detailed eligibility rules  
- Storing them in memory  
- Checking which coupons apply to a given user + cart  
- Calculating discount values  
- Selecting the **best** coupon based on:  
  1. Highest discount  
  2. Earliest end date  
  3. Lexicographically smaller coupon code  
- Enforcing `usageLimitPerUser`  

No database or frontend is used — matching the assignment requirements.

---

## 🛠 Tech Stack

- **Node.js**
- **Express.js**
- **body-parser**
- **cors**
- **date-fns**

---

## 🚀 How to Run Locally

1. Clone or download this project
2. Open the folder in VS Code
3. Install dependencies:

```
npm install
```

4. Start the server:

```
node server.js
```

5. The server will run on:

```
http://localhost:3000
```

---

## 📁 Folder Structure

```
coupon-management/
 ├── server.js
 ├── package.json
 └── src/
      ├── routes/
      │     └── couponRoutes.js
      ├── controllers/
      │     └── couponController.js
      ├── services/
      │     └── couponService.js
      ├── utils/
      │     ├── eligibility.js
      │     └── discount.js
      └── models/
```

---

## 📮 API Documentation

---

# 1️⃣ POST /coupon/create

### Description  
Creates a new coupon and stores it in memory. Duplicate coupon codes are not allowed.

### Request Body Example

```json
{
  "code": "WELCOME100",
  "description": "₹100 off",
  "discountType": "FLAT",
  "discountValue": 100,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "usageLimitPerUser": 1,
  "eligibility": {
    "allowedUserTiers": ["NEW", "REGULAR"],
    "minLifetimeSpend": 0,
    "minOrdersPlaced": 0,
    "firstOrderOnly": false,
    "allowedCountries": ["IN"],
    "minCartValue": 100,
    "applicableCategories": ["electronics"],
    "excludedCategories": [],
    "minItemsCount": 1
  }
}
```

### Successful Response

```json
{
  "message": "Coupon created successfully",
  "coupon": { }
}
```

### Duplicate Code Response

```json
{ "error": "Coupon code must be unique" }
```

---

# 2️⃣ POST /coupon/best

### Description  
Determines the best applicable coupon for a given user and cart.

### Request Body Example

```json
{
  "userContext": {
    "userId": "u1",
    "userTier": "NEW",
    "country": "IN",
    "lifetimeSpend": 0,
    "ordersPlaced": 0
  },
  "cart": {
    "items": [
      {
        "productId": "p1",
        "category": "electronics",
        "unitPrice": 1000,
        "quantity": 1
      }
    ]
  }
}
```

### Successful Response Example

```json
{
  "coupon": {},
  "discount": 100
}
```

### No Applicable Coupon Response

```json
{
  "coupon": null,
  "discount": 0
}
```

---

## 🧪 Test Cases

### Test Case 1 — Flat Discount  
- Coupon: FLAT ₹50  
- Cart: ₹500  
- Best discount: **50**

---

### Test Case 2 — Percent Discount  
- Coupon: 10% OFF  
- Cart: ₹2000  
- Best discount: **200**

---

### Test Case 3 — Percent Discount With Cap  
- Coupon: 20% OFF, max ₹100  
- Cart: ₹1000  
- 20% = 200 → capped to **100**

---

### Test Case 4 — Usage Limit  
- usageLimitPerUser = 1  
- First `/best` → valid  
- Second `/best` → invalid  

---

### Test Case 5 — User Eligibility  
Coupon requires GOLD tier  
User tier = NEW → invalid

---

### Test Case 6 — Category Eligibility  
Coupon applicable to "fashion"  
Cart contains "electronics" → invalid

---

### Test Case 7 — Tie Breaking  
If two coupons give same discount:

1. Pick earliest endDate  
2. If same → pick alphabetically smaller code  

---

## 🤖 AI Tools Disclosure

This project was built using:

- **ChatGPT** for:  
  - Generating Node.js boilerplate  
  - Implementing eligibility logic  
  - Implementing discount logic  
  - Debugging errors  
  - Writing README  
  - Providing sample test cases  

### Prompts Used:
- "Help me create coupon create API"
- "Implement coupon eligibility logic"
- "Implement discount logic"
- "Fix Express routing error"
- "Write README exactly like assignment"
- Multiple follow-up prompts for corrections and improvements

All AI-generated code was reviewed and tested by **Harshitha SG**.

---

## ✔ Final Notes

This project fulfills all requirements from Assignment B:

- Create coupon API  
- In-memory storage  
- Eligibility rules  
- Cart rules  
- Date validity  
- Discount calculation  
- Usage tracking  
- Best coupon selection  
- README with AI disclosure  

---

# ✅ End of README.md
