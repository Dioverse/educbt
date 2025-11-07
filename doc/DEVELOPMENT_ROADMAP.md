# CBT System - Development Roadmap

## Overview
This document outlines the complete development journey for building the Computer-Based Testing (CBT) system. Each phase will be handled in a separate chat session to ensure focused, thorough implementation.

---

## ✅ Phase 0: Foundation & Database Setup (CURRENT)

**Status**: COMPLETED

**Deliverables**:
- [x] Complete database schema design
- [x] All migration files (21 tables)
- [x] Global CBT settings seeder
- [x] Project structure documentation
- [x] Setup guide with integration options

**Tables Created**:
- Questions & Question Bank (questions, question_options, question_attachments)
- Exam Management (exams, exam_sections, exam_questions, exam_eligibility, exam_supervisors)
- Exam Attempts (exam_attempts, exam_answers, exam_submissions, exam_results)
- Proctoring (proctoring_sessions, proctoring_events, selfie_captures, device_fingerprints)
- Analytics (item_analysis, audit_logs)
- Configuration (subjects, topics, global_cbt_settings)

**What to Run**:
```bash
# Follow the setup guide in docs/PHASE_0_SETUP.md
composer create-project laravel/laravel cbt-backend
cd cbt-backend
# ... copy migrations and follow setup steps
php artisan migrate
php artisan db:seed --class=GlobalCbtSettingsSeeder
```

---

## 📋 Phase 1: Question Bank Management System

**Focus**: Complete CRUD operations for questions with all supported types

**Backend Implementation**:
1. **Models & Relationships**
   - Question model with polymorphic relationships
   - QuestionOption model
   - QuestionAttachment model
   - Subject and Topic models

2. **Services Layer** (Service Pattern)
   - QuestionService: Core business logic
   - QuestionImportService: CSV/JSON/Excel import
   - QuestionExportService: Export with various formats
   - MediaService: Handle image/audio/video uploads

3. **Repositories**
   - QuestionRepository: Database queries
   - Implement filters, search, pagination

4. **API Controllers**
   - QuestionController (CRUD)
   - QuestionBulkController (Import/Export)
   - QuestionMediaController (File uploads)
   - SubjectController
   - TopicController

5. **Form Requests & Validation**
   - StoreQuestionRequest (with type-specific rules)
   - UpdateQuestionRequest
   - BulkImportRequest

6. **API Resources**
   - QuestionResource (with conditional fields)
   - QuestionCollection (with metadata)

**Frontend Implementation**:
1. **Pages/Components**
   - Question Bank Dashboard
   - Question List with filters
   - Question Form (dynamic based on type)
   - Question Preview
   - Bulk Import Interface
   - Media Upload Components

2. **State Management**
   - Question store (Zustand)
   - Subject/Topic store
   - File upload progress store

3. **API Integration**
   - Axios service for questions
   - File upload with progress
   - Error handling

**Question Types to Support**:
- Multiple Choice (Single & Multiple)
- True/False
- Short Answer
- Numeric (with tolerance)
- Essay/Theory (rich text + file upload)
- Image-based (with hotspots)
- Audio/Video questions
- Match-the-following
- Drag-and-drop

**Features**:
- Rich text editor integration (TinyMCE or Quill)
- Image editor for hotspot marking
- Audio/Video player components
- Tag management system
- Question difficulty calculator
- Question preview in exam format
- Bulk operations (delete, update tags, change difficulty)
- Version history
- Question approval workflow

**Deliverables**:
- Complete Question CRUD API
- Import/Export functionality (CSV, JSON, Excel)
- Media upload with validation
- Tag management
- Question bank UI with all question types
- Search and filter system
- Bulk operations interface

---

## 🎯 Phase 2: Exam Creation & Configuration

**Focus**: Complete exam setup with sections, question pools, and scheduling

**Backend Implementation**:
1. **Models & Services**
   - Exam model with complex settings
   - ExamSection model
   - ExamService: Exam management
   - ExamQuestionService: Question assignment
   - EligibilityService: User assignment logic
   - SchedulingService: Date/time handling

2. **API Controllers**
   - ExamController (CRUD)
   - ExamSectionController
   - ExamQuestionController (assign/remove)
   - EligibilityController
   - SupervisorController

3. **Complex Features**
   - Question pool randomization logic
   - Section-wise time allocation
   - Eligibility rule engine
   - Access code generation
   - Exam duplication/cloning
   - Exam templates

**Frontend Implementation**:
1. **Exam Creation Wizard**
   - Step 1: Basic Info
   - Step 2: Sections Setup
   - Step 3: Question Assignment (drag-drop)
   - Step 4: Scheduling
   - Step 5: Proctoring Settings
   - Step 6: Eligibility & Supervisors
   - Step 7: Review & Publish

2. **Components**
   - Exam Form Builder
   - Question Pool Selector
   - Section Manager
   - Eligibility Rules Builder
   - Schedule Calendar
   - Settings Panel (toggle-based)

3. **Advanced Features**
   - Drag-and-drop question ordering
   - Question preview in context
   - Exam calculator (total marks, duration)
   - Duplicate exam functionality
   - Template management

**Settings to Configure**:
- Duration & scheduling
- Randomization settings
- Scoring rules
- Result display options
- Proctoring requirements
- Device restrictions
- Resume & retry policies
- Negative marking

**Deliverables**:
- Complete Exam CRUD API
- Exam creation wizard UI
- Question assignment interface
- Eligibility management
- Supervisor assignment
- Exam settings panel
- Schedule management
- Exam templates

---

## 🎓 Phase 3: Student Exam Taking Flow

**Focus**: Complete exam taking experience with security and monitoring

**Backend Implementation**:
1. **Services**
   - ExamAttemptService: Session management
   - AnswerService: Save/validate answers
   - SubmissionService: Submit logic
   - AutoSaveService: Background saves
   - TimerService: Server-side timing
   - SyncService: Offline resilience

2. **API Controllers**
   - StudentExamController (available exams)
   - ExamAttemptController (start/resume/submit)
   - AnswerController (save answers)
   - ExamInstructionsController

3. **Real-time Features**
   - WebSocket for timer sync
   - Live session monitoring
   - Auto-submit on timeout

**Frontend Implementation**:
1. **Pre-Exam Flow**
   - Available Exams Dashboard
   - Exam Details Page
   - Global Instructions Screen
   - Exam-specific Instructions
   - System Check (browser, network, device)
   - Selfie Capture Component
   - Liveness Detection (if enabled)
   - Device Verification

2. **During Exam**
   - Exam Interface (clean, distraction-free)
   - Timer Component (countdown)
   - Question Navigator (sidebar)
   - Question Renderer (all types)
   - Answer Input Components
   - Mark for Review
   - Save & Continue
   - Progress Indicator
   - Auto-save indicator
   - Network status indicator

3. **Offline Resilience**
   - IndexedDB for local caching
   - Answer queue for sync
   - Connection status monitoring
   - Sync on reconnect

4. **Security Features**
   - Fullscreen lock (if enabled)
   - Right-click blocking
   - Copy/paste detection
   - Tab switch detection
   - Idle time tracking
   - Screenshot prevention

5. **Post-Submission**
   - Final confirmation dialog
   - Submission success screen
   - Result display (if immediate)
   - Review interface (if allowed)

**Features**:
- All question type renderers
- Rich text answer input
- File upload for essays
- Image annotation (if required)
- Calculator widget (if allowed)
- Formula editor (if needed)
- Time per question (optional)
- Section-wise navigation
- Bookmark questions
- Keyboard shortcuts

**Deliverables**:
- Complete exam taking API
- Pre-exam verification flow
- Exam interface with all question types
- Timer and auto-save system
- Offline mode with sync
- Answer submission logic
- Security implementations
- Review interface

---

## 👁️ Phase 4: Proctoring & Supervisor Dashboard

**Focus**: Live monitoring, violation detection, and supervisor controls

**Backend Implementation**:
1. **Services**
   - ProctoringService: Session tracking
   - ViolationDetectionService: Event logging
   - SelfieVerificationService: Face matching
   - DeviceFingerprintService: Device tracking
   - LiveSessionService: Real-time data
   - SupervisorActionService: Intervention logic

2. **API Controllers**
   - ProctoringController
   - SupervisorDashboardController
   - ViolationController
   - SelfieController
   - DeviceFingerprintController

3. **Real-time Features**
   - WebSocket for live updates
   - Event streaming
   - Pusher/Socket.io integration

4. **AI/ML Integration** (Optional)
   - Face detection API (AWS Rekognition, Azure Face)
   - Liveness detection
   - Multiple face detection
   - Audio detection
   - Screen share detection

**Frontend Implementation**:
1. **Selfie Capture**
   - Camera access component
   - Photo capture with preview
   - Liveness prompt (blink, smile, turn head)
   - Retry mechanism
   - Upload with progress

2. **Supervisor Dashboard**
   - Live session list
   - Grid view of candidates
   - Individual session detail
   - Real-time status updates
   - Violation alerts
   - Filter and search

3. **Monitoring Features**
   - Current question indicator
   - Time remaining per candidate
   - Connection status
   - Device info display
   - Violation count badges
   - Activity timeline
   - Screenshot thumbnails (if enabled)

4. **Supervisor Actions**
   - Flag candidate
   - Send message to candidate
   - Pause exam (emergency)
   - Terminate session
   - Add notes
   - Request manual verification

5. **Violation Detection**
   - Tab switch counter
   - Window blur events
   - Copy/paste attempts
   - Right-click attempts
   - Fullscreen exits
   - Network disconnections
   - Multiple faces detected
   - No face detected
   - Suspicious keyboard shortcuts

**Deliverables**:
- Selfie capture with verification
- Device fingerprinting
- Violation detection system
- Real-time supervisor dashboard
- Live session monitoring
- Supervisor action controls
- Event logging and review
- AI-based verification (optional)

---

## 📊 Phase 5: Results, Grading & Analytics

**Focus**: Auto-grading, manual grading, result publication, and analytics

**Backend Implementation**:
1. **Services**
   - GradingService: Auto-grade logic
   - ResultCalculationService: Score computation
   - RankingService: Percentile and rank
   - ItemAnalysisService: Question statistics
   - ExportService: Result exports (PDF, Excel)
   - NotificationService: Result notifications

2. **API Controllers**
   - ResultController
   - GradingController (for essay review)
   - AnalyticsController
   - ItemAnalysisController
   - ExportController

3. **Jobs & Queues**
   - AutoGradeJob (async)
   - CalculateRankingsJob
   - GenerateItemAnalysisJob
   - ExportResultsJob
   - SendResultNotificationJob

**Frontend Implementation**:
1. **Staff - Result Management**
   - Result dashboard
   - Grade pending essays
   - Bulk grade interface
   - Result review before publish
   - Publish/unpublish controls
   - Export interface

2. **Staff - Analytics**
   - Exam summary dashboard
   - Question-wise analysis
   - Item analysis charts
   - Difficulty & discrimination graphs
   - Top performers list
   - Pass/fail distribution
   - Time analysis
   - Comparative analysis

3. **Student - Result View**
   - Result card with score
   - Grade and pass status
   - Section-wise breakdown
   - Question-wise review
   - Correct answer display (if allowed)
   - Performance chart
   - Percentile and rank

4. **Charts & Visualizations**
   - Score distribution histogram
   - Difficulty vs discrimination scatter
   - Time spent per question
   - Attempt trend over time
   - Comparative bar charts

**Grading Features**:
- Auto-grade MCQ, True/False, Numeric
- Manual grade essays with rubrics
- Partial marking
- Negative marking calculation
- Section-wise grading
- Grade appeal system (optional)
- Re-grade requests

**Analytics Features**:
- Item analysis (difficulty, discrimination)
- Distractor effectiveness
- Question quality indicators
- Recommend question improvements
- Identify problematic questions
- Performance trends
- Comparative analysis

**Deliverables**:
- Auto-grading system
- Manual grading interface
- Result calculation engine
- Ranking and percentile logic
- Result publication system
- Student result view
- Analytics dashboard
- Item analysis reports
- Export functionality (PDF, Excel)

---

## 🔒 Phase 6: Security Hardening & Optimization

**Focus**: Production-ready security, performance, and deployment

**Security Implementation**:
1. **Authentication & Authorization**
   - Multi-factor authentication (optional)
   - Token rotation
   - Session management
   - Role-based access control
   - Permission checking middleware

2. **API Security**
   - Rate limiting (per user, per IP)
   - Request validation
   - SQL injection prevention
   - XSS protection
   - CSRF tokens
   - Signed URLs for files
   - API key rotation

3. **Data Security**
   - Encrypt sensitive data
   - Hash submission data
   - Tamper detection
   - Audit trail
   - Data retention policies
   - GDPR compliance (consent, deletion)

4. **Exam Security**
   - Server-side time source
   - Answer hash verification
   - Prevent clock manipulation
   - IP whitelisting
   - Device binding
   - Browser fingerprint matching
   - Suspicious activity detection

**Performance Optimization**:
1. **Database**
   - Index optimization
   - Query optimization
   - Eager loading
   - Database connection pooling
   - Read replicas (if needed)

2. **Caching**
   - Redis caching
   - Query result cache
   - API response cache
   - Static asset caching
   - CDN integration

3. **Queue & Jobs**
   - Job queue optimization
   - Failed job handling
   - Job monitoring
   - Horizon dashboard

4. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Bundle size reduction
   - Progressive Web App (PWA)

**Deployment**:
1. **Server Setup**
   - Nginx configuration
   - SSL/TLS setup
   - PHP-FPM tuning
   - Redis configuration
   - Supervisor for queue workers

2. **CI/CD Pipeline**
   - Automated testing
   - Build process
   - Deployment scripts
   - Rollback strategy

3. **Monitoring**
   - Error tracking (Sentry, Bugsnag)
   - Performance monitoring
   - Uptime monitoring
   - Log aggregation
   - Alert system

**Deliverables**:
- Security audit and fixes
- Rate limiting implementation
- Encryption for sensitive data
- Performance optimization
- Caching strategy
- Queue optimization
- Deployment documentation
- Monitoring setup
- Backup strategy
- Disaster recovery plan

---

## 📱 Optional/Future Phases

### Phase 7: Mobile App (Optional)
- React Native or Flutter app
- Offline exam mode
- Push notifications
- Biometric authentication

### Phase 8: Advanced Features (Optional)
- AI-powered question generation
- Automated essay grading (AI)
- Adaptive testing
- Gamification
- Certificate generation
- Integration with LMS (Moodle, Canvas)
- Video proctoring
- Live streaming for group exams

---

## Development Approach

### Per Phase:
1. **Backend First**: Models → Services → Controllers → Tests
2. **Frontend Next**: Pages → Components → API Integration → Tests
3. **Integration**: Connect frontend to backend
4. **Testing**: Unit tests, Integration tests, E2E tests
5. **Documentation**: API docs, User guides
6. **Review**: Code review, Security review, Performance testing

### Code Standards:
- **Backend**: PSR-12, Service Pattern, Repository Pattern
- **Frontend**: ESLint, Prettier, Component-based
- **Testing**: PHPUnit (backend), Jest/Vitest (frontend)
- **Git**: Feature branches, PR reviews, Conventional commits

### Communication:
Each phase starts with:
1. Review of previous phase
2. Phase objectives
3. Technical approach
4. Step-by-step implementation
5. Testing strategy
6. Handoff to next phase

---

## Estimated Timeline

- Phase 0: ✅ Completed
- Phase 1: 1-2 chat sessions
- Phase 2: 1-2 chat sessions
- Phase 3: 2-3 chat sessions
- Phase 4: 2-3 chat sessions
- Phase 5: 1-2 chat sessions
- Phase 6: 1-2 chat sessions

**Total**: Approximately 10-15 focused chat sessions

---

## Getting Started with Next Phase

When ready for Phase 1, say:
**"Let's start Phase 1: Question Bank Management"**

I will provide:
- All Laravel models with relationships
- Service classes with business logic
- API controllers with routes
- Form request validation
- API resources
- React components
- State management setup
- API integration code
- Step-by-step setup instructions

Let's build this CBT system together! 🚀
