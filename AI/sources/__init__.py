from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import sources.Controllers.config as cfg


def create_base_app(include_static: bool = False) -> FastAPI:
    app = FastAPI()

    if include_static:
        app.mount("/static", StaticFiles(directory=cfg.UPLOAD_FOLDER), name="static")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app
