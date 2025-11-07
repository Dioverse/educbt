# CBT System - Phase 0: Foundation Package

## 📦 What You Have

This package contains the complete database foundation and setup documentation for your Computer-Based Testing (CBT) system.

### Package Contents

```
cbt-system/
├── README.md                          # Project overview
├── docs/
│   ├── DATABASE_SCHEMA.md             # Complete database documentation
│   ├── PHASE_0_SETUP.md               # Detailed setup instructions
│   ├── DEVELOPMENT_ROADMAP.md         # All phases explained
│   └── PHASE_0_CHECKLIST.md           # Completion checklist
└── backend/
    └── database/
        ├── migrations/                # 21 migration files
        │   ├── 2024_01_01_000001_create_questions_table.php
        │   ├── 2024_01_01_000002_create_question_options_table.php
        │   ├── ... (19 more migration files)
        │   └── 2024_01_01_000021_create_global_cbt_settings_table.php
        └── seeders/
            └── GlobalCbtSettingsSeeder.php
```

## 🚀 Quick Start

### Step 1: Extract Files
Extract this folder to your development directory.

### Step 2: Create Laravel Project
```bash
composer create-project laravel/laravel cbt-backend
cd cbt-backend
```

### Step 3: Copy Database Files
```bash
# Copy migrations
cp /path/to/cbt-system/backend/database/migrations/*.php database/migrations/

# Copy seeders
cp /path/to/cbt-system/backend/database/seeders/*.php database/seeders/
```

### Step 4: Install Dependencies
```bash
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require maatwebsite/excel
composer require intervention/image
composer require aws/aws-sdk-php
```

### Step 5: Configure Environment
```bash
# Copy and edit .env file
cp .env.example .env

# Update these values:
# - Database credentials (DB_DATABASE, DB_USERNAME, DB_PASSWORD)
# - Redis configuration
# - Queue driver (QUEUE_CONNECTION=redis)
```

### Step 6: Run Migrations
```bash
php artisan key:generate
php artisan migrate
php artisan db:seed --class=GlobalCbtSettingsSeeder
php artisan storage:link
```

### Step 7: Start Development Servers
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Queue worker
php artisan queue:work
```

## 📋 Database Tables Created

21 tables will be created:

**Question Bank** (4 tables):
- questions
- question_options
- question_attachments
- subjects, topics

**Exam Management** (5 tables):
- exams
- exam_sections
- exam_questions
- exam_eligibility
- exam_supervisors

**Exam Attempts** (4 tables):
- exam_attempts
- exam_answers
- exam_submissions
- exam_results

**Proctoring** (4 tables):
- proctoring_sessions
- proctoring_events
- selfie_captures
- device_fingerprints

**Analytics & Config** (3 tables):
- item_analysis
- audit_logs
- global_cbt_settings

## 📚 Documentation

### Must Read First
1. **README.md** - Project overview and tech stack
2. **docs/PHASE_0_SETUP.md** - Complete setup guide with troubleshooting
3. **docs/PHASE_0_CHECKLIST.md** - Use this to verify your setup

### For Reference
- **docs/DATABASE_SCHEMA.md** - Detailed schema documentation
- **docs/DEVELOPMENT_ROADMAP.md** - All upcoming phases explained

## ✅ Verify Your Setup

After completing the setup, run these commands to verify:

```bash
# Check migrations
php artisan migrate:status

# Verify settings seeded
php artisan tinker
>>> \DB::table('global_cbt_settings')->count(); // Should return ~30
>>> exit

# Test server
curl http://localhost:8000
```

## 🎯 Next Steps

Once Phase 0 is complete and verified, proceed to:

**Phase 1: Question Bank Management**
- Complete CRUD for all question types
- Import/Export functionality
- Media uploads
- Tag management
- Question bank UI

Say: **"Let's start Phase 1: Question Bank Management"**

## 🔧 Integration Options

### Option A: Same Database (Recommended)
Use the same database as your existing School Management System.
- Point `DB_DATABASE` to existing database in `.env`
- Reuses `users`, `roles`, `permissions` tables

### Option B: Microservice (Separate Database)
Maintain a separate database with API integration.
- Create new database for CBT
- Set `CBT_INTEGRATION_MODE=microservice` in `.env`
- Configure `SCHOOL_API_URL` and `SCHOOL_API_KEY`

## 🆘 Need Help?

If you encounter any issues:
1. Check `docs/PHASE_0_SETUP.md` troubleshooting section
2. Review `docs/PHASE_0_CHECKLIST.md`
3. Check Laravel logs: `storage/logs/laravel.log`
4. Describe the issue in our next chat

## 📊 System Requirements

- PHP 8.2+
- Composer
- MySQL 8.0+ or MariaDB 10.3+
- Node.js 18+ (for frontend in Phase 1)
- Redis
- 2GB RAM minimum
- 10GB disk space

## 🔐 Security Notes

- Never commit `.env` file
- Use strong `APP_KEY` (auto-generated)
- Enable HTTPS in production
- Configure CORS properly
- Set proper file permissions
- Use signed URLs for sensitive files

## 📞 Support

This is Phase 0 - the foundation. We'll build the complete system together across multiple phases.

**Current Status**: Phase 0 Complete ✅

**Next Phase**: Question Bank Management

Ready when you are! 🚀
