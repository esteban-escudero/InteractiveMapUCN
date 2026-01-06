// src/services/api.js
import authService from "./authService";

import { API_CONFIG } from "../config/app";

const API_BASE_URL = API_CONFIG.baseURL;

export const api = {
  async get(endpoint, useAuth = true) {
    if (useAuth) {
      return authService.fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
      });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    return response.json();
  },

  async post(endpoint, data, useAuth = true) {
    if (useAuth) {
      return authService.fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    return response.json();
  },

  async put(endpoint, data, useAuth = true) {
    if (useAuth) {
      return authService.fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    return response.json();
  },

  async delete(endpoint, useAuth = true) {
    if (useAuth) {
      return authService.fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
      });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
    });
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    return response.json();
  },
};
