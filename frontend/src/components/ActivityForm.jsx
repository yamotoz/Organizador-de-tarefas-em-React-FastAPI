/**
 * Formulário pra criar/editar atividades
 * Modal elegante com animações suaves
 */

import { useState, useEffect } from 'react';
import { createActivity, updateActivity, uploadActivityImage } from '../services/api';

function ActivityForm({ activity, onClose, onSave }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pendente',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Se estiver editando, preenche o form com os dados existentes
    useEffect(() => {
        if (activity) {
            setFormData({
                title: activity.title,
                description: activity.description,
                status: activity.status,
            });
        }
    }, [activity]);

    // Atualiza os campos do form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Lida com seleção de imagem
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Cria preview da imagem
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Submete o formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let savedActivity;

            if (activity) {
                // Editando atividade existente
                savedActivity = await updateActivity(activity.id, formData);
            } else {
                // Criando nova atividade
                savedActivity = await createActivity(formData);
            }

            // Se tem imagem, faz upload dela
            if (imageFile && savedActivity) {
                await uploadActivityImage(savedActivity.id, imageFile);
            }

            onSave(); // Atualiza a lista
            onClose(); // Fecha o modal
        } catch (error) {
            console.error('Erro ao salvar:', error);
            const errorDetail = error.response?.data?.detail
                ? (typeof error.response.data.detail === 'string'
                    ? error.response.data.detail
                    : JSON.stringify(error.response.data.detail))
                : error.message || 'Erro desconhecido';
            alert(`Erro ao salvar a atividade: ${errorDetail}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Backdrop do modal
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={onClose}
        >
            {/* Modal */}
            <div
                className="glass-card p-6 max-w-lg w-full animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {activity ? 'Editar Atividade' : 'Nova Atividade'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Título
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="input-glass w-full"
                            placeholder="Digite o título da atividade..."
                        />
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Descrição
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="input-glass w-full resize-none"
                            placeholder="Descreva os detalhes da atividade..."
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="input-glass w-full"
                        >
                            <option value="pendente">⏳ Pendente</option>
                            <option value="em andamento">🚀 Em Andamento</option>
                            <option value="concluído">✅ Concluído</option>
                        </select>
                    </div>

                    {/* Upload de imagem */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Imagem (opcional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                        />
                        <label
                            htmlFor="image-upload"
                            className="btn-secondary cursor-pointer inline-flex items-center gap-2"
                        >
                            📎 Escolher Imagem
                        </label>

                        {/* Preview da imagem */}
                        {imagePreview && (
                            <div className="mt-3">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-32 object-cover rounded-lg border border-white/20"
                                />
                            </div>
                        )}
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary flex-1"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : (activity ? 'Salvar' : 'Criar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ActivityForm;
