<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubjectController extends Controller
{
    /**
     * Get all subjects
     */
    public function index(): JsonResponse
    {
        $subjects = Subject::active()
            ->withCount('questions')
            ->orderBy('display_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subjects,
        ]);
    }

    /**
     * Get a single subject
     */
    public function show(int $id): JsonResponse
    {
        $subject = Subject::with(['topics' => function ($query) {
            $query->active()->orderBy('display_order');
        }])->find($id);

        if (!$subject) {
            return response()->json([
                'success' => false,
                'message' => 'Subject not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $subject,
        ]);
    }

    /**
     * Store a new subject
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:subjects,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'display_order' => 'integer|min:0',
        ]);

        $subject = Subject::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Subject created successfully',
            'data' => $subject,
        ], 201);
    }

    /**
     * Update a subject
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $subject = Subject::find($id);

        if (!$subject) {
            return response()->json([
                'success' => false,
                'message' => 'Subject not found',
            ], 404);
        }

        $validated = $request->validate([
            'code' => 'string|max:20|unique:subjects,code,' . $id,
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
            'display_order' => 'integer|min:0',
        ]);

        $subject->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Subject updated successfully',
            'data' => $subject,
        ]);
    }

    /**
     * Delete a subject
     */
    public function destroy(int $id): JsonResponse
    {
        $subject = Subject::find($id);

        if (!$subject) {
            return response()->json([
                'success' => false,
                'message' => 'Subject not found',
            ], 404);
        }

        $subject->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subject deleted successfully',
        ]);
    }
}