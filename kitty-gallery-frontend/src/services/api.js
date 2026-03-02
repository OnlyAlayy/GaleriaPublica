const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper para obtener el password de localStorage
const getAuthHeader = () => {
    const pass = localStorage.getItem("admin_password");
    return pass ? { "x-admin-password": pass } : {};
};

export async function loginAdmin(password) {
    const res = await fetch(`${API_URL}/memories/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
    });

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al autenticar");
        // Si es correcto, guardamos en localStorage
        localStorage.setItem("admin_password", password);
        return data;
    } else {
        const text = await res.text();
        console.error("Respuesta no JSON:", text);
        throw new Error(`El servidor respondió algo inesperado (HTML). Verifica que el Backend esté corriendo en el puerto correcto.`);
    }
}

export async function fetchMemories() {
    const res = await fetch(`${API_URL}/memories`);
    if (!res.ok) throw new Error("Error al obtener recuerdos");
    const data = await res.json();
    return data.data;
}

export async function createMemory(formData) {
    const res = await fetch(`${API_URL}/memories`, {
        method: "POST",
        headers: { ...getAuthHeader() },
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al crear recuerdo");
    return data.data;
}

export async function updateMemory(id, formData) {
    const res = await fetch(`${API_URL}/memories/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeader() },
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al actualizar recuerdo");
    return data.data;
}

export async function deleteMemory(id) {
    const res = await fetch(`${API_URL}/memories/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al eliminar recuerdo");
    return data;
}
