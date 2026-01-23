/**
 * Testes pro componente ActivityForm
 * Testando validação e submissão do formulário
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActivityForm from '../ActivityForm';

// Mock da API
vi.mock('../../services/api', () => ({
    createActivity: vi.fn(() => Promise.resolve({ id: '123' })),
    updateActivity: vi.fn(() => Promise.resolve({ id: '123' })),
    uploadActivityImage: vi.fn(() => Promise.resolve()),
}));

describe('ActivityForm', () => {
    const mockOnClose = vi.fn();
    const mockOnSave = vi.fn();

    it('renderiza o formulário de criação vazio', () => {
        render(
            <ActivityForm
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        // Verifica o título do modal
        expect(screen.getByText('Nova Atividade')).toBeInTheDocument();

        // Verifica os campos do form
        expect(screen.getByPlaceholderText(/Digite o título da atividade/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Descreva os detalhes/)).toBeInTheDocument();
    });

    it('preenche o formulário com dados da atividade ao editar', () => {
        const activity = {
            id: '123',
            title: 'Atividade Teste',
            description: 'Descrição teste',
            status: 'em andamento',
        };

        render(
            <ActivityForm
                activity={activity}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        // Verifica se o título do modal mudou
        expect(screen.getByText('Editar Atividade')).toBeInTheDocument();

        // Verifica se os campos foram preenchidos
        expect(screen.getByDisplayValue('Atividade Teste')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Descrição teste')).toBeInTheDocument();
    });

    it('valida campos obrigatórios', async () => {
        render(
            <ActivityForm
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        // Tenta submeter sem preencher
        const submitButton = screen.getByText('Criar');
        fireEvent.click(submitButton);

        // O form HTML5 deve impedir submit
        await waitFor(() => {
            expect(mockOnSave).not.toHaveBeenCalled();
        });
    });

    it('fecha o modal ao clicar em cancelar', () => {
        render(
            <ActivityForm
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        const cancelButton = screen.getByText('Cancelar');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });
});
