<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GradingRubric;
use App\Models\RubricCriterion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RubricController extends Controller
{
    /**
     * Get all rubrics
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = GradingRubric::with(['criteria', 'subject', 'creator']);

            // Filter by subject
            if ($request->has('subject_id')) {
                $query->where('subject_id', $request->subject_id);
            }

            // Filter by question type
            if ($request->has('question_type')) {
                $query->where('question_type', $request->question_type);
            }

            $rubrics = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $rubrics,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve rubrics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single rubric
     */
    public function show(int $id): JsonResponse
    {
        try {
            $rubric = GradingRubric::with(['criteria', 'subject', 'creator'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $rubric,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Rubric not found',
            ], 404);
        }
    }

    /**
     * Create rubric
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'nullable|exists:subjects,id',
            'question_type' => 'required|in:essay,short_answer,file_upload,all',
            'max_score' => 'required|numeric|min:0',
            'is_default' => 'boolean',
            'criteria' => 'required|array|min:1',
            'criteria.*.criterion_name' => 'required|string',
            'criteria.*.description' => 'nullable|string',
            'criteria.*.max_points' => 'required|numeric|min:0',
            'criteria.*.weight_percentage' => 'required|integer|min:0|max:100',
            'criteria.*.performance_levels' => 'nullable|array',
        ]);

        DB::beginTransaction();

        try {
            // Create rubric
            $rubric = GradingRubric::create([
                'name'          => $request->name,
                'description'   => $request->description,
                'subject_id'    => $request->subject_id,
                'question_type' => $request->question_type,
                'max_score'     => $request->max_score,
                'is_default'    => $request->is_default ?? false,
                'created_by'    => Auth::id(),
            ]);

            // Create criteria
            foreach ($request->criteria as $index => $criterion) {
                RubricCriterion::create([
                    'rubric_id' => $rubric->id,
                    'criterion_name' => $criterion['criterion_name'],
                    'description' => $criterion['description'] ?? null,
                    'max_points' => $criterion['max_points'],
                    'weight_percentage' => $criterion['weight_percentage'],
                    'display_order' => $index + 1,
                    'performance_levels' => $criterion['performance_levels'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rubric created successfully',
                'data' => $rubric->load('criteria'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create rubric',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update rubric
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'nullable|exists:subjects,id',
            'question_type' => 'required|in:essay,short_answer,file_upload,all',
            'max_score' => 'required|numeric|min:0',
            'is_default' => 'boolean',
            'criteria' => 'required|array|min:1',
            'criteria.*.criterion_name' => 'required|string',
            'criteria.*.max_points' => 'required|numeric|min:0',
            'criteria.*.weight_percentage' => 'required|integer|min:0|max:100',
        ]);

        DB::beginTransaction();

        try {
            $rubric = GradingRubric::findOrFail($id);

            // Update rubric
            $rubric->update([
                'name' => $request->name,
                'description' => $request->description,
                'subject_id' => $request->subject_id,
                'question_type' => $request->question_type,
                'max_score' => $request->max_score,
                'is_default' => $request->is_default ?? false,
            ]);

            // Delete old criteria
            $rubric->criteria()->delete();

            // Create new criteria
            foreach ($request->criteria as $index => $criterion) {
                RubricCriterion::create([
                    'rubric_id' => $rubric->id,
                    'criterion_name' => $criterion['criterion_name'],
                    'description' => $criterion['description'] ?? null,
                    'max_points' => $criterion['max_points'],
                    'weight_percentage' => $criterion['weight_percentage'],
                    'display_order' => $index + 1,
                    'performance_levels' => $criterion['performance_levels'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rubric updated successfully',
                'data' => $rubric->fresh('criteria'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update rubric',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete rubric
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $rubric = GradingRubric::findOrFail($id);
            $rubric->delete();

            return response()->json([
                'success' => true,
                'message' => 'Rubric deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete rubric',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
