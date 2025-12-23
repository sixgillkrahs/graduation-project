from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],          
    allow_methods=["*"],      
    allow_headers=["*"],   
)

from sources.Controllers import main
