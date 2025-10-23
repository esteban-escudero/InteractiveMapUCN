// src/services/api.js
const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);
    return response.json();
  },

  // ✅ AGREGAR ESTE MÉTODO PUT
  async put(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);
    return response.json();
  },

  // Opcional: agregar delete también
  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${await response.text()}`);
    return response.json();
  }
};