# Phase 0: Project Setup Guide

## Prerequisites
- PHP 8.2+
- Composer
- MySQL 8.0+ or MariaDB 10.3+
- Node.js 18+ & npm
- Redis (for queue and cache)
- Git

## Step 1: Create Laravel Backend

```bash
# Create new Laravel project
composer create-project laravel/laravel cbt-backend

cd cbt-backend

# Install additional packages
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require maatwebsite/excel
composer require intervention/image
composer require aws/aws-sdk-php

# Publish Sanctum configuration
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Publish Spatie Permission configuration
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

## Step 2: Database Configuration

### Copy Migration Files
Copy all migration files from `/home/claude/cbt-system/backend/database/migrations/` to your Laravel project's `database/migrations/` directory.

```bash
# Assuming you're in the cbt-backend directory
cp /home/claude/cbt-system/backend/database/migrations/*.php database/migrations/
```

### Copy Seeder Files
```bash
cp /home/claude/cbt-system/backend/database/seeders/*.php database/seeders/
```

### Configure .env File
```env
APP_NAME="CBT System"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cbt_system
DB_USERNAME=root
DB_PASSWORD=

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Queue
QUEUE_CONNECTION=redis

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173

# File Storage
FILESYSTEM_DISK=local
# For production, use S3:
# FILESYSTEM_DISK=s3
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_DEFAULT_REGION=us-east-1
# AWS_BUCKET=
# AWS_USE_PATH_STYLE_ENDPOINT=false

# CBT Specific Settings
CBT_INTEGRATION_MODE=same_database
# If using microservice mode:
# SCHOOL_API_URL=http://school-system.test/api
# SCHOOL_API_KEY=your_api_key

# Proctoring
CBT_ENABLE_PROCTORING=true
CBT_SELFIE_VERIFICATION=false
CBT_LIVENESS_DETECTION=false

# Security
CBT_MAX_TAB_SWITCHES=3
CBT_ENABLE_FULLSCREEN=false
CBT_SESSION_TIMEOUT=30

# File Uploads
CBT_MAX_FILE_SIZE_MB=10
CBT_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,png
```

## Step 3: Setup Database

### Option A: Fresh Installation
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE cbt_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed global settings
php artisan db:seed --class=GlobalCbtSettingsSeeder

# Create storage symlink
php artisan storage:link
```

### Option B: Integration with Existing School System (Same Database)
```bash
# Point DB_DATABASE to your existing school system database in .env
DB_DATABASE=school_management_system

# Run only CBT-specific migrations
php artisan migrate --path=database/migrations/2024_01_01_*

# Seed global settings
php artisan db:seed --class=GlobalCbtSettingsSeeder
```

## Step 4: Configure CORS for API

Edit `config/cors.php`:
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## Step 5: Configure Sanctum

Edit `config/sanctum.php`:
```php
'middleware' => [
    'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
    'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
],
```

## Step 6: Set Up File Storage

```bash
# Create storage directories
php artisan storage:link

# Create additional directories for CBT
mkdir -p storage/app/public/questions/images
mkdir -p storage/app/public/questions/audio
mkdir -p storage/app/public/questions/video
mkdir -p storage/app/public/questions/documents
mkdir -p storage/app/public/exam-uploads
mkdir -p storage/app/public/selfies
mkdir -p storage/app/public/proctoring/screenshots
mkdir -p storage/app/public/proctoring/recordings
```

## Step 7: Set Up Queue Worker

```bash
# Start queue worker in development
php artisan queue:work

# For production, use Supervisor
# Create /etc/supervisor/conf.d/cbt-worker.conf
```

## Step 8: Run Development Server

```bash
# Start Laravel server
php artisan serve

# In another terminal, start queue worker
php artisan queue:work

# Optional: Watch for file changes
php artisan queue:listen
```

## Step 9: Verify Installation

Test the setup:
```bash
# Check database tables
php artisan migrate:status

# Test database connection
php artisan tinker
>>> \DB::connection()->getPdo();
```

## Database Schema Verification

You should now have these tables:
- questions
- question_options
- question_attachments
- subjects
- topics
- exams
- exam_sections
- exam_questions
- exam_eligibility
- exam_supervisors
- exam_attempts
- exam_answers
- exam_submissions
- exam_results
- proctoring_sessions
- proctoring_events
- selfie_captures
- device_fingerprints
- item_analysis
- audit_logs
- global_cbt_settings

Plus existing school system tables:
- users
- roles
- permissions
- classes
- grade_levels

## Integration Notes

### Same Database Mode
- Uses existing `users`, `roles`, `permissions` tables
- Shares authentication with school system
- Requires `classes` and `grade_levels` tables to exist

### Microservice Mode
- Maintains separate database
- Syncs users via API
- Uses Sanctum tokens for authentication
- Requires implementing API sync service

## Next Steps

After Phase 0 is complete, we'll proceed to:
- **Phase 1**: Question Bank Management (CRUD + Import/Export)
- **Phase 2**: Exam Creation & Configuration
- **Phase 3**: Student Exam Taking Flow
- **Phase 4**: Proctoring & Supervisor Dashboard
- **Phase 5**: Results & Analytics
- **Phase 6**: Security Hardening

## Troubleshooting

### Migration Errors
```bash
# If you get foreign key constraint errors:
php artisan migrate:fresh

# If specific migration fails:
php artisan migrate:rollback --step=1
php artisan migrate
```

### Permission Issues
```bash
# Fix storage permissions
sudo chmod -R 775 storage
sudo chmod -R 775 bootstrap/cache

# If using www-data user:
sudo chown -R www-data:www-data storage
sudo chown -R www-data:www-data bootstrap/cache
```

### Redis Connection Issues
```bash
# Start Redis
redis-server

# Test Redis connection
redis-cli ping
```

## Important Security Notes

1. **Never commit .env file** - Contains sensitive credentials
2. **Use strong APP_KEY** - Generated by `php artisan key:generate`
3. **Configure CORS properly** - Restrict allowed origins in production
4. **Use HTTPS in production** - Required for webcam/microphone access
5. **Set up proper file permissions** - Storage directories need write access
6. **Enable rate limiting** - Protect against brute force attacks
7. **Validate all user inputs** - Use Laravel Form Requests
8. **Use signed URLs** - For temporary file access
9. **Implement CSRF protection** - Already configured in Sanctum
10. **Regular backups** - Schedule automated database backups

## Performance Optimization

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize

# For production:
php artisan optimize
```
