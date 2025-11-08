<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TopicController extends Controller
{
    /**
     * Get topics by subject
     */
    public function index(Request $request): JsonResponse
    {
        $query = Topic::active()->with('subject');

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $topics = $query->orderBy('display_order')->get();

        return response()->json([
            'success' => true,
            'data' => $topics,
        ]);
    }

    /**
     * Get a single topic
     */
    public function show(int $id): JsonResponse
    {
        $topic = Topic::with(['subject', 'parentTopic', 'childTopics'])
            ->find($id);

        if (!$topic) {
            return response()->json([
                'success' => false,
                'message' => 'Topic not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $topic,
        ]);
    }

    /**
     * Store a new topic
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_topic_id' => 'nullable|exists:topics,id',
            'is_active' => 'boolean',
            'display_order' => 'integer|min:0',
        ]);

        $topic = Topic::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Topic created successfully',
            'data' => $topic->load('subject'),
        ], 201);
    }

    /**
     * Update a topic
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $topic = Topic::find($id);

        if (!$topic) {
            return response()->json([
                'success' => false,
                'message' => 'Topic not found',
            ], 404);
        }

        $validated = $request->validate([
            'subject_id' => 'exists:subjects,id',
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'parent_topic_id' => 'nullable|exists:topics,id',
            'is_active' => 'boolean',
            'display_order' => 'integer|min:0',
        ]);

        $topic->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Topic updated successfully',
            'data' => $topic->load('subject'),
        ]);
    }

    /**
     * Delete a topic
     */
    public function destroy(int $id): JsonResponse
    {
        $topic = Topic::find($id);

        if (!$topic) {
            return response()->json([
                'success' => false,
                'message' => 'Topic not found',
            ], 404);
        }

        $topic->delete();

        return response()->json([
            'success' => true,
            'message' => 'Topic deleted successfully',
        ]);
    }
}