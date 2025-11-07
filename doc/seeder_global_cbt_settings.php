<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GlobalCbtSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General Settings
            [
                'key' => 'system_name',
                'value' => 'CBT System',
                'type' => 'string',
                'group' => 'general',
                'description' => 'System display name',
                'is_public' => true,
            ],
            [
                'key' => 'system_timezone',
                'value' => 'UTC',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Default system timezone',
                'is_public' => false,
            ],
            [
                'key' => 'default_exam_duration',
                'value' => '60',
                'type' => 'integer',
                'group' => 'general',
                'description' => 'Default exam duration in minutes',
                'is_public' => false,
            ],
            [
                'key' => 'auto_save_interval',
                'value' => '30',
                'type' => 'integer',
                'group' => 'general',
                'description' => 'Auto-save interval in seconds',
                'is_public' => true,
            ],
            
            // Global Instructions
            [
                'key' => 'global_exam_instructions',
                'value' => json_encode([
                    'Read all questions carefully before answering',
                    'Ensure stable internet connection throughout the exam',
                    'Do not refresh or close the browser during exam',
                    'Submit your exam before the time expires',
                    'Contact support if you face any technical issues'
                ]),
                'type' => 'json',
                'group' => 'general',
                'description' => 'Global instructions shown before all exams',
                'is_public' => true,
            ],
            
            // Proctoring Settings
            [
                'key' => 'enable_proctoring',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'proctoring',
                'description' => 'Enable proctoring features globally',
                'is_public' => false,
            ],
            [
                'key' => 'require_selfie_verification',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'proctoring',
                'description' => 'Require selfie before exam start',
                'is_public' => true,
            ],
            [
                'key' => 'selfie_capture_interval',
                'value' => '300',
                'type' => 'integer',
                'group' => 'proctoring',
                'description' => 'Random selfie capture interval in seconds (0 = disabled)',
                'is_public' => false,
            ],
            [
                'key' => 'enable_liveness_detection',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'proctoring',
                'description' => 'Enable AI-based liveness detection',
                'is_public' => false,
            ],
            [
                'key' => 'enable_tab_monitoring',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'proctoring',
                'description' => 'Track tab switches and window blur events',
                'is_public' => true,
            ],
            [
                'key' => 'max_tab_switches',
                'value' => '3',
                'type' => 'integer',
                'group' => 'proctoring',
                'description' => 'Maximum allowed tab switches before flagging (0 = unlimited)',
                'is_public' => true,
            ],
            [
                'key' => 'enable_fullscreen_lock',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'proctoring',
                'description' => 'Force fullscreen mode during exam',
                'is_public' => true,
            ],
            
            // Security Settings
            [
                'key' => 'enable_copy_paste_detection',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'description' => 'Detect copy/paste attempts',
                'is_public' => false,
            ],
            [
                'key' => 'enable_right_click_blocking',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'description' => 'Block right-click context menu',
                'is_public' => true,
            ],
            [
                'key' => 'enable_print_blocking',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'description' => 'Block print screen attempts',
                'is_public' => false,
            ],
            [
                'key' => 'session_timeout_minutes',
                'value' => '30',
                'type' => 'integer',
                'group' => 'security',
                'description' => 'Idle session timeout in minutes',
                'is_public' => false,
            ],
            [
                'key' => 'enable_device_fingerprinting',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'security',
                'description' => 'Collect device fingerprint data',
                'is_public' => false,
            ],
            [
                'key' => 'allowed_ip_whitelist',
                'value' => json_encode([]),
                'type' => 'json',
                'group' => 'security',
                'description' => 'Allowed IP addresses (empty = allow all)',
                'is_public' => false,
            ],
            
            // File Upload Settings
            [
                'key' => 'max_file_upload_size_mb',
                'value' => '10',
                'type' => 'integer',
                'group' => 'files',
                'description' => 'Maximum file upload size in MB',
                'is_public' => true,
            ],
            [
                'key' => 'allowed_file_types',
                'value' => json_encode(['pdf', 'doc', 'docx', 'jpg', 'png', 'jpeg']),
                'type' => 'json',
                'group' => 'files',
                'description' => 'Allowed file types for essay uploads',
                'is_public' => true,
            ],
            
            // Results & Grading
            [
                'key' => 'auto_publish_results',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'results',
                'description' => 'Automatically publish results after grading',
                'is_public' => false,
            ],
            [
                'key' => 'show_correct_answers_default',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'results',
                'description' => 'Show correct answers by default',
                'is_public' => false,
            ],
            [
                'key' => 'allow_exam_review_default',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'results',
                'description' => 'Allow students to review exam after submission',
                'is_public' => false,
            ],
            
            // Notifications
            [
                'key' => 'notify_on_exam_start',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'notifications',
                'description' => 'Send notification when exam starts',
                'is_public' => false,
            ],
            [
                'key' => 'notify_on_exam_submit',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'notifications',
                'description' => 'Send notification when exam is submitted',
                'is_public' => false,
            ],
            [
                'key' => 'notify_on_result_publish',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'notifications',
                'description' => 'Send notification when results are published',
                'is_public' => false,
            ],
            
            // Integration
            [
                'key' => 'integration_mode',
                'value' => 'same_database',
                'type' => 'string',
                'group' => 'integration',
                'description' => 'Integration mode with school system (same_database or microservice)',
                'is_public' => false,
            ],
            [
                'key' => 'school_api_url',
                'value' => '',
                'type' => 'string',
                'group' => 'integration',
                'description' => 'School Management System API URL (for microservice mode)',
                'is_public' => false,
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('global_cbt_settings')->insert(array_merge($setting, [
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]));
        }
    }
}
