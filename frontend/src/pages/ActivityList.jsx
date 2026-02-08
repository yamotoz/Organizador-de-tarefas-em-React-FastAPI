/**
 * Página principal - lista de atividades em formato kanban
 * Visual super elegante com as três colunas de status
 */

import { useState, useEffect } from 'react';
import { getAllActivities, reorderActivities } from '../services/api';
import StatusColumn from '../components/StatusColumn';
import ActivityForm from '../components/ActivityForm';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import ActivityCard from '../components/ActivityCard';

function ActivityList() {
    const [activities, setActivities] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Carrega as atividades quando o componente monta
    useEffect(() => {
        loadActivities();
    }, []);

    // Função pra carregar todas as atividades
    const loadActivities = async () => {
        try {
            setLoading(true);
            const data = await getAllActivities();
            setActivities(data);
        } catch (error) {
            console.error('Erro ao carregar atividades:', error);
            alert('Erro ao carregar atividades. Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const findContainer = (id) => {
        if (['pendente', 'em andamento', 'concluído'].includes(id)) {
            return id;
        }
        const activity = activities.find(a => a.id === id);
        return activity ? activity.status : null;
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setActivities((prev) => {
            const activeIndex = prev.findIndex((a) => a.id === activeId);
            const overIndex = prev.findIndex((a) => a.id === overId);

            let newIndex;
            if (overId in activityByStatus) {
                newIndex = prev.length;
            } else {
                newIndex = overIndex >= 0 ? overIndex : prev.length;
            }

            const updatedActivities = [...prev];
            updatedActivities[activeIndex] = {
                ...updatedActivities[activeIndex],
                status: overContainer
            };

            return arrayMove(updatedActivities, activeIndex, newIndex);
        });
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) {
            return;
        }

        const activeId = active.id;
        const overId = over.id;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (activeContainer && overContainer) {
            const activeIndex = activities.findIndex((a) => a.id === activeId);
            const overIndex = activities.findIndex((a) => a.id === overId);

            if (activeIndex !== overIndex || activeContainer !== overContainer) {
                const updatedActivities = arrayMove(activities, activeIndex, overIndex).map(act => {
                    if (act.id === activeId) {
                        return { ...act, status: overContainer };
                    }
                    return act;
                });

                setActivities(updatedActivities);

                try {
                    await reorderActivities(updatedActivities);
                } catch (error) {
                    console.error('Erro ao salvar nova ordem:', error);
                    loadActivities();
                }
            }
        }
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    // Agrupa atividades por status
    const activityByStatus = {
        'pendente': activities.filter(a => a.status === 'pendente'),
        'em andamento': activities.filter(a => a.status === 'em andamento'),
        'concluído': activities.filter(a => a.status === 'concluído'),
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="glass-card p-8 animate-pulse-subtle">
                    <p className="text-gray-300 text-lg">Carregando atividades...</p>
                </div>
            </div>
        );
    }

    const activeActivity = activeId ? activities.find(a => a.id === activeId) : null;

    return (
        <div className="animate-fade-in">
            {/* Botão de adicionar atividade */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Quadro de Tarefas
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Total de {activities.length} atividade{activities.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <span className="text-xl">+</span>
                    Nova Atividade
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                {/* Grid de colunas - estilo kanban */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatusColumn
                        status="pendente"
                        activities={activityByStatus['pendente']}
                        onUpdate={loadActivities}
                        onDelete={loadActivities}
                    />
                    <StatusColumn
                        status="em andamento"
                        activities={activityByStatus['em andamento']}
                        onUpdate={loadActivities}
                        onDelete={loadActivities}
                    />
                    <StatusColumn
                        status="concluído"
                        activities={activityByStatus['concluído']}
                        onUpdate={loadActivities}
                        onDelete={loadActivities}
                    />
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        <ActivityCard
                            activity={activeActivity}
                            isDragging
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Modal de formulário */}
            {showForm && (
                <ActivityForm
                    onClose={() => setShowForm(false)}
                    onSave={loadActivities}
                />
            )}
        </div>
    );
}

export default ActivityList;
