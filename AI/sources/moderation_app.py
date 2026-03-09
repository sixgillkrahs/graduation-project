from sources import create_base_app
from sources.Controllers.moderation import router as moderation_router


app = create_base_app(include_static=False)
app.include_router(moderation_router)
