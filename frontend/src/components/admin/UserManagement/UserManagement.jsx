// frontend/src/components/admin/UserManagement/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { userService } from "../../../services/userService";
import "./UserManagement.css";

const UserManagement = ({ isOpen, onClose, currentUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Formulario de nuevo usuario
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        nombre: "",
    });

    // Formulario de edición
    const [editFormData, setEditFormData] = useState({
        nombre: "",
        activo: true,
        newPassword: "",
        confirmNewPassword: "",
    });

    // Cargar usuarios al abrir el modal
    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.message || "Error al cargar administradores");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validaciones
        if (!formData.email || !formData.password) {
            setError("Email y contraseña son requeridos");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        try {
            setLoading(true);
            await userService.createUser({
                email: formData.email,
                password: formData.password,
                nombre: formData.nombre || formData.email.split("@")[0],
            });

            setSuccess("Administrador creado exitosamente");
            setFormData({ email: "", password: "", confirmPassword: "", nombre: "" });
            setShowAddForm(false);
            await loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Error al crear administrador");
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditUser(user);
        setEditFormData({
            nombre: user.nombre || "",
            activo: user.activo !== false,
            newPassword: "",
            confirmNewPassword: "",
        });
        setError(null);
        setSuccess(null);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validar contraseña si se está cambiando
        if (editFormData.newPassword) {
            if (editFormData.newPassword !== editFormData.confirmNewPassword) {
                setError("Las contraseñas no coinciden");
                return;
            }
            if (editFormData.newPassword.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres");
                return;
            }
        }

        try {
            setLoading(true);

            // Actualizar estado activo si cambió
            if (editFormData.activo !== editUser.activo) {
                await userService.updateUserStatus(editUser.id_admin, editFormData.activo);
            }

            // Actualizar contraseña si se proporcionó
            if (editFormData.newPassword) {
                await userService.updatePassword(editUser.id_admin, editFormData.newPassword);
            }

            setSuccess("Administrador actualizado exitosamente");
            setEditUser(null);
            setEditFormData({ nombre: "", activo: true, newPassword: "", confirmNewPassword: "" });
            await loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Error al actualizar administrador");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            setLoading(true);
            setError(null);
            await userService.deleteUser(userId);
            setSuccess("Administrador eliminado exitosamente");
            setDeleteConfirm(null);
            await loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Error al eliminar administrador");
        } finally {
            setLoading(false);
        }
    };

    const isCurrentUser = (user) => {
        return currentUser && user.email === currentUser.email;
    };

    if (!isOpen) return null;

    return (
        <div className="user-management-overlay">
            <div className="user-management-modal">
                {/* Header */}
                <div className="modal-header">
                    <h2>
                        <span className="material-icons">admin_panel_settings</span> Gestión de Administradores
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="alert alert-error">
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError(null)}>✕</button>
                    </div>
                )}
                {success && (
                    <div className="alert alert-success">
                        <span>✅ {success}</span>
                        <button onClick={() => setSuccess(null)}>✕</button>
                    </div>
                )}

                {/* Contenido */}
                <div className="modal-content">
                    {/* Botón Agregar */}
                    {!showAddForm && (
                        <button
                            className="btn btn-primary add-user-btn"
                            onClick={() => setShowAddForm(true)}
                            disabled={loading}
                        >
                            <span className="material-icons">person_add</span> Agregar Administrador
                        </button>
                    )}

                    {/* Formulario Agregar */}
                    {showAddForm && (
                        <div className="add-user-form">
                            <h3>Nuevo Administrador</h3>
                            <form onSubmit={handleCreateUser}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="admin@ucn.cl"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Nombre (opcional)</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            placeholder="Nombre del administrador"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Contraseña *</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Mínimo 6 caracteres"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Confirmar Contraseña *</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Repite la contraseña"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setFormData({ email: "", password: "", confirmPassword: "", nombre: "" });
                                        }}
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? "Creando..." : "Crear"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Lista de Usuarios */}
                    <div className="users-list">
                        <h3>Administradores Actuales</h3>
                        {loading && <div className="loading">Cargando...</div>}
                        {!loading && users.length === 0 && <p>No hay administradores</p>}
                        {!loading && users.length > 0 && (
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Nombre</th>
                                        <th>Fecha Creación</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id_admin}>
                                            <td>
                                                {user.email}
                                                {isCurrentUser(user) && <span className="badge-current"> (Tú)</span>}
                                            </td>
                                            <td>{user.nombre || "-"}</td>
                                            <td>{new Date(user.fecha_creacion).toLocaleDateString()}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleEditUser(user)}
                                                        disabled={loading}
                                                    >
                                                        <span className="material-icons">edit</span> Editar
                                                    </button>
                                                    {!isCurrentUser(user) && (
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => setDeleteConfirm(user)}
                                                            disabled={loading}
                                                        >
                                                            <span className="material-icons">delete</span> Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Modal de Edición */}
                {editUser && (
                    <div className="confirm-overlay">
                        <div className="confirm-dialog edit-dialog">
                            <h3>
                                <span className="material-icons">edit</span> Editar Administrador
                            </h3>
                            <form onSubmit={handleUpdateUser}>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="text" value={editUser.email} disabled style={{ opacity: 0.6 }} />
                                    <small style={{ color: "#666", fontSize: "11px" }}>
                                        El email no se puede modificar
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={editFormData.nombre}
                                        onChange={handleEditInputChange}
                                        placeholder="Nombre del administrador"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Estado</label>
                                    <select
                                        name="activo"
                                        value={editFormData.activo}
                                        onChange={(e) =>
                                            setEditFormData((prev) => ({ ...prev, activo: e.target.value === "true" }))
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "10px 12px",
                                            border: "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "14px",
                                        }}
                                    >
                                        <option value="true">Activo</option>
                                        <option value="false">Desactivado</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Nueva Contraseña (opcional)</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={editFormData.newPassword}
                                        onChange={handleEditInputChange}
                                        placeholder="Dejar vacío para no cambiar"
                                    />
                                </div>

                                {editFormData.newPassword && (
                                    <div className="form-group">
                                        <label>Confirmar Nueva Contraseña *</label>
                                        <input
                                            type="password"
                                            name="confirmNewPassword"
                                            value={editFormData.confirmNewPassword}
                                            onChange={handleEditInputChange}
                                            placeholder="Repite la nueva contraseña"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="confirm-actions">
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => {
                                            setEditUser(null);
                                            setEditFormData({
                                                nombre: "",
                                                activo: true,
                                                newPassword: "",
                                                confirmNewPassword: "",
                                            });
                                        }}
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? "Guardando..." : "Guardar Cambios"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Confirmación de Eliminación */}
                {deleteConfirm && (
                    <div className="confirm-overlay">
                        <div className="confirm-dialog">
                            <h3>
                                <span className="material-icons">warning</span> Confirmar Eliminación
                            </h3>
                            <p>
                                ¿Estás seguro de que deseas eliminar al administrador{" "}
                                <strong>{deleteConfirm.email}</strong>?
                            </p>
                            <p className="warning-text">Esta acción no se puede deshacer.</p>
                            <div className="confirm-actions">
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setDeleteConfirm(null)}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteUser(deleteConfirm.id_admin)}
                                    disabled={loading}
                                >
                                    {loading ? "Eliminando..." : "Eliminar"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn btn-danger" onClick={onClose} disabled={loading}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
