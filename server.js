const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ message: 'Coupon Management API working!' });
});

const couponRoutes = require('./src/routes/couponRoutes');
app.use('/coupon', couponRoutes);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
