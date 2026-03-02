// middleware/auth.js
const adminAuth = (req, res, next) => {
    // Buscamos la contraseña en los headers de la petición
    const adminPassword = req.headers['x-admin-password'] || req.headers['authorization'];

    // Si no hay contraseña o no coincide con la del servidor
    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            success: false,
            message: "Acceso denegado. Se requiere autenticación de administrador."
        });
    }

    // Si todo está bien, continuamos
    next();
};

module.exports = adminAuth;
