// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const memoryRoutes = require("./routes/memoryRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use((req, _res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

app.use(
    cors({
        origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

// 🚨 PRIMERO los parsers de body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚨 DESPUÉS las rutas (incluyendo las que usan multer)
app.use("/api/memories", memoryRoutes);

// Ruta de prueba
app.get("/", (_req, res) => {
    res.json({ message: "🎀 Kitty Gallery API está corriendo" });
});

// Middleware de errores (al final)
app.use((err, _req, res, _next) => {
    console.error("❌ Error:", err.message || err);
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "La imagen es demasiado pesada. Máximo 10 MB." });
    }
    if (err.message === "Solo se permiten archivos de imagen.") {
        return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message || "Error interno del servidor." });
});

// Conexión a MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Conectado a MongoDB");
        app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
    })
    .catch((err) => {
        console.error("❌ Error al conectar MongoDB:", err.message);
        process.exit(1);
    });