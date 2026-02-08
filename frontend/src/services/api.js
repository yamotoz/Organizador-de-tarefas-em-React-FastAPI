/**
 * Serviço de API pra se comunicar com o backend
 * Centraliza todas as chamadas HTTP aqui pra ficar organizado
 */

import axios from 'axios';

// URL base da API - em produção você mudaria isso
const API_URL = 'http://127.0.0.1:8000/api';

// Cria uma instância do axios com configurações padrão
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * API de Atividades
 */

// Busca todas as atividades
export const getAllActivities = async () => {
    const response = await api.get('/activities');
    return response.data;
};

// Busca uma atividade específica
export const getActivity = async (id) => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
};

// Cria uma atividade nova
export const createActivity = async (activityData) => {
    const response = await api.post('/activities', activityData);
    return response.data;
};

// Atualiza uma atividade existente
export const updateActivity = async (id, activityData) => {
    const response = await api.put(`/activities/${id}`, activityData);
    return response.data;
};

// Deleta uma atividade
export const deleteActivity = async (id) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
};

// Reordena as atividades em massa
export const reorderActivities = async (activities) => {
    const response = await api.put('/activities/reorder', activities);
    return response.data;
};

// Faz upload de imagem pra uma atividade
export const uploadActivityImage = async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/activities/${id}/upload-image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

// construir a URL completa da imagem
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Remove a barra inicial se existir
    const path = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `http://127.0.0.1:8000/${path}`;
};

export default api;
