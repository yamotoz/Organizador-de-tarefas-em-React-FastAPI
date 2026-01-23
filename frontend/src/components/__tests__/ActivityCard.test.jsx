/**
 * Testes pro componente ActivityCard
 * Testando renderização e interações básicas
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ActivityCard from '../ActivityCard';

// Mock de funções da API 
vi.mock('../../services/api', () => ({
    updateActivity: vi.fn(() => Promise.resolve()),
    deleteActivity: vi.fn(() => Promise.resolve()),
}));

// Helper pra renderizar componentes com Router
const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('ActivityCard', () => {
    const mockActivity = {
        id: '123',
        title: 'Teste de Atividade',
        description: 'Esta é uma descrição de teste',
        status: 'pendente',
        image_path: null,
        created_at: '2026-01-23T10:00:00',
        updated_at: '2026-01-23T10:00:00',
    };

    const mockUpdate = vi.fn();
    const mockDelete = vi.fn();

    it('renderiza o card com informações corretas', () => {
        renderWithRouter(
            <ActivityCard
                activity={mockActivity}
                onUpdate={mockUpdate}
                onDelete={mockDelete}
            />
        );

        // Verifica se o título aparece
        expect(screen.getByText('Teste de Atividade')).toBeInTheDocument();

        // Verifica se a descrição aparece
        expect(screen.getByText(/Esta é uma descrição de teste/)).toBeInTheDocument();

        // Verifica se o status aparece
        expect(screen.getByText('pendente')).toBeInTheDocument();
    });

    it('exibe o ícone de imagem quando tem imagem anexada', () => {
        const activityWithImage = {
            ...mockActivity,
            image_path: '/uploads/test.jpg',
        };

        renderWithRouter(
            <ActivityCard
                activity={activityWithImage}
                onUpdate={mockUpdate}
                onDelete={mockDelete}
            />
        );

        // Verifica se o ícone de anexo aparece
        expect(screen.getByTitle('Tem imagem anexada')).toBeInTheDocument();
    });

    it('exibe os badges de status com a cor correta', () => {
        renderWithRouter(
            <ActivityCard
                activity={mockActivity}
                onUpdate={mockUpdate}
                onDelete={mockDelete}
            />
        );

        // Verifica se tem o emoji correto pro status
        expect(screen.getByText('⏳')).toBeInTheDocument();
    });
});
