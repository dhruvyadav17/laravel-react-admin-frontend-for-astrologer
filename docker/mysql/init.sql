-- Runs once when the MySQL container is first created
CREATE DATABASE IF NOT EXISTS astrologer
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Ensure the app user has full access
GRANT ALL PRIVILEGES ON astrologer.* TO 'astro_user'@'%';
FLUSH PRIVILEGES;
