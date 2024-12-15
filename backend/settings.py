from dotenv import load_dotenv
import os


load_dotenv()

mongodb_uri = os.getenv("MONGODB_URI")
port = int(os.getenv("PORT", 8000))
