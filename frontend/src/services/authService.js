// src/services/authService.js
const API_BASE_URL = "http://localhost:3001/api";

class AuthService {
  /**
   * Login
   */
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al iniciar sesión");
    }

    // Guardar tokens
    this.setTokens(data.data.accessToken, data.data.refreshToken);

    // Guardar info del admin
    localStorage.setItem("admin", JSON.stringify(data.data.admin));

    return data.data;
  }

  /**
   * Logout
   */
  async logout() {
    const refreshToken = this.getRefreshToken();

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error("Error al hacer logout:", error);
    } finally {
      // Limpiar storage siempre
      this.clearTokens();
    }
  }

  /**
   * Renovar access token
   */
  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      this.clearTokens();
      throw new Error(data.message || "Error al renovar token");
    }

    // Actualizar access token
    this.setAccessToken(data.data.accessToken);

    return data.data.accessToken;
  }

  /**
   * Obtener información del admin actual
   */
  async getCurrentAdmin() {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/auth/me`);
    return response.data.admin;
  }

  /**
   * Fetch con autenticación automática
   */
  async fetchWithAuth(url, options = {}) {
    let accessToken = this.getAccessToken();

    // Primera petición
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Si el token expiró, renovarlo e intentar de nuevo
    if (response.status === 401) {
      const data = await response.json();

      if (data.code === "TOKEN_EXPIRED") {
        try {
          // Renovar token
          accessToken = await this.refreshAccessToken();

          // Reintentar petición original
          response = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } catch (error) {
          // Si falla la renovación, limpiar y redirigir al login
          this.clearTokens();
          window.location.href = "/login";
          throw error;
        }
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en la petición");
    }

    return data;
  }

  /**
   * Guardar tokens
   */
  setTokens(accessToken, refreshToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  /**
   * Actualizar solo access token
   */
  setAccessToken(accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }

  /**
   * Obtener access token
   */
  getAccessToken() {
    return localStorage.getItem("accessToken");
  }

  /**
   * Obtener refresh token
   */
  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  /**
   * Obtener admin del storage
   */
  getStoredAdmin() {
    const adminStr = localStorage.getItem("admin");
    return adminStr ? JSON.parse(adminStr) : null;
  }

  /**
   * Limpiar tokens
   */
  clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("admin");
  }
}

export default new AuthService();
