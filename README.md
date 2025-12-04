<div align="center">

# 🧾 Coupon Management Service  
### **Backend Assignment – Premium Implementation**
#### **Author: Harshitha SG**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Node](https://img.shields.io/badge/node-18+-green)
![Express](https://img.shields.io/badge/express-4.x-lightgrey)
![License](https://img.shields.io/badge/license-MIT-purple)

</div>

---

# 📚 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
  - [POST /coupon/create](#1-post-couponcreate)
  - [POST /coupon/best](#2-post-couponbest)
- [Business Logic](#business-logic)
- [Tests (Bonus)](#tests-bonus)
- [AI Tools Disclosure](#ai-tools-disclosure)
- [Screenshots](#screenshots)

---

# 🌟 Overview

This project implements a **complete Coupon Management Backend System** as required in  
**Assignment B – Coupon Management**.

It supports:

✔ Creating coupons  
✔ Validating user/cart eligibility  
✔ Calculating FLAT & PERCENT discounts  
✔ Selecting the BEST possible coupon  
✔ Per-user usage limit tracking  
✔ In-memory database (as required)

This project is designed with **clean architecture**, **modular structure**, and **industry-standard coding practices**.

---

# ✨ Features

### 🚀 Core Features
- Create coupons with all required fields  
- Enforce **unique coupon codes**  
- Full eligibility engine:
  - Allowed user tiers  
  - Country restrictions  
  - First order only  
  - Category allow/deny  
  - Minimum spend  
  - Minimum items  
  - Lifetime spend threshold  
  - Orders placed threshold  
- Exact discount calculation  
- Find the **best coupon using tie-break rules**  
- Per-user usage counter

---

### 🧠 Smart Logic Features
- Reject expired coupons  
- Reject coupons not started yet  
- Prevent exceeding usage limits  
- Handle percent discount caps  
- Tie-break logic:
  1. Highest discount  
  2. Earliest expiry  
  3. Alphabetical code  

---

### 🧪 Bonus Features
- Includes a test suite (Jest + Supertest)  
- Modular architecture  
- Professional-grade documentation  

---

# 🛠 Tech Stack

| Layer | Technology |
|------|------------|
| Backend | Node.js (18+) |
| Framework | Express.js |
| Date Utils | date-fns |
| Middleware | body-parser, cors |
| Testing | Jest & Supertest |
| Storage | In-memory store (assignment requirement) |

---

# 📁 Folder Structure

```
coupon-management/
│
├── server.js
├── package.json
├── README.md
├── .gitignore
│
├── src/
│   ├── routes/
│   │   └── couponRoutes.js
│   ├── controllers/
│   │   └── couponController.js
│   ├── services/
│   │   └── couponService.js
│   ├── utils/
│   │   ├── eligibility.js
│   │   └── discount.js
│   └── models/
│
└── tests/
    └── coupon.integration.test.js
```

---

# ⚙️ Running the Project

### Install dependencies
```bash
npm install
```

### Start the server
```bash
npm start
```

Server runs at:

```
http://localhost:3000
```

---

# 📮 API Documentation

---

# 1️⃣ **POST /coupon/create**

### ➤ Purpose  
Creates a coupon & stores it in-memory. Enforces unique coupon codes.

### ➤ Sample Request  
```json
{
  "code": "WELCOME100",
  "description": "Flat ₹100 off",
  "discountType": "FLAT",
  "discountValue": 100,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "usageLimitPerUser": 1,
  "eligibility": {
    "allowedUserTiers": ["NEW"],
    "minCartValue": 100,
    "allowedCountries": ["IN"],
    "applicableCategories": ["electronics"]
  }
}
```

### ➤ Success Response
```json
{
  "message": "Coupon created successfully",
  "coupon": { ... }
}
```

---

# 2️⃣ **POST /coupon/best**

### ➤ Purpose  
Calculates the best possible coupon for a given user + cart.

### ➤ Sample Request  
```json
{
  "userContext": {
    "userId": "u1",
    "userTier": "NEW",
    "country": "IN",
    "lifetimeSpend": 5000,
    "ordersPlaced": 3
  },
  "cart": {
    "items": [
      {
        "productId": "p1",
        "category": "electronics",
        "unitPrice": 1200,
        "quantity": 1
      }
    ]
  }
}
```

### ➤ Sample Success Response  
```json
{
  "coupon": { ... },
  "discount": 100
}
```

---

# 🧠 Business Logic

## ✔ Eligibility Checks
A coupon is valid only if **all** conditions match:

- Date validity  
- User tier match  
- Country restriction  
- First order rule  
- Min cart value  
- Min item count  
- Category allow/deny  
- Lifetime spend rule  
- Orders placed rule  
- Usage limit  

---

## ✔ Discount Calculation
Supports:

### FLAT  
```
discount = discountValue
```

### PERCENT  
```
discount = (cartTotal * discountValue / 100)
discount = Math.min(discount, maxDiscountAmount)
```

---

## ✔ Best Coupon Selection (Tie-break rules)

1️⃣ Highest discount  
2️⃣ If tied → earliest expiry  
3️⃣ If still tied → lexicographically smaller code  

This matches the assignment exactly.

---

# 🧪 Tests (Bonus)

To run tests:

```bash
npm test
```

Tests cover:

- Eligibility  
- Discount correctness  
- Best-coupon ranking  
- Invalid coupons  
- Usage-limit enforcement  

---

# 🤖 AI Tools Disclosure

AI tools (ChatGPT) were used **only for**:

- Clarifying assignment requirements  
- Generating boilerplate Express code  
- Debugging minor issues  
- Improving code readability  
- Structuring documentation  
- Creating test scaffolding  

All final logic was written, reviewed, and validated by **Harshitha SG**.

### Prompts Used  
- Implement coupon eligibility logic  
- Express routing fixes  
- Write README.md  
- Generate jest tests  
- Improve discount logic  

---

# 🖼 Screenshots (Optional but Recommended)

You can attach:

- Postman screenshots  
- Terminal run logs  
- Test results  

Example template:

```
![Create Coupon](assets/create_coupon.png)
![Best Coupon](assets/best_coupon.png)
```

---

# 🎉 End of README

