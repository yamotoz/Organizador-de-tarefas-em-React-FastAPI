"""
Camada de persistência de dados
Aqui a gente lida com o arquivo JSON e gerencia as imagens
"""

import json
import os
import shutil
from typing import List, Optional
from datetime import datetime
from models import Activity, ActivityCreate, ActivityUpdate
import uuid

# Caminhos dos arquivos - tudo organizadinho
DATA_FILE = "activities.json"
UPLOAD_DIR = "uploads"

# Cria a pasta de uploads se não existir
os.makedirs(UPLOAD_DIR, exist_ok=True)


def load_activities() -> List[Activity]:
    """
    Carrega as atividades do arquivo JSON
    Se o arquivo não existir, retorna uma lista vazia tranquilamente
    """
    if not os.path.exists(DATA_FILE):
        return []
    
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
            # Converte cada dict em um objeto Activity
            return [Activity(**item) for item in data]
    except (json.JSONDecodeError, Exception):
        # Se der ruim, melhor retornar vazio do que quebrar tudo
        return []


def save_activities(activities: List[Activity]) -> None:
    """
    Salva as atividades no arquivo JSON
    A gente usa model_dump() pra converter os objetos Pydantic em dicts
    """
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        data = [activity.model_dump() for activity in activities]
        json.dump(data, file, indent=2, ensure_ascii=False, default=str)


def get_all_activities() -> List[Activity]:
    """Pega todas as atividades - simples assim"""
    return load_activities()


def get_activity_by_id(activity_id: str) -> Optional[Activity]:
    """Busca uma atividade específica pelo ID"""
    activities = load_activities()
    for activity in activities:
        if activity.id == activity_id:
            return activity
    return None


def create_activity(activity_data: ActivityCreate) -> Activity:
    """
    Cria uma atividade nova
    Gera um ID único e marca os timestamps
    """
    activities = load_activities()
    
    # Cria a atividade com ID único e timestamps
    now = datetime.now()
    new_activity = Activity(
        id=str(uuid.uuid4()),
        **activity_data.model_dump(),
        created_at=now,
        updated_at=now
    )
    
    activities.append(new_activity)
    save_activities(activities)
    
    return new_activity


def update_activity(activity_id: str, update_data: ActivityUpdate) -> Optional[Activity]:
    """
    Atualiza uma atividade existente
    Só atualiza os campos que foram enviados (não None)
    """
    activities = load_activities()
    
    for i, activity in enumerate(activities):
        if activity.id == activity_id:
            # Pega os dados atuais e atualiza só o que foi enviado
            update_dict = update_data.model_dump(exclude_unset=True)
            updated_data = activity.model_dump()
            updated_data.update(update_dict)
            updated_data["updated_at"] = datetime.now()
            
            # Cria nova instância com os dados atualizados
            activities[i] = Activity(**updated_data)
            save_activities(activities)
            
            return activities[i]
    
    return None


def delete_activity(activity_id: str) -> bool:
    """
    Deleta uma atividade e remove a imagem associada se existir
    Retorna True se encontrou e deletou, False se não achou
    """
    activities = load_activities()
    
    for i, activity in enumerate(activities):
        if activity.id == activity_id:
            # Remove a imagem se existir
            if activity.image_path:
                image_full_path = activity.image_path.lstrip("/")
                if os.path.exists(image_full_path):
                    try:
                        os.remove(image_full_path)
                    except Exception:
                        pass  # Se não conseguir deletar a imagem, continua mesmo assim
            
            # Remove a atividade da lista
            activities.pop(i)
            save_activities(activities)
            
            return True
    
    return False


def save_activity_image(activity_id: str, file_content: bytes, filename: str) -> Optional[str]:
    """
    Salva uma imagem pra atividade
    Retorna o caminho relativo da imagem ou None se a atividade não existir
    """
    activity = get_activity_by_id(activity_id)
    if not activity:
        return None
    
    # Remove a imagem antiga se existir
    if activity.image_path:
        old_image_path = activity.image_path.lstrip("/")
        if os.path.exists(old_image_path):
            try:
                os.remove(old_image_path)
            except Exception:
                pass
    
    # Gera um nome único pra imagem usando o ID da atividade
    file_ext = os.path.splitext(filename)[1]
    new_filename = f"{activity_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    
    # Salva a imagem
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Atualiza o caminho da imagem na atividade
    relative_path = f"/{file_path.replace(os.sep, '/')}"
    activities = load_activities()
    
    for i, act in enumerate(activities):
        if act.id == activity_id:
            activities[i].image_path = relative_path
            activities[i].updated_at = datetime.now()
            save_activities(activities)
            return relative_path
    
    return None
