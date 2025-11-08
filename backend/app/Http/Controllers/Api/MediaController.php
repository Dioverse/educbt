<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuestionAttachment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Upload question attachment
     */
    public function uploadQuestionAttachment(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'question_id' => 'required|exists:questions,id',
            'type' => 'required|in:image,audio,video,document',
            'context' => 'required|in:question,option,explanation',
        ]);

        try {
            $file = $request->file('file');
            $type = $request->input('type');
            
            // Determine storage path based on type
            $path = "questions/{$type}s";
            
            // Generate unique filename
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            
            // Store file
            $filePath = $file->storeAs($path, $filename, 'public');
            
            // Get file info
            $fileSize = $file->getSize();
            $mimeType = $file->getMimeType();
            
            // Create attachment record
            $attachment = QuestionAttachment::create([
                'question_id' => $request->question_id,
                'type' => $type,
                'context' => $request->context,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_url' => Storage::url($filePath),
                'mime_type' => $mimeType,
                'file_size' => $fileSize,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'File uploaded successfully',
                'data' => $attachment,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete attachment
     */
    public function deleteAttachment(int $id): JsonResponse
    {
        try {
            $attachment = QuestionAttachment::find($id);

            if (!$attachment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attachment not found',
                ], 404);
            }

            // Delete file from storage
            Storage::disk('public')->delete($attachment->file_path);

            // Delete record
            $attachment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Attachment deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete attachment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}