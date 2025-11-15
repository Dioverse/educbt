<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeviceFingerprint extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_attempt_id',
        'user_id',
        'fingerprint_hash',
        'user_agent',
        'browser_name',
        'browser_version',
        'os_name',
        'os_version',
        'device_type',
        'device_vendor',
        'device_model',
        'screen_resolution',
        'screen_width',
        'screen_height',
        'color_depth',
        'pixel_ratio',
        'available_width',
        'available_height',
        'orientation',
        'ip_address',
        'isp',
        'country',
        'region',
        'city',
        'timezone',
        'plugins',
        'fonts',
        'cookies_enabled',
        'local_storage_enabled',
        'session_storage_enabled',
        'indexed_db_enabled',
        'canvas_fingerprint',
        'webgl_fingerprint',
        'audio_fingerprint',
        'is_virtual_machine',
        'is_emulator',
        'has_touch_support',
        'max_touch_points',
        'media_devices',
        'cpu_cores',
        'memory_gb',
        'gpu_vendor',
        'gpu_renderer',
        'trust_score',
        'anomaly_flags',
        'captured_at',
    ];

    protected $casts = [
        'plugins' => 'array',
        'fonts' => 'array',
        'media_devices' => 'array',
        'anomaly_flags' => 'array',
        'cookies_enabled' => 'boolean',
        'local_storage_enabled' => 'boolean',
        'session_storage_enabled' => 'boolean',
        'indexed_db_enabled' => 'boolean',
        'is_virtual_machine' => 'boolean',
        'is_emulator' => 'boolean',
        'has_touch_support' => 'boolean',
        'trust_score' => 'decimal:4',
        'pixel_ratio' => 'decimal:2',
        'captured_at' => 'datetime',
    ];

    // Relationships
    public function examAttempt()
    {
        return $this->belongsTo(ExamAttempt::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function isSuspicious()
    {
        return $this->trust_score < 0.5 || $this->is_virtual_machine || $this->is_emulator;
    }
}
