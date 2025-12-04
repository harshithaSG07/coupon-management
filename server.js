const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const couponRoutes = require('./src/routes/couponRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/coupon', couponRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Coupon Management Service Running' });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app; // for tests
