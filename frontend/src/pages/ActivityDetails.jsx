/**
 * Página de detalhes da atividade
 * Exibe todas as informações incluindo a imagem
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivity, deleteActivity, getImageUrl } from '../services/api';
import ActivityForm from '../components/ActivityForm';

// Mapeia status pra cores
const statusColors = {
    'pendente': 'from-gray-500 to-gray-600',
    'em andamento': 'from-accent-500 to-accent-600',
    'concluído': 'from-green-500 to-green-600',
};

const statusIcons = {
    'pendente': '⏳',
    'em andamento': '🚀',
    'concluído': '✅',
};

function ActivityDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);

    // Carrega a atividade quando o componente monta
    useEffect(() => {
        loadActivity();
    }, [id]);

    const loadActivity = async () => {
        try {
            setLoading(true);
            const data = await getActivity(id);
            setActivity(data);
        } catch (error) {
            console.error('Erro ao carregar atividade:', error);
            alert('Atividade não encontrada');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
            try {
                await deleteActivity(id);
                navigate('/');
            } catch (error) {
                console.error('Erro ao deletar:', error);
                alert('Erro ao deletar a atividade');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="glass-card p-8 animate-pulse-subtle">
                    <p className="text-gray-300 text-lg">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!activity) {
        return null;
    }

    const imageUrl = getImageUrl(activity.image_path);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Botão voltar */}
            <button
                onClick={() => navigate('/')}
                className="btn-secondary mb-6 flex items-center gap-2"
            >
                <span>←</span>
                Voltar
            </button>

            {/* Card principal com os detalhes */}
            <div className="glass-card p-8">
                {/* Header com título e badge de status */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-3">
                            {activity.title}
                        </h1>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full 
                            bg-gradient-to-r ${statusColors[activity.status]} text-white shadow-lg`}>
                            <span className="text-lg">{statusIcons[activity.status]}</span>
                            <span className="font-medium">{activity.status}</span>
                        </div>
                    </div>
                </div>

                {/* Imagem se tiver */}
                {imageUrl && (
                    <div className="mb-6">
                        <img
                            src={imageUrl}
                            alt={activity.title}
                            className="w-full h-80 object-cover rounded-lg border border-white/20 shadow-xl"
                        />
                    </div>
                )}

                {/* Descrição */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-300 mb-3">
                        📝 Descrição
                    </h2>
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {activity.description}
                    </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                        <p className="text-gray-400 text-sm">Criado em</p>
                        <p className="text-white font-medium">
                            {new Date(activity.created_at).toLocaleString('pt-BR')}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Última atualização</p>
                        <p className="text-white font-medium">
                            {new Date(activity.updated_at).toLocaleString('pt-BR')}
                        </p>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button
                        onClick={() => setShowEditForm(true)}
                        className="btn-primary flex-1"
                    >
                        ✏️ Editar
                    </button>
                    <button
                        onClick={handleDelete}
                        className="btn-danger flex-1"
                    >
                        🗑️ Excluir
                    </button>
                </div>
            </div>

            {/* Modal de edição */}
            {showEditForm && (
                <ActivityForm
                    activity={activity}
                    onClose={() => setShowEditForm(false)}
                    onSave={() => {
                        loadActivity();
                        setShowEditForm(false);
                    }}
                />
            )}
        </div>
    );
}

export default ActivityDetails;
