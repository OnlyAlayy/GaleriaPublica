import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
    fetchMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    loginAdmin,
} from "../services/api";
import Loader from "../components/Loader";

// Iconos SVG (sin cambios, pero puedes mantenerlos)
const Icons = {
    lock: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    edit: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
    ),
    trash: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    close: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    camera: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    heart: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    ),
    flower: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    )
};

// Eliminamos ADMIN_PASS del frontend

export default function Admin() {
    const [authenticated, setAuthenticated] = useState(!!localStorage.getItem("admin_password"));
    const [password, setPassword] = useState("");
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(false);

    // --- Creación ---
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const coverInputRef = useRef(null);
    const [additionalFiles, setAdditionalFiles] = useState([]);
    const [additionalPreviews, setAdditionalPreviews] = useState([]);
    const additionalInputRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);

    // --- Edición (con manejo de imágenes existentes y nuevas) ---
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDate, setEditDate] = useState("");

    // Portada
    const [editCoverFile, setEditCoverFile] = useState(null);
    const [editCoverPreview, setEditCoverPreview] = useState(null);
    const editCoverInputRef = useRef(null);

    // Imágenes adicionales: separamos existentes de nuevas
    const [editExistingImages, setEditExistingImages] = useState([]); // { url, cloudinaryId }
    const [editNewImages, setEditNewImages] = useState([]); // { file, preview }
    const [editImagesToDelete, setEditImagesToDelete] = useState([]); // cloudinaryIds a eliminar

    const editAdditionalInputRef = useRef(null);
    const [editSubmitting, setEditSubmitting] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    // --- Cargar recuerdos ---
    const loadMemories = async () => {
        setLoading(true);
        try {
            const data = await fetchMemories();
            setMemories(data);
        } catch {
            toast.error("Error al cargar los recuerdos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authenticated) loadMemories();
    }, [authenticated]);

    // --- Login ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await loginAdmin(password);
            setAuthenticated(true);
            toast.success("Bienvenida");
        } catch (err) {
            toast.error(err.message || "Acceso denegado");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_password");
        setAuthenticated(false);
        toast.info("Sesión cerrada");
    };

    // --- Creación: manejadores ---
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        setCoverFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setCoverPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setCoverPreview(null);
        }
    };

    const handleAdditionalChange = (e) => {
        const files = Array.from(e.target.files);
        setAdditionalFiles(files);
        const previews = [];
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                previews.push(reader.result);
                if (previews.length === files.length) {
                    setAdditionalPreviews([...previews]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!coverFile) return toast.error("Selecciona una imagen de portada");
        if (!title.trim()) return toast.error("El título es obligatorio");
        if (!description.trim()) return toast.error("La descripción es obligatoria");

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("cover", coverFile);
            additionalFiles.forEach((file) => formData.append("images", file));
            formData.append("title", title.trim());
            formData.append("description", description.trim());
            if (date) formData.append("date", date);

            await createMemory(formData);
            toast.success("Recuerdo guardado con éxito");

            // Reset
            setTitle(""); setDescription(""); setDate("");
            setCoverFile(null); setCoverPreview(null);
            setAdditionalFiles([]); setAdditionalPreviews([]);
            if (coverInputRef.current) coverInputRef.current.value = "";
            if (additionalInputRef.current) additionalInputRef.current.value = "";
            loadMemories();
        } catch (err) {
            toast.error(err.message || "Error al subir");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Edición: abrir modal ---
    const openEdit = (memory) => {
        setEditingId(memory._id);
        setEditTitle(memory.title);
        setEditDescription(memory.description);
        setEditDate(memory.date ? memory.date.split("T")[0] : "");
        setEditCoverPreview(memory.coverImage.url);
        setEditCoverFile(null);
        setEditExistingImages(memory.images?.map(img => ({ url: img.url, cloudinaryId: img.cloudinaryId })) || []);
        setEditNewImages([]);
        setEditImagesToDelete([]);
    };

    // Portada
    const handleEditCoverChange = (e) => {
        const file = e.target.files[0];
        setEditCoverFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setEditCoverPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setEditCoverPreview(null);
        }
    };

    // Imágenes adicionales nuevas
    const handleEditAdditionalChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [];
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                newImages.push({ file, preview: reader.result });
                if (newImages.length === files.length) {
                    setEditNewImages(prev => [...prev, ...newImages]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // Eliminar imagen existente (marcar para borrar)
    const handleRemoveExistingImage = (cloudinaryId) => {
        setEditExistingImages(prev => prev.filter(img => img.cloudinaryId !== cloudinaryId));
        setEditImagesToDelete(prev => [...prev, cloudinaryId]);
    };

    // Eliminar imagen nueva (antes de subir)
    const handleRemoveNewImage = (index) => {
        setEditNewImages(prev => prev.filter((_, i) => i !== index));
    };

    // Guardar edición
    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editTitle.trim() || !editDescription.trim()) {
            return toast.error("Título y descripción no pueden estar vacíos");
        }

        setEditSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", editTitle.trim());
            formData.append("description", editDescription.trim());

            console.log("editTitle:", editTitle);
            console.log("editDescription:", editDescription);

            if (editDate) formData.append("date", editDate);
            if (editCoverFile) formData.append("cover", editCoverFile);

            // Nuevas imágenes
            editNewImages.forEach(item => {
                formData.append("images", item.file);
            });

            // Imágenes a eliminar (en JSON)
            if (editImagesToDelete.length > 0) {
                formData.append("deletedImages", JSON.stringify(editImagesToDelete));
            }
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }
            await updateMemory(editingId, formData);
            toast.success("Recuerdo actualizado");
            setEditingId(null);
            loadMemories();
        } catch (err) {
            toast.error(err.message || "Error al actualizar");
        } finally {
            setEditSubmitting(false);
        }
    };

    // --- Eliminar recuerdo completo ---
    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este recuerdo? No podrás deshacerlo.")) return;
        setDeletingId(id);
        try {
            await deleteMemory(id);
            toast.success("Recuerdo eliminado");
            loadMemories();
        } catch (err) {
            toast.error(err.message || "Error al eliminar");
        } finally {
            setDeletingId(null);
        }
    };

    // --- Login screen ---
    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-rose-50 to-pink-100">
                <form onSubmit={handleLogin} className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-xl border border-white/30">
                    <div className="text-center mb-6">
                        <div className="inline-flex p-3 bg-pink-100 rounded-full text-pink-600 mb-3">
                            {Icons.lock}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Área privada</h2>
                        <p className="text-sm text-gray-500 mt-1">Ingresa la contraseña para continuar</p>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition text-center"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                        {Icons.heart}
                        <span>Entrar</span>
                    </button>
                </form>
            </div>
        );
    }

    // --- Dashboard ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
                        {Icons.flower}
                        Panel de Administración
                    </h1>
                    <div className="flex items-center justify-center gap-4 mt-2">
                        <p className="text-gray-500">Gestiona tus recuerdos</p>
                        <button
                            onClick={handleLogout}
                            className="text-xs bg-rose-200 text-rose-700 px-3 py-1 rounded-full hover:bg-rose-300 transition font-semibold"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>

                {/* Formulario de creación */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        {Icons.camera}
                        Nuevo recuerdo
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-5">
                        {/* Portada */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Imagen de portada <span className="text-pink-500">*</span>
                            </label>
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-700 file:font-semibold hover:file:bg-pink-200 transition"
                                required
                            />
                            {coverPreview && (
                                <img src={coverPreview} alt="Vista previa" className="mt-3 h-40 w-full object-cover rounded-lg border border-gray-200" />
                            )}
                        </div>

                        {/* Adicionales */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Imágenes adicionales (opcional, múltiples)
                            </label>
                            <input
                                ref={additionalInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleAdditionalChange}
                                className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-700 file:font-semibold hover:file:bg-pink-200 transition"
                            />
                            {additionalPreviews.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {additionalPreviews.map((src, idx) => (
                                        <img key={idx} src={src} alt={`preview-${idx}`} className="h-20 w-full object-cover rounded-lg border border-gray-200" />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Título */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Título <span className="text-pink-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej: Día en el parque"
                                maxLength={120}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                                required
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción <span className="text-pink-500">*</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Cuenta la historia..."
                                maxLength={500}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none resize-none"
                                required
                            />
                        </div>

                        {/* Fecha */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha (opcional)
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    Subiendo...
                                </span>
                            ) : (
                                <>
                                    {Icons.plus}
                                    <span>Subir recuerdo</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Lista de recuerdos */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        {Icons.heart}
                        Recuerdos guardados
                        <span className="text-sm font-normal text-gray-500 ml-2">({memories.length})</span>
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-10"><Loader /></div>
                    ) : memories.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <div className="inline-flex p-3 bg-pink-100 rounded-full text-pink-400 mb-3">
                                {Icons.flower}
                            </div>
                            <p>Aún no hay recuerdos</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-200">
                            {memories.map((memory) => (
                                <div key={memory._id} className="flex items-center gap-4 p-4 rounded-xl bg-white hover:shadow-md transition group">
                                    <img src={memory.coverImage.url} alt={memory.title} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">{memory.title}</p>
                                        <p className="text-sm text-gray-500 truncate">{memory.description}</p>
                                        {memory.date && (
                                            <p className="text-xs text-pink-400 mt-1">
                                                {new Date(memory.date).toLocaleDateString()}
                                            </p>
                                        )}
                                        {memory.images?.length > 0 && (
                                            <span className="text-xs text-pink-400 ml-1">(+{memory.images.length} fotos)</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                        <button onClick={() => openEdit(memory)} className="p-2 rounded-lg hover:bg-pink-100 text-pink-600" title="Editar">
                                            {Icons.edit}
                                        </button>
                                        <button onClick={() => handleDelete(memory._id)} disabled={deletingId === memory._id} className="p-2 rounded-lg hover:bg-red-100 text-red-500 disabled:opacity-50" title="Eliminar">
                                            {deletingId === memory._id ? <span className="animate-spin w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full"></span> : Icons.trash}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal de edición (con eliminación de imágenes) */}
                {editingId && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingId(null)}>
                        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    {Icons.edit}
                                    Editar recuerdo
                                </h3>
                                <button onClick={() => setEditingId(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                                    {Icons.close}
                                </button>
                            </div>
                            <form onSubmit={handleEdit} className="space-y-4">
                                {/* Portada */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de portada</label>
                                    <input
                                        ref={editCoverInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditCoverChange}
                                        className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-700 file:font-semibold hover:file:bg-pink-200 transition"
                                    />
                                    {editCoverPreview && (
                                        <img src={editCoverPreview} alt="Portada actual" className="mt-3 h-32 w-full object-cover rounded-lg border border-gray-200" />
                                    )}
                                </div>

                                {/* Imágenes adicionales existentes */}
                                {editExistingImages.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes actuales</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {editExistingImages.map((img, idx) => (
                                                <div key={idx} className="relative">
                                                    <img src={img.url} alt="existente" className="h-20 w-full object-cover rounded-lg border border-gray-200" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExistingImage(img.cloudinaryId)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                        title="Eliminar imagen"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Input para nuevas imágenes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Agregar nuevas imágenes</label>
                                    <input
                                        ref={editAdditionalInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleEditAdditionalChange}
                                        className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-700 file:font-semibold hover:file:bg-pink-200 transition"
                                    />
                                </div>

                                {/* Previsualización de nuevas imágenes */}
                                {editNewImages.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nuevas imágenes a subir</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {editNewImages.map((img, idx) => (
                                                <div key={idx} className="relative">
                                                    <img src={img.preview} alt="nueva" className="h-20 w-full object-cover rounded-lg border border-gray-200" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveNewImage(idx)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                        title="Eliminar imagen"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Título */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                                        required
                                    />
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none resize-none"
                                        required
                                    />
                                </div>

                                {/* Fecha */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                                    />
                                </div>

                                <div className="flex gap-3 mt-5">
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editSubmitting}
                                        className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {editSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                                                Guardando...
                                            </span>
                                        ) : (
                                            <>
                                                {Icons.check}
                                                <span>Guardar cambios</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}