from motor.motor_asyncio import AsyncIOMotorClient
from config import DB_URL, DATABASE_NAME
import certifi

# MongoDB client with proper SSL configuration
client = AsyncIOMotorClient(
    DB_URL,
    tlsCAFile=certifi.where(),  # Use certifi for SSL certificates
    serverSelectionTimeoutMS=10000,  # 10 second timeout
    connectTimeoutMS=20000,  # 20 second connection timeout
    socketTimeoutMS=30000,  # 30 second socket timeout
    maxPoolSize=10,  # Connection pool size
    retryWrites=True,
    w="majority"
)

database = client[DATABASE_NAME]

# Collections
users_collection = database.users
email_records_collection = database.email_records
smtp_configs_collection = database.smtp_configs

async def init_db():
    """Initialize database collections and indexes"""
    try:
        # Test the connection first
        await client.admin.command('ping')
        print(f"Successfully connected to MongoDB Atlas")
        
        # Create indexes for better performance
        await users_collection.create_index("email", unique=True)
        await email_records_collection.create_index("user_id")
        await email_records_collection.create_index("created_at")
        await smtp_configs_collection.create_index("user_id", unique=True)
        print(f"Database indexes created successfully")
        
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e

async def close_db():
    """Close database connection"""
    client.close() 