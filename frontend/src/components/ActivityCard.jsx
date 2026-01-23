/**
 * Card de atividade - componente que exibe uma atividade na lista
 * Super elegante com animações e efeito glassmorphism
 */

import { useNavigate } from 'react-router-dom';
import { updateActivity, deleteActivity, getImageUrl } from '../services/api';

// Mapeia status pra cores elegantes
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

function ActivityCard({ activity, onUpdate, onDelete }) {
    const navigate = useNavigate();

    // Navega pra página de detalhes quando clica no card
    const handleClick = () => {
        navigate(`/activity/${activity.id}`);
    };

    // Atualiza o status da atividade
    const handleStatusChange = async (e) => {
        e.stopPropagation(); // Não ativa o click do card
        const newStatus = e.target.value;

        try {
            await updateActivity(activity.id, { status: newStatus });
            onUpdate(); // Atualiza a lista
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar o status da atividade');
        }
    };

    // Deleta a atividade
    const handleDelete = async (e) => {
        e.stopPropagation(); // Não ativa o click do card

        if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
            try {
                await deleteActivity(activity.id);
                onDelete(); // Atualiza a lista
            } catch (error) {
                console.error('Erro ao deletar:', error);
                alert('Erro ao deletar a atividade');
            }
        }
    };

    // Pega a URL da imagem se existir
    const imageUrl = activity.image_path ? getImageUrl(activity.image_path) : null;

    return (
        <div
            onClick={handleClick}
            className="glass-card overflow-hidden hover:bg-white/15 transition-all duration-300 cursor-pointer 
                 group animate-slide-up hover:scale-102 flex flex-col h-full"
        >
            {/* Imagem de Capa (Preview) */}
            {imageUrl && (
                <div className="h-32 w-full relative overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={activity.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            e.target.style.display = 'none'; // Esconde se der erro
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
            )}

            <div className="p-4 flex-1 flex flex-col">
                {/* Badge de status no topo */}
                <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium 
                            bg-gradient-to-r ${statusColors[activity.status]} text-white shadow-lg`}>
                        <span>{statusIcons[activity.status]}</span>
                        {activity.status}
                    </span>

                    {/* Indicador de anexo (mantemos caso a imagem falhe ou para indicar anexo genericamente, mas podemos remover se a imagem já for o preview) */}
                    {/* Vamos manter apenas se NÃO tiver mostrando a imagem, ou podemos deixar como um ícone discreto de clipe */}
                    {activity.image_path && !imageUrl && (
                        <span className="text-xl" title="Tem imagem anexada">
                            📎
                        </span>
                    )}
                </div>

                {/* Título */}
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-primary-300 transition-colors">
                    {activity.title}
                </h3>

                {/* Descrição truncada */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-1">
                    {activity.description}
                </p>

                {/* Ações - aparecem no hover */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                    {/* Dropdown de status */}
                    <select
                        value={activity.status}
                        onChange={handleStatusChange}
                        onClick={(e) => e.stopPropagation()}
                        className="input-glass text-sm py-1.5 px-2 flex-1 text-xs"
                    >
                        <option value="pendente">⏳ Pendente</option>
                        <option value="em andamento">🚀 Em Andamento</option>
                        <option value="concluído">✅ Concluído</option>
                    </select>

                    {/* Botão de deletar */}
                    <button
                        onClick={handleDelete}
                        className="px-3 py-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg transition-all 
                        text-white text-sm hover:scale-105 active:scale-95"
                        title="Excluir atividade"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ActivityCard;
