from motor.motor_asyncio import AsyncIOMotorClient
import settings

client = AsyncIOMotorClient(settings.mongodb_uri)
print(client)

db = client["images"]