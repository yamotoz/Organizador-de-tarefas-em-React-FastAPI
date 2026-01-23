"""
Modelos de dados pra nossa aplicação
Aqui a gente define como as atividades são estruturadas
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

# Aqui a gente define os status possíveis, bem simples e direto
StatusType = Literal["pendente", "em andamento", "concluído"]


class ActivityBase(BaseModel):
    """Base model com os campos básicos que toda atividade tem"""
    title: str = Field(..., min_length=1, max_length=200, description="Título da atividade")
    description: str = Field(..., min_length=1, description="Descrição detalhada")
    status: StatusType = Field(default="pendente", description="Status atual")


class ActivityCreate(ActivityBase):
    """Schema pra quando a gente tá criando uma atividade nova"""
    pass


class ActivityUpdate(BaseModel):
    """Schema pra update - todos os campos são opcionais aqui, né"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[StatusType] = None


class Activity(ActivityBase):
    """
    Model completo da atividade com todos os campos
    Esse aqui é o que a gente retorna nas respostas da API
    """
    id: str
    image_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "abc123",
                "title": "Implementar testes unitários",
                "description": "Criar testes para todos os componentes principais",
                "status": "em andamento",
                "image_path": "/uploads/abc123.jpg",
                "created_at": "2026-01-23T12:00:00",
                "updated_at": "2026-01-23T13:00:00"
            }
        }
