const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
    getMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    verifyAdmin,
} = require("../controllers/memoryController");
const adminAuth = require("../middleware/auth");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Solo se permiten archivos de imagen."), false);
        }
    },
});

const uploadFields = upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);

router.get("/", getMemories);
router.post("/auth/login", verifyAdmin); // Nueva ruta para el login
router.post("/", adminAuth, uploadFields, createMemory);
router.put("/:id", adminAuth, uploadFields, updateMemory);
router.delete("/:id", adminAuth, deleteMemory);

module.exports = router;