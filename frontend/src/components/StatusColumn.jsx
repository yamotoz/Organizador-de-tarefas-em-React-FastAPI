/**
 * Coluna de status - componente que agrupa atividades por status
 * Visual de kanban board bem clean
 */

import ActivityCard from './ActivityCard';
import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Configuração visual das colunas com imagens e descrições
const columnConfig = {
    'pendente': {
        title: 'Pendente',
        image: '/pendente.png',
        description: 'Tarefas que aguardam início',
        gradient: 'from-slate-700 to-slate-800'
    },
    'em andamento': {
        title: 'Em Andamento',
        image: '/em_andamento.png',
        description: 'Atividades em execução',
        gradient: 'from-slate-800 to-slate-900'
    },
    'concluído': {
        title: 'Concluído',
        image: '/Finalizado.png',
        description: 'Tarefas finalizadas',
        gradient: 'from-zinc-800 to-zinc-900'
    }
};

function StatusColumn({ status, activities, onUpdate, onDelete }) {
    const config = columnConfig[status];
    const { setNodeRef } = useDroppable({
        id: status,
    });

    return (
        <div className="flex flex-col h-full" ref={setNodeRef}>
            {/* Header da coluna - Estilo Card com Imagem */}
            <div className={`glass-card mb-4 bg-gradient-to-r ${config.gradient} overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
                <div className="p-4 flex items-center gap-4">
                    {/* Imagem do status */}
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10 shadow-inner">
                        <img
                            src={config.image}
                            alt={config.title}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                    </div>

                    {/* Texto e contagem */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-lg font-bold text-white capitalize truncate">
                                {config.title}
                            </h2>
                            <span className="bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-semibold border border-white/5">
                                {activities.length}
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs font-medium truncate">
                            {config.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista de atividades com scroll */}
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 min-h-[200px]" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                <SortableContext
                    items={activities.map(a => a.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {activities.length === 0 ? (
                        // Estado vazio elegante
                        <div className="glass-card p-8 text-center">
                            <p className="text-gray-400 text-sm">
                                Nenhuma atividade {status} ainda
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                                As atividades aparecerão aqui ✨
                            </p>
                        </div>
                    ) : (
                        // Cards das atividades
                        activities.map((activity) => (
                            <ActivityCard
                                key={activity.id}
                                activity={activity}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
}

export default StatusColumn;
