const Memory = require("../models/Memory");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};

exports.getMemories = async (req, res, next) => {
    try {
        const memories = await Memory.find().sort({ date: -1 });
        res.json({ success: true, data: memories });
    } catch (err) {
        next(err);
    }
};

exports.createMemory = async (req, res, next) => {
    try {
        const { title, description, date } = req.body;
        const files = req.files;

        if (!title?.trim()) {
            return res.status(400).json({ success: false, message: "El título es obligatorio." });
        }
        if (!description?.trim()) {
            return res.status(400).json({ success: false, message: "La descripción es obligatoria." });
        }
        if (!files || !files['cover'] || files['cover'].length === 0) {
            return res.status(400).json({ success: false, message: "Debes subir una imagen de portada." });
        }

        const coverFile = files['cover'][0];
        const coverResult = await uploadToCloudinary(coverFile.buffer, 'kitty_memories/covers');

        const additionalImages = [];
        if (files['images'] && files['images'].length > 0) {
            for (const file of files['images']) {
                const imgResult = await uploadToCloudinary(file.buffer, 'kitty_memories/additional');
                additionalImages.push({
                    url: imgResult.secure_url,
                    cloudinaryId: imgResult.public_id,
                });
            }
        }

        const memory = await Memory.create({
            title: title.trim(),
            description: description.trim(),
            coverImage: {
                url: coverResult.secure_url,
                cloudinaryId: coverResult.public_id,
            },
            images: additionalImages,
            date: date || Date.now(),
        });

        res.status(201).json({ success: true, data: memory });
    } catch (err) {
        next(err);
    }
};

exports.updateMemory = async (req, res, next) => {
    try {
        const { title, description, date } = req.body;
        const files = req.files; // objeto con propiedades 'cover' e 'images'
        const memoryId = req.params.id;

        console.log("req.body:", req.body); // Debería mostrar title, description, etc.
        console.log("KEYS en req.body:", Object.keys(req.body));
        console.log("VALOR de title:", req.body.title);
        console.log("VALOR de description:", req.body.description);

        let deletedImages = [];
        if (req.body.deletedImages) {
            try {
                deletedImages = JSON.parse(req.body.deletedImages);
            } catch (e) { }
        }

        const existingMemory = await Memory.findById(memoryId);
        if (!existingMemory) {
            return res.status(404).json({ success: false, message: "Recuerdo no encontrado." });
        }

        if (!title?.trim() || !description?.trim()) {
            return res.status(400).json({ success: false, message: "Título y descripción son obligatorios." });
        }

        const updateData = {
            title: title.trim(),
            description: description.trim(),
            date: date || existingMemory.date,
        };

        // Portada
        if (files && files['cover'] && files['cover'].length > 0) {
            if (existingMemory.coverImage?.cloudinaryId) {
                await cloudinary.uploader.destroy(existingMemory.coverImage.cloudinaryId);
            }
            const coverFile = files['cover'][0];
            const coverResult = await uploadToCloudinary(coverFile.buffer, 'kitty_memories/covers');
            updateData.coverImage = {
                url: coverResult.secure_url,
                cloudinaryId: coverResult.public_id,
            };
        }

        // Imágenes adicionales
        let updatedImages = existingMemory.images || [];

        if (deletedImages.length > 0) {
            for (const cloudinaryId of deletedImages) {
                await cloudinary.uploader.destroy(cloudinaryId);
            }
            updatedImages = updatedImages.filter(img => !deletedImages.includes(img.cloudinaryId));
        }

        if (files && files['images'] && files['images'].length > 0) {
            const newImages = [];
            for (const file of files['images']) {
                const imgResult = await uploadToCloudinary(file.buffer, 'kitty_memories/additional');
                newImages.push({
                    url: imgResult.secure_url,
                    cloudinaryId: imgResult.public_id,
                });
            }
            updatedImages = [...updatedImages, ...newImages];
        }

        updateData.images = updatedImages;

        const updatedMemory = await Memory.findByIdAndUpdate(memoryId, updateData, { new: true, runValidators: true });
        res.json({ success: true, data: updatedMemory });
    } catch (err) {
        next(err);
    }
};

exports.deleteMemory = async (req, res, next) => {
    try {
        const memory = await Memory.findById(req.params.id);
        if (!memory) {
            return res.status(404).json({ success: false, message: "Recuerdo no encontrado." });
        }

        if (memory.coverImage?.cloudinaryId) {
            await cloudinary.uploader.destroy(memory.coverImage.cloudinaryId);
        }

        if (memory.images && memory.images.length > 0) {
            for (const img of memory.images) {
                if (img.cloudinaryId) {
                    await cloudinary.uploader.destroy(img.cloudinaryId);
                }
            }
        }

        await Memory.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Recuerdo eliminado exitosamente." });
    } catch (err) {
        next(err);
    }
};

exports.verifyAdmin = async (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true, message: "Autenticación exitosa" });
    } else {
        res.status(401).json({ success: false, message: "Contraseña incorrecta" });
    }
};