const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || "v1";

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
name: 'http_request_duration_seconds',
help: 'Duration of HTTP requests in seconds',
labelNames: ['method', 'route', 'status_code'],
});

register.registerMetric(httpRequestDuration);

// Middleware for tracking request duration
app.use((req, res, next) => {
const end = httpRequestDuration.startTimer();
res.on('finish', () => {
end({ method: req.method, route: req.path, status_code: res.statusCode });
});
next();
});

// Routes
app.get('/', (req, res) => {
res.json({
message: "Welcome to SafeShop API",
version: VERSION
});
});

app.get('/health', (req, res) => {
res.status(200).send("OK");
});

app.get('/api/orders', (req, res) => {
res.json({
orders: [
{ id: 1, item: "Laptop", price: 50000 },
{ id: 2, item: "Phone", price: 20000 }
],
version: VERSION
});
});

// 🔥 Canary testing endpoint
app.get('/api/payment', (req, res) => {
if (VERSION === "v2") {
if (Math.random() < 0.3) {
return res.status(500).json({
error: "Payment service failed",
version: VERSION
});
}
}

res.json({
status: "Payment successful",
version: VERSION
});
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
res.set('Content-Type', register.contentType);
res.end(await register.metrics());
});

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}, version ${VERSION}`);
});
