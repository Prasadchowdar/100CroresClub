-- 100CroresClub Database Schema for SQL Server

-- Users table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
CREATE TABLE users (
    id NVARCHAR(36) PRIMARY KEY,
    phone NVARCHAR(20) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    points BIGINT DEFAULT 0,
    referral_code NVARCHAR(50) NOT NULL UNIQUE,
    referrals_count INT DEFAULT 0,
    referred_by NVARCHAR(36) NULL,
    club_tier INT DEFAULT 0,
    last_reward_claim DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Contact messages table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contact_messages' AND xtype='U')
CREATE TABLE contact_messages (
    id NVARCHAR(36) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Admins table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admins' AND xtype='U')
CREATE TABLE admins (
    id NVARCHAR(36) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Admin OTPs table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='admin_otps' AND xtype='U')
CREATE TABLE admin_otps (
    id NVARCHAR(36) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL,
    otp_code NVARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Media table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='media' AND xtype='U')
CREATE TABLE media (
    id NVARCHAR(36) PRIMARY KEY,
    filename NVARCHAR(255) NOT NULL,
    original_name NVARCHAR(255) NOT NULL,
    mimetype NVARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    path NVARCHAR(500) NOT NULL,
    title NVARCHAR(255) NULL,
    description NVARCHAR(MAX) NULL,
    category NVARCHAR(50) DEFAULT 'general',
    uploaded_by NVARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_phone')
    CREATE INDEX idx_users_phone ON users(phone);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_referral_code')
    CREATE INDEX idx_users_referral_code ON users(referral_code);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_referred_by')
    CREATE INDEX idx_users_referred_by ON users(referred_by);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_admins_email')
    CREATE INDEX idx_admins_email ON admins(email);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_admin_otps_email')
    CREATE INDEX idx_admin_otps_email ON admin_otps(email);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_media_category')
    CREATE INDEX idx_media_category ON media(category);
GO

PRINT '✅ Database schema created successfully!';
