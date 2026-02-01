# 100 Crores Club

A premium web application for a gamified investment rewards program featuring daily rewards, referral system, and exclusive club tiers.

## 🚀 Features

- **User Authentication**: Phone + password based login/registration
- **Daily Rewards**: Earn 10,000 points daily with 22-hour cooldown
- **Referral System**: Earn 1,000,000 points per successful referral
- **Exclusive Clubs**: 7 club tiers unlocked by referral milestones
- **Premium UI**: Dark theme with gold accents, animated elements
- **Banner Integration**: Custom banner images for unlocked clubs

## 📊 Club Tiers

| Club | Referrals Required | Reward |
|------|-------------------:|-------:|
| 1 Crore | 10 | 1 Crore |
| 5 Crore | 50 | 5 Crore |
| 10 Crore | 100 | 10 Crore |
| 25 Crore | 250 | 25 Crore |
| 50 Crore | 500 | 50 Crore |
| 75 Crore | 750 | 75 Crore |
| 100 Crore | 1000 | 100 Crore |

## 🛠 Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Radix UI Components
- Lucide React Icons
- Axios for API calls

### Backend
- FastAPI (Python)
- MongoDB with Motor (async driver)
- JWT Authentication
- bcrypt for password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your values

# Run server
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env with your values

# Run development server
npm start
```

## 🔧 Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=100croresclub
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8001/api
```

## 📁 Project Structure

```
100CroresClub/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   ├── .env.example       # Environment template
│   └── .env               # Environment variables (gitignored)
├── frontend/
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # UI components
│   │   └── context/       # React context
│   ├── public/
│   │   └── assets/
│   │       └── banners/   # Club banner images
│   ├── .env.example       # Environment template
│   └── .env               # Environment variables (gitignored)
└── README.md
```

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/user/me` | Get current user |
| POST | `/api/user/claim-reward` | Claim daily reward |

## 🔒 Security

- JWT tokens for authentication
- bcrypt password hashing
- CORS protection
- Environment-based secrets

## 📄 License

MIT License

## 👤 Author

Varaprasad Nadella
