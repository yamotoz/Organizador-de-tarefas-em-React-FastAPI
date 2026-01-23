/**
 * Componente principal da aplicação
 * Gerencia o roteamento e a estrutura geral
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ActivityList from './pages/ActivityList';
import ActivityDetails from './pages/ActivityDetails';

function App() {
    return (
        <Router>
            <div className="min-h-screen relative">
                {/* Vídeo de fundo */}
                <video
                    className="video-background"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source src="/neve_background.mp4" type="video/mp4" />
                </video>

                {/* Header minimalista */}
                <header className="glass-card mx-auto mt-6 mb-8 max-w-7xl animate-slide-down">
                    <div className="px-6 py-4 text-center">
                        <h1 className="text-3xl font-bold text-white">
                            Organização de Tarefas
                        </h1>
                        <p className="text-gray-300 mt-1 text-sm">
                            Organize de forma fácil e rápida suas tarefas.
                        </p>
                    </div>
                </header>

                {/* Rotas da aplicação */}
                <main className="max-w-7xl mx-auto px-4 pb-12">
                    <Routes>
                        <Route path="/" element={<ActivityList />} />
                        <Route path="/activity/:id" element={<ActivityDetails />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
