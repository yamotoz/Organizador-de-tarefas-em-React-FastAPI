# 🚀 Organizador de Tarefas

Sistema moderno e elegante para gestão de atividades (Kanban), com backend em Python e frontend em React.

## 🛠️ Como Rodar o Projeto

### 1. Backend (Python)
Abra um terminal na pasta `backend`:
```bash
# Instalar dependências
pip install -r requirements.txt

# Iniciar o servidor
uvicorn main:app --reload
```
A API estará rodando em: `http://127.0.0.1:8000`

### 2. Frontend (React)
Abra um terminal na pasta `frontend`:
```bash
# Instalar dependências
npm install

# Iniciar o app
npm run dev
```
O app estará disponível no seu navegador (geralmente em `http://localhost:5173`).

---

## 📋 Funcionalidades Principais
- ✅ **Gestão Visual**: Quadro Kanban organizado por status.
- 📸 **Imagens**: Upload de fotos para detalhar cada tarefa.
- ✏️ **Edição**: Altere títulos, descrições e status em tempo real.
- 📱 **Responsivo**: Interface que se adapta a diferentes telas.

## 📁 Organização do Código
- **`/backend`**: API FastAPI com persistência em JSON (`activities.json`).
- **`/frontend`**: Interface React com Tailwind CSS e UI minimalista.
- **`/frontend/public`**: Ícones, vídeos de fundo e assets visuais.

---
Desenvolvido com foco em estética e usabilidade. ✨
