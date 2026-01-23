"""
API FastAPI pra gerenciar atividades
Todos os endpoints CRUD + upload de imagem
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from typing import List
import database as db
from models import Activity, ActivityCreate, ActivityUpdate
import os

# Inicializa a aplicação
app = FastAPI(
    title="Activity Manager API",
    description="API REST pra gerenciar atividades com estilo 😎",
    version="1.0.0"
)

# Configura CORS pra aceitar requisições do frontend
# Em produção você ajustaria essas origens, mas pra dev tá show
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite qualquer origem pra facilitar o desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve os arquivos de upload estaticamente
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
def read_root():
    """Endpoint raiz - só pra verificar se tá rodando"""
    return {"message": "Activity Manager API está rodando! 🚀"}


@app.get("/api/activities", response_model=List[Activity])
def list_activities():
    """
    Lista todas as atividades
    Retorna um array com todas as atividades cadastradas
    """
    return db.get_all_activities()


@app.get("/api/activities/{activity_id}", response_model=Activity)
def get_activity(activity_id: str):
    """
    Busca uma atividade específica pelo ID
    Se não encontrar, retorna 404
    """
    activity = db.get_activity_by_id(activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Atividade não encontrada")
    return activity


@app.post("/api/activities", response_model=Activity, status_code=201)
def create_activity(activity: ActivityCreate):
    """
    Cria uma nova atividade
    O ID é gerado automaticamente
    """
    print(f"Recebendo nova atividade: {activity}")
    return db.create_activity(activity)


@app.put("/api/activities/{activity_id}", response_model=Activity)
def update_activity(activity_id: str, activity_update: ActivityUpdate):
    """
    Atualiza uma atividade existente
    Pode atualizar qualquer campo: título, descrição ou status
    """
    updated_activity = db.update_activity(activity_id, activity_update)
    if not updated_activity:
        raise HTTPException(status_code=404, detail="Atividade não encontrada")
    return updated_activity


@app.delete("/api/activities/{activity_id}")
def delete_activity(activity_id: str):
    """
    Deleta uma atividade
    Remove também a imagem associada se existir
    """
    success = db.delete_activity(activity_id)
    if not success:
        raise HTTPException(status_code=404, detail="Atividade não encontrada")
    return {"message": "Atividade deletada com sucesso"}


@app.post("/api/activities/{activity_id}/upload-image")
async def upload_activity_image(activity_id: str, file: UploadFile = File(...)):
    """
    Faz upload de uma imagem pra atividade
    Aceita formatos comuns de imagem (jpg, png, gif, webp)
    """
    # Valida o tipo do arquivo
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Formato não suportado. Use: {', '.join(allowed_extensions)}"
        )
    
    # Lê o conteúdo do arquivo
    file_content = await file.read()
    
    # Salva a imagem
    image_path = db.save_activity_image(activity_id, file_content, file.filename)
    
    if not image_path:
        raise HTTPException(status_code=404, detail="Atividade não encontrada")
    
    return {"image_path": image_path, "message": "Imagem salva com sucesso"}


# Tratamento global de erros pra ficar mais amigável
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Captura erros inesperados e retorna uma resposta amigável"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Ops! Algo deu errado no servidor 😅"}
    )
