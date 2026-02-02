-- Add 2FA toggle column to admins table

-- Check if column exists and add it if it doesn't
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'admins' AND COLUMN_NAME = 'two_factor_enabled'
)
BEGIN
    ALTER TABLE admins ADD two_factor_enabled BIT DEFAULT 1;
    PRINT 'âœ… Added two_factor_enabled column to admins table';
END
ELSE
BEGIN
    PRINT 'â„¹ï¸ Column two_factor_enabled already exists';
END
GO

-- Set all existing admins to have 2FA enabled by default
UPDATE admins SET two_factor_enabled = 1 WHERE two_factor_enabled IS NULL;
GO

PRINT 'âœ… 2FA toggle migration completed successfully!';
