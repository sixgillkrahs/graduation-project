from sources import create_base_app
from sources.Controllers.main import router as ocr_router


app = create_base_app()
app.include_router(ocr_router)
