-- Add Settings Table Migration
-- Run this on the production database to add the settings table

-- Settings table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='settings' AND xtype='U')
CREATE TABLE settings (
    setting_key NVARCHAR(100) PRIMARY KEY,
    setting_value NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME NULL
);
GO

-- Create index for settings table
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_settings_key')
    CREATE INDEX idx_settings_key ON settings(setting_key);
GO

PRINT 'âœ… Settings table created successfully!';
