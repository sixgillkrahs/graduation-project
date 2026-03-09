import uvicorn

from sources.Controllers.config import MODERATION_PORT


if __name__ == "__main__":
    uvicorn.run(
        "sources.moderation_app:app",
        host="0.0.0.0",
        port=int(MODERATION_PORT),
        reload=False,
    )
