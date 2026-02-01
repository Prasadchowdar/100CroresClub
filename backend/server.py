from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import secrets
import string

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

# Club tiers configuration
CLUB_TIERS = [
    {"name": "1 Crore ", "points_required": 10000000, "icon": "bronze"},
    {"name": "5 Crore ", "points_required": 50000000, "icon": "silver"},
    {"name": "10 Crore ", "points_required": 100000000, "icon": "gold"},
    {"name": "25 Crore ", "points_required": 250000000, "icon": "platinum"},
    {"name": "50 Crore ", "points_required": 500000000, "icon": "diamond"},
    {"name": "75 Crore ", "points_required": 750000000, "icon": "master"},
    {"name": "100 Crore", "points_required": 1000000000, "icon": "grandmaster"},
]

DAILY_REWARD_POINTS = 10000
REFERRAL_REWARD_POINTS = 1000000
COOLDOWN_HOURS = 22

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# --- Models ---
class UserBase(BaseModel):
    phone: str
    name: str

class UserCreate(BaseModel):
    phone: str
    password: str
    name: str
    referral_code: Optional[str] = None

class UserLogin(BaseModel):
    phone: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    phone: str
    name: str
    points: int
    referral_code: str
    referrals_count: int
    club_tier: int
    last_reward_claim: Optional[str] = None
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PointsResponse(BaseModel):
    points: int
    club_tier: int
    next_club_points: Optional[int] = None
    next_club_name: Optional[str] = None

class ClaimRewardResponse(BaseModel):
    success: bool
    points_earned: int
    total_points: int
    next_claim_available: str
    message: str

class ReferralApply(BaseModel):
    referral_code: str

class ReferralResponse(BaseModel):
    success: bool
    message: str
    points_earned: int = 0

class ContactMessage(BaseModel):
    name: str
    email: str
    message: str

class ContactResponse(BaseModel):
    success: bool
    message: str

# --- Helper Functions ---
def generate_referral_code():
    """Generate a unique referral code"""
    chars = string.ascii_uppercase + string.digits
    code = '100CRCLUB' + ''.join(secrets.choice(chars) for _ in range(8))
    return code

def hash_password(password: str) -> str:
    """Hash a password"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    """Create a JWT token"""
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "exp": expiration,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode a JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from token"""
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def calculate_club_tier(points: int) -> int:
    """Calculate the club tier based on points"""
    tier = 0
    for i, club in enumerate(CLUB_TIERS):
        if points >= club["points_required"]:
            tier = i + 1
    return tier

def get_next_club_info(points: int):
    """Get info about next club tier"""
    for club in CLUB_TIERS:
        if points < club["points_required"]:
            return club["points_required"], club["name"]
    return None, None

# --- Auth Routes ---
@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"phone": user_data.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # Validation for referral code if provided
    referrer = None
    if user_data.referral_code:
        referrer = await db.users.find_one({"referral_code": user_data.referral_code})
        if not referrer:
            raise HTTPException(status_code=400, detail="Invalid referral code")
    
    # Create user
    user_id = str(uuid.uuid4())
    my_referral_code = generate_referral_code()
    
    # Ensure unique referral code
    while await db.users.find_one({"referral_code": my_referral_code}):
        my_referral_code = generate_referral_code()
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Calculate initial points (Always 0 for new user, only referrer gets bonus)
    initial_points = 0
    initial_tier = calculate_club_tier(initial_points)

    user_doc = {
        "id": user_id,
        "phone": user_data.phone,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "points": initial_points,
        "referral_code": my_referral_code,
        "referrals_count": 0,
        "referred_by": referrer["id"] if referrer else None,
        "club_tier": initial_tier,
        "last_reward_claim": None,
        "created_at": now
    }
    
    await db.users.insert_one(user_doc)
    
    # If there was a referrer, update them
    if referrer:
        referrer_new_points = referrer["points"] + REFERRAL_REWARD_POINTS
        referrer_new_tier = calculate_club_tier(referrer_new_points)
        
        await db.users.update_one(
            {"id": referrer["id"]},
            {
                "$set": {
                    "points": referrer_new_points,
                    "club_tier": referrer_new_tier
                },
                "$inc": {"referrals_count": 1}
            }
        )
    
    token = create_token(user_id)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            phone=user_data.phone,
            name=user_data.name,
            points=initial_points,
            referral_code=my_referral_code,
            referrals_count=0,
            club_tier=initial_tier,
            last_reward_claim=None,
            created_at=now
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user"""
    user = await db.users.find_one({"phone": credentials.phone}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
    
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
    
    token = create_token(user["id"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            phone=user["phone"],
            name=user["name"],
            points=user["points"],
            referral_code=user["referral_code"],
            referrals_count=user["referrals_count"],
            club_tier=user["club_tier"],
            last_reward_claim=user["last_reward_claim"],
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=current_user["id"],
        phone=current_user["phone"],
        name=current_user["name"],
        points=current_user["points"],
        referral_code=current_user["referral_code"],
        referrals_count=current_user["referrals_count"],
        club_tier=current_user["club_tier"],
        last_reward_claim=current_user["last_reward_claim"],
        created_at=current_user["created_at"]
    )

# --- Points Routes ---
@api_router.get("/points", response_model=PointsResponse)
async def get_points(current_user: dict = Depends(get_current_user)):
    """Get user's current points and club tier"""
    points = current_user["points"]
    club_tier = calculate_club_tier(points)
    next_points, next_name = get_next_club_info(points)
    
    return PointsResponse(
        points=points,
        club_tier=club_tier,
        next_club_points=next_points,
        next_club_name=next_name
    )

@api_router.post("/points/claim-daily", response_model=ClaimRewardResponse)
async def claim_daily_reward(current_user: dict = Depends(get_current_user)):
    """Claim daily reward"""
    last_claim = current_user.get("last_reward_claim")
    
    # Use IST (Indian Standard Time) for the day check
    ist_tz = timezone(timedelta(hours=5, minutes=30))
    now_ist = datetime.now(ist_tz)
    
    if last_claim:
        # Convert stored UTC string to datetime object
        last_claim_utc = datetime.fromisoformat(last_claim.replace('Z', '+00:00'))
        # Convert to IST
        last_claim_ist = last_claim_utc.astimezone(ist_tz)
        
        # Check if the claim was made today (IST)
        if last_claim_ist.date() == now_ist.date():
            # Already claimed today
            # Calculate time until midnight IST
            tomorrow_midnight = (now_ist + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            
            return ClaimRewardResponse(
                success=False,
                points_earned=0,
                total_points=current_user["points"],
                next_claim_available=tomorrow_midnight.isoformat(),
                message="Come back tomorrow"
            )
    
    # Award points
    new_points = current_user["points"] + DAILY_REWARD_POINTS
    new_tier = calculate_club_tier(new_points)
    
    # Store claim time in UTC as usual for consistency
    now_utc = datetime.now(timezone.utc)
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "points": new_points,
                "club_tier": new_tier,
                "last_reward_claim": now_utc.isoformat()
            }
        }
    )
    
    tomorrow_midnight = (now_ist + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    return ClaimRewardResponse(
        success=True,
        points_earned=DAILY_REWARD_POINTS,
        total_points=new_points,
        next_claim_available=tomorrow_midnight.isoformat(),
        message=f"Congratulations! You earned {DAILY_REWARD_POINTS:,} points!"
    )

@api_router.get("/points/cooldown")
async def get_cooldown(current_user: dict = Depends(get_current_user)):
    """Get time until next reward is available"""
    last_claim = current_user.get("last_reward_claim")
    
    ist_tz = timezone(timedelta(hours=5, minutes=30))
    now_ist = datetime.now(ist_tz)
    
    if not last_claim:
        return {
            "can_claim": True,
            "next_claim_available": now_ist.isoformat(),
            "seconds_remaining": 0
        }
    
    last_claim_utc = datetime.fromisoformat(last_claim.replace('Z', '+00:00'))
    last_claim_ist = last_claim_utc.astimezone(ist_tz)
    
    # If last claim was before today (in IST), we can claim
    if last_claim_ist.date() < now_ist.date():
         return {
            "can_claim": True,
            "next_claim_available": now_ist.isoformat(),
            "seconds_remaining": 0
        }
    
    # Otherwise, wait for tomorrow
    tomorrow_midnight = (now_ist + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    remaining = tomorrow_midnight - now_ist
    
    return {
        "can_claim": False,
        "next_claim_available": tomorrow_midnight.isoformat(),
        "seconds_remaining": int(remaining.total_seconds())
    }


# --- Referral Routes ---
@api_router.post("/referral/apply", response_model=ReferralResponse)
async def apply_referral(data: ReferralApply, current_user: dict = Depends(get_current_user)):
    """Apply a referral code"""
    if current_user.get("referred_by"):
        return ReferralResponse(
            success=False,
            message="You have already used a referral code"
        )
    
    # Find referrer
    referrer = await db.users.find_one({"referral_code": data.referral_code}, {"_id": 0})
    if not referrer:
        return ReferralResponse(
            success=False,
            message="Invalid referral code"
        )
    
    if referrer["id"] == current_user["id"]:
        return ReferralResponse(
            success=False,
            message="You cannot use your own referral code"
        )
    
    # Update current user
    new_points = current_user["points"] + REFERRAL_REWARD_POINTS
    new_tier = calculate_club_tier(new_points)
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "referred_by": referrer["id"],
                "points": new_points,
                "club_tier": new_tier
            }
        }
    )
    
    # Update referrer
    referrer_new_points = referrer["points"] + REFERRAL_REWARD_POINTS
    referrer_new_tier = calculate_club_tier(referrer_new_points)
    
    await db.users.update_one(
        {"id": referrer["id"]},
        {
            "$set": {
                "points": referrer_new_points,
                "club_tier": referrer_new_tier
            },
            "$inc": {"referrals_count": 1}
        }
    )
    
    return ReferralResponse(
        success=True,
        message=f"Referral code applied! You and {referrer['name']} both earned {REFERRAL_REWARD_POINTS:,} points!",
        points_earned=REFERRAL_REWARD_POINTS
    )

@api_router.get("/referral/stats")
async def get_referral_stats(current_user: dict = Depends(get_current_user)):
    """Get referral statistics"""
    return {
        "referral_code": current_user["referral_code"],
        "referrals_count": current_user["referrals_count"],
        "points_per_referral": REFERRAL_REWARD_POINTS
    }

# --- Club Routes ---
@api_router.get("/clubs")
async def get_clubs(current_user: dict = Depends(get_current_user)):
    """Get all club tiers and user's progress"""
    user_points = current_user["points"]
    clubs = []
    
    for i, club in enumerate(CLUB_TIERS):
        clubs.append({
            "id": i + 1,
            "name": club["name"],
            "points_required": club["points_required"],
            "icon": club["icon"],
            "is_unlocked": user_points >= club["points_required"]
        })
    
    return {
        "clubs": clubs,
        "user_points": user_points,
        "current_tier": calculate_club_tier(user_points)
    }

# --- Contact Routes ---
@api_router.post("/contact", response_model=ContactResponse)
async def submit_contact(message: ContactMessage):
    """Submit a contact message"""
    contact_doc = {
        "id": str(uuid.uuid4()),
        "name": message.name,
        "email": message.email,
        "message": message.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending"
    }
    
    await db.contact_messages.insert_one(contact_doc)
    
    return ContactResponse(
        success=True,
        message="Thank you for your message! We'll get back to you soon."
    )

# --- Health Check ---
@api_router.get("/")
async def root():
    return {"message": "100CRORECLUB API is running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
