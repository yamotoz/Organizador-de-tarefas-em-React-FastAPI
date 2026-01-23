"""
Testes unitários pro backend
Testando todos os endpoints e funcionalidades principais
"""

import pytest
from fastapi.testclient import TestClient
from main import app
import database as db
import os
import json

# Cliente de teste do FastAPI
client = TestClient(app)

# Arquivo de teste temporário
TEST_DATA_FILE = "activities_test.json"


@pytest.fixture(autouse=True)
def setup_and_teardown():
    """
    Fixture que roda antes e depois de cada teste
    Limpa os dados antes e depois pra não ter conflito entre testes
    """
    # Setup: aponta pro arquivo de teste
    db.DATA_FILE = TEST_DATA_FILE
    
    # Limpa qualquer dado antigo
    if os.path.exists(TEST_DATA_FILE):
        os.remove(TEST_DATA_FILE)
    
    yield  # Aqui roda o teste
    
    # Teardown: limpa depois
    if os.path.exists(TEST_DATA_FILE):
        os.remove(TEST_DATA_FILE)


def test_read_root():
    """Testa se a raiz da API responde"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_create_activity():
    """Testa a criação de uma atividade nova"""
    activity_data = {
        "title": "Teste de atividade",
        "description": "Descrição do teste",
        "status": "pendente"
    }
    
    response = client.post("/api/activities", json=activity_data)
    assert response.status_code == 201
    
    data = response.json()
    assert data["title"] == activity_data["title"]
    assert data["description"] == activity_data["description"]
    assert data["status"] == activity_data["status"]
    assert "id" in data
    assert "created_at" in data


def test_list_activities():
    """Testa a listagem de atividades"""
    # Cria algumas atividades primeiro
    client.post("/api/activities", json={
        "title": "Atividade 1",
        "description": "Desc 1",
        "status": "pendente"
    })
    client.post("/api/activities", json={
        "title": "Atividade 2",
        "description": "Desc 2",
        "status": "em andamento"
    })
    
    # Lista todas
    response = client.get("/api/activities")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Atividade 1"
    assert data[1]["title"] == "Atividade 2"


def test_get_activity_by_id():
    """Testa buscar uma atividade específica"""
    # Cria uma atividade
    create_response = client.post("/api/activities", json={
        "title": "Atividade Teste",
        "description": "Teste",
        "status": "pendente"
    })
    activity_id = create_response.json()["id"]
    
    # Busca ela
    response = client.get(f"/api/activities/{activity_id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == activity_id
    assert data["title"] == "Atividade Teste"


def test_get_nonexistent_activity():
    """Testa buscar uma atividade que não existe"""
    response = client.get("/api/activities/id-inexistente")
    assert response.status_code == 404


def test_update_activity():
    """Testa atualização de atividade"""
    # Cria uma atividade
    create_response = client.post("/api/activities", json={
        "title": "Original",
        "description": "Desc original",
        "status": "pendente"
    })
    activity_id = create_response.json()["id"]
    
    # Atualiza ela
    update_data = {
        "title": "Título Atualizado",
        "status": "concluído"
    }
    response = client.put(f"/api/activities/{activity_id}", json=update_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["title"] == "Título Atualizado"
    assert data["status"] == "concluído"
    assert data["description"] == "Desc original"  # Não mudou


def test_delete_activity():
    """Testa deleção de atividade"""
    # Cria uma atividade
    create_response = client.post("/api/activities", json={
        "title": "Pra deletar",
        "description": "Teste",
        "status": "pendente"
    })
    activity_id = create_response.json()["id"]
    
    # Deleta
    response = client.delete(f"/api/activities/{activity_id}")
    assert response.status_code == 200
    
    # Verifica que não existe mais
    get_response = client.get(f"/api/activities/{activity_id}")
    assert get_response.status_code == 404


def test_upload_image():
    """Testa upload de imagem"""
    # Cria uma atividade
    create_response = client.post("/api/activities", json={
        "title": "Com imagem",
        "description": "Teste",
        "status": "pendente"
    })
    activity_id = create_response.json()["id"]
    
    # Cria um arquivo de imagem fake
    fake_image = b"fake image content"
    files = {"file": ("test.jpg", fake_image, "image/jpeg")}
    
    # Faz upload
    response = client.post(f"/api/activities/{activity_id}/upload-image", files=files)
    assert response.status_code == 200
    
    data = response.json()
    assert "image_path" in data
    
    # Verifica que a atividade foi atualizada
    activity = client.get(f"/api/activities/{activity_id}").json()
    assert activity["image_path"] is not None


def test_invalid_status():
    """Testa que status inválido é rejeitado"""
    response = client.post("/api/activities", json={
        "title": "Teste",
        "description": "Desc",
        "status": "status-invalido"
    })
    assert response.status_code == 422  # Validation error
