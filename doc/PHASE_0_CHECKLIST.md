# Phase 0 Completion Checklist

Use this checklist to ensure you've successfully completed Phase 0 setup before moving to Phase 1.

## ✅ Backend Setup

### Laravel Installation
- [ ] Created new Laravel 11 project (`composer create-project laravel/laravel cbt-backend`)
- [ ] Installed Laravel Sanctum (`composer require laravel/sanctum`)
- [ ] Installed Spatie Permission (`composer require spatie/laravel-permission`)
- [ ] Published Sanctum config (`php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`)

### Database Configuration
- [ ] Created database (MySQL/MariaDB)
- [ ] Updated `.env` with database credentials
- [ ] Configured DB_DATABASE, DB_USERNAME, DB_PASSWORD

### Migration Files
- [ ] Copied all 21 migration files to `database/migrations/`
- [ ] Verified migration files are present:
  ```bash
  ls -la database/migrations/2024_01_01_*
  ```

### Seeder Files
- [ ] Copied `GlobalCbtSettingsSeeder.php` to `database/seeders/`
- [ ] Verified seeder file exists:
  ```bash
  ls -la database/seeders/GlobalCbtSettingsSeeder.php
  ```

### Run Migrations
- [ ] Generated application key (`php artisan key:generate`)
- [ ] Ran migrations successfully (`php artisan migrate`)
- [ ] No migration errors
- [ ] Checked migration status (`php artisan migrate:status`)

### Seed Database
- [ ] Ran GlobalCbtSettingsSeeder (`php artisan db:seed --class=GlobalCbtSettingsSeeder`)
- [ ] Verified settings in database:
  ```bash
  php artisan tinker
  >>> \DB::table('global_cbt_settings')->count();
  ```

### Storage Setup
- [ ] Created storage symlink (`php artisan storage:link`)
- [ ] Created required directories:
  ```bash
  mkdir -p storage/app/public/questions/{images,audio,video,documents}
  mkdir -p storage/app/public/exam-uploads
  mkdir -p storage/app/public/selfies
  mkdir -p storage/app/public/proctoring/{screenshots,recordings}
  ```
- [ ] Set proper permissions:
  ```bash
  chmod -R 775 storage
  chmod -R 775 bootstrap/cache
  ```

### Redis & Queue
- [ ] Redis installed and running
- [ ] Updated `.env` with Redis config
- [ ] Set `QUEUE_CONNECTION=redis`
- [ ] Set `CACHE_DRIVER=redis`
- [ ] Set `SESSION_DRIVER=redis`
- [ ] Tested Redis connection:
  ```bash
  redis-cli ping
  ```

### CORS Configuration
- [ ] Updated `config/cors.php` with frontend URL
- [ ] Allowed origins include your frontend URL (e.g., `http://localhost:5173`)

### Sanctum Configuration
- [ ] Updated `config/sanctum.php` stateful domains
- [ ] Added frontend domain to `SANCTUM_STATEFUL_DOMAINS` in `.env`

## ✅ Database Verification

### Tables Created
Run this query to verify all tables exist:
```sql
SHOW TABLES LIKE '%cbt%';
```

Expected tables (21 total):
- [ ] questions
- [ ] question_options
- [ ] question_attachments
- [ ] subjects
- [ ] topics
- [ ] exams
- [ ] exam_sections
- [ ] exam_questions
- [ ] exam_eligibility
- [ ] exam_supervisors
- [ ] exam_attempts
- [ ] exam_answers
- [ ] exam_submissions
- [ ] exam_results
- [ ] proctoring_sessions
- [ ] proctoring_events
- [ ] selfie_captures
- [ ] device_fingerprints
- [ ] item_analysis
- [ ] audit_logs
- [ ] global_cbt_settings

### Existing School System Tables (if integrating)
- [ ] users table exists
- [ ] roles table exists
- [ ] permissions table exists
- [ ] classes table exists (optional)
- [ ] grade_levels table exists (optional)

### Settings Data
- [ ] Global CBT settings seeded (should have ~30 records)
- [ ] Verify settings:
  ```bash
  php artisan tinker
  >>> \DB::table('global_cbt_settings')->select('key', 'value')->get();
  ```

## ✅ Server Running

### Development Server
- [ ] Laravel server running (`php artisan serve`)
- [ ] Accessible at `http://localhost:8000`
- [ ] No errors in console

### Queue Worker (in separate terminal)
- [ ] Queue worker running (`php artisan queue:work`)
- [ ] No errors in console
- [ ] Jobs processing correctly

### Test API
- [ ] Test basic API endpoint:
  ```bash
  curl http://localhost:8000/api/health
  ```
- [ ] Returns successful response

## ✅ Environment Configuration

### .env File Check
- [ ] APP_NAME set
- [ ] APP_KEY generated
- [ ] APP_URL set
- [ ] Database credentials set
- [ ] Redis credentials set
- [ ] QUEUE_CONNECTION set to redis
- [ ] CACHE_DRIVER set to redis
- [ ] SANCTUM_STATEFUL_DOMAINS set
- [ ] CBT-specific settings configured

### File Permissions
- [ ] Storage directory writable
- [ ] Bootstrap/cache directory writable
- [ ] No permission errors in logs

### Logs Check
- [ ] Check `storage/logs/laravel.log` for errors
- [ ] No critical errors present

## ✅ Frontend Preparation (For Next Phase)

### React + Vite Project Structure
- [ ] Decided on frontend folder structure
- [ ] Node.js 18+ installed
- [ ] npm or yarn available

Note: We'll create the frontend in Phase 1.

## ✅ Documentation Review

- [ ] Read `README.md`
- [ ] Read `docs/DATABASE_SCHEMA.md`
- [ ] Read `docs/PHASE_0_SETUP.md`
- [ ] Read `docs/DEVELOPMENT_ROADMAP.md`
- [ ] Understand the integration modes (same database vs microservice)

## ✅ Integration Mode Decision

Choose your integration approach:

### Option A: Same Database (Recommended for simplicity)
- [ ] Pointed to existing school system database
- [ ] Existing tables accessible
- [ ] Users table has required fields

### Option B: Microservice (Separate database)
- [ ] Created separate CBT database
- [ ] Configured `SCHOOL_API_URL` in `.env`
- [ ] Configured `SCHOOL_API_KEY` in `.env`
- [ ] Plan for user sync mechanism

Note: We'll implement the sync service in later phases if using microservice mode.

## ✅ Testing & Verification

### Database Connection Test
```bash
php artisan tinker
>>> \DB::connection()->getPdo();
>>> echo "Connected successfully!";
```
- [ ] Connection successful

### Migration Status Check
```bash
php artisan migrate:status
```
- [ ] All migrations show "Ran"
- [ ] No "Pending" migrations

### Table Row Counts
```bash
php artisan tinker
>>> \DB::table('global_cbt_settings')->count();  // Should be ~30
>>> \DB::table('questions')->count();  // Should be 0 (empty for now)
```
- [ ] Settings table populated
- [ ] Other tables empty (as expected)

### Queue Test
```bash
php artisan tinker
>>> dispatch(new \App\Jobs\TestJob());
>>> exit
```
Then check queue worker console for job processing.
- [ ] Job processed successfully

## 🚀 Ready for Phase 1?

If you've checked all boxes above, you're ready to proceed to Phase 1!

### Before Starting Phase 1
1. Ensure Laravel server is running
2. Ensure queue worker is running
3. Ensure Redis is running
4. Have your code editor open
5. Have a terminal window ready

### Start Phase 1
When you're ready, say:
**"Let's start Phase 1: Question Bank Management"**

Or if you encountered issues, describe the problem and I'll help you troubleshoot!

## Common Issues & Solutions

### Issue: Migration fails with foreign key constraint
**Solution**: 
```bash
php artisan migrate:fresh
# Re-run seeder
php artisan db:seed --class=GlobalCbtSettingsSeeder
```

### Issue: Permission denied on storage
**Solution**:
```bash
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R $USER:www-data storage bootstrap/cache
```

### Issue: Redis connection refused
**Solution**:
```bash
# Start Redis
redis-server
# Or using systemctl
sudo systemctl start redis
```

### Issue: Sanctum CORS errors
**Solution**: 
- Check `config/cors.php` has frontend URL in `allowed_origins`
- Check `config/sanctum.php` has frontend domain in `stateful`
- Clear config cache: `php artisan config:clear`

### Issue: Class 'Redis' not found
**Solution**:
```bash
# Install PHP Redis extension
sudo apt-get install php-redis
# Or for Mac
brew install php-redis
# Restart PHP
```

## Notes

- Keep your `.env` file secure and never commit it to version control
- Make regular backups of your database during development
- Test each migration individually if you encounter errors
- Document any custom changes you make to the schema

---

**Phase 0 Status**: [ ] Complete | [ ] Issues to resolve

If complete, proceed to Phase 1!
If issues, list them here and request help:
_______________________________________
_______________________________________
_______________________________________
