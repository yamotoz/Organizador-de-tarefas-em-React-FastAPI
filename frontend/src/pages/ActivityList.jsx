/**
 * Página principal - lista de atividades em formato kanban
 * Visual super elegante com as três colunas de status
 */

import { useState, useEffect } from 'react';
import { getAllActivities } from '../services/api';
import StatusColumn from '../components/StatusColumn';
import ActivityForm from '../components/ActivityForm';

function ActivityList() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

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
