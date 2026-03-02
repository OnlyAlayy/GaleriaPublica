const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    coverImage: {   // ← imagen principal (portada)
        url: { type: String, required: true },
        cloudinaryId: { type: String, required: true },
    },
    images: [       // ← array de imágenes adicionales
        {
            url: { type: String, required: true },
            cloudinaryId: { type: String, required: true },
        }
    ],
    date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Memory", memorySchema);
