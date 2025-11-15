import useExamStore from '../../../store/examStore';
import { Shield, Eye, Camera, Monitor, AlertTriangle, Calendar } from 'lucide-react';

export default function ResultsProctoringStep({ errors }) {
  const { examFormData, updateExamFormData } = useExamStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Results & Proctoring
        </h2>
        <p className="text-gray-600 mb-6">
          Configure how and when results are displayed, and enable proctoring features
        </p>
      </div>

      {/* Result Display Settings */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="text-gray-600" size={20} />
          <h3 className="font-medium text-gray-900">Result Display Settings</h3>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When to show results
          </label>
          <select
            value={examFormData.result_display}
            onChange={(e) => updateExamFormData({ result_display: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="immediate">Immediately after submission</option>
            <option value="scheduled">At a scheduled date/time</option>
            <option value="manual">Manually by instructor</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose when students can view their exam results
          </p>
        </div>

        {examFormData.result_display === 'scheduled' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Result Publish Date & Time
            </label>
            <input
              type="datetime-local"
              value={examFormData.result_publish_datetime}
              onChange={(e) => updateExamFormData({ result_publish_datetime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Results will be automatically published at this date and time
            </p>
          </div>
        )}

        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">What to show to students:</h4>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show_score_breakdown"
              checked={examFormData.show_score_breakdown}
              onChange={(e) => updateExamFormData({ show_score_breakdown: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="show_score_breakdown" className="text-sm text-gray-700">
              Show score breakdown (marks per section/question)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show_correct_answers"
              checked={examFormData.show_correct_answers}
              onChange={(e) => updateExamFormData({ show_correct_answers: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="show_correct_answers" className="text-sm text-gray-700">
              Show correct answers to students
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allow_review_after_submit"
              checked={examFormData.allow_review_after_submit}
              onChange={(e) => updateExamFormData({ allow_review_after_submit: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="allow_review_after_submit" className="text-sm text-gray-700">
              Allow students to review their answers after submission
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show_answer_explanations"
              checked={examFormData.show_answer_explanations}
              onChange={(e) => updateExamFormData({ show_answer_explanations: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="show_answer_explanations" className="text-sm text-gray-700">
              Show answer explanations/solutions
            </label>
          </div>
        </div>
      </div>

      {/* Proctoring & Security Settings */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="text-gray-600" size={20} />
          <h3 className="font-medium text-gray-900">Proctoring & Security Settings</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Enable security features to maintain exam integrity
        </p>

        {/* Identity Verification */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Camera size={16} />
            Identity Verification
          </h4>
          
          <div className="flex items-center gap-2 pl-6">
            <input
              type="checkbox"
              id="require_selfie"
              checked={examFormData.require_selfie}
              onChange={(e) => updateExamFormData({ require_selfie: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="require_selfie" className="text-sm text-gray-700">
              Require selfie verification before exam starts
            </label>
          </div>

          <div className="flex items-center gap-2 pl-6">
            <input
              type="checkbox"
              id="enable_webcam_monitoring"
              checked={examFormData.enable_webcam_monitoring}
              onChange={(e) => updateExamFormData({ enable_webcam_monitoring: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="enable_webcam_monitoring" className="text-sm text-gray-700">
              Enable webcam monitoring during exam
            </label>
          </div>
        </div>

        {/* Screen Monitoring */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Monitor size={16} />
            Screen & Browser Security
          </h4>

          <div className="flex items-center gap-2 pl-6">
            <input
              type="checkbox"
              id="lock_fullscreen"
              checked={examFormData.lock_fullscreen}
              onChange={(e) => updateExamFormData({ lock_fullscreen: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="lock_fullscreen" className="text-sm text-gray-700">
              Lock exam in fullscreen mode
            </label>
          </div>

          <div className="flex items-center gap-2 pl-6">
            <input
              type="checkbox"
              id="enable_tab_switch_detection"
              checked={examFormData.enable_tab_switch_detection}
              onChange={(e) => updateExamFormData({ enable_tab_switch_detection: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="enable_tab_switch_detection" className="text-sm text-gray-700">
              Detect and log tab switches
            </label>
          </div>

          {examFormData.enable_tab_switch_detection && (
            <div className="pl-12">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Tab Switches Allowed
              </label>
              <input
                type="number"
                value={examFormData.max_tab_switches_allowed}
                onChange={(e) => updateExamFormData({ 
                  max_tab_switches_allowed: parseInt(e.target.value) 
                })}
                min="0"
                placeholder="e.g., 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Set to 0 for unlimited switches (logging only)
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pl-6">
            <input
              type="checkbox"
              id="enable_screen_monitoring"
              checked={examFormData.enable_screen_monitoring}
              onChange={(e) => updateExamFormData({ enable_screen_monitoring: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="enable_screen_monitoring" className="text-sm text-gray-700">
              Enable screen recording during exam
            </label>
          </div>

          <div className="flex items-center gap-2 pl-6">
            <input
              type="checkbox"
              id="disable_copy_paste"
              checked={examFormData.disable_copy_paste}
              onChange={(e) => updateExamFormData({ disable_copy_paste: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="disable_copy_paste" className="text-sm text-gray-700">
              Disable copy/paste operations
            </label>
          </div>

          <div className="flex items-center gap-2 pl-6">
            <input
              type="checkbox"
              id="disable_right_click"
              checked={examFormData.disable_right_click}
              onChange={(e) => updateExamFormData({ disable_right_click: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="disable_right_click" className="text-sm text-gray-700">
              Disable right-click context menu
            </label>
          </div>
        </div>

        {/* AI Detection */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <AlertTriangle size={16} />
            Advanced Monitoring
          </h4>

          <div className="flex items-center gap-2 pl-6">
            <input
              type="checkbox"
              id="enable_keystroke_analytics"
              checked={examFormData.enable_keystroke_analytics}
              onChange={(e) => updateExamFormData({ enable_keystroke_analytics: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="enable_keystroke_analytics" className="text-sm text-gray-700">
              Enable keystroke pattern analytics
            </label>
          </div>

          <div className="flex items-center gap-2 pl-6">
            <input
              type="checkbox"
              id="enable_ai_detection"
              checked={examFormData.enable_ai_detection}
              onChange={(e) => updateExamFormData({ enable_ai_detection: e.target.checked })}
              className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="enable_ai_detection" className="text-sm text-gray-700">
              Flag suspicious answer patterns (AI detection)
            </label>
          </div>
        </div>
      </div>

      {/* Warning for Proctoring */}
      {(examFormData.require_selfie || 
        examFormData.lock_fullscreen || 
        examFormData.enable_tab_switch_detection ||
        examFormData.enable_webcam_monitoring ||
        examFormData.enable_screen_monitoring) && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-yellow-900">
              <strong>Proctoring Features Enabled:</strong> Students will be informed about 
              the security measures in place before starting the exam. Make sure students 
              have compatible devices and browsers for the best experience.
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h3 className="font-medium text-primary-900 mb-3 flex items-center gap-2">
          <Calendar size={20} />
          Exam Summary
        </h3>
        <div className="space-y-2 text-sm text-primary-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-1">Basic Details:</p>
              <ul className="space-y-1 text-xs">
                <li>• Title: {examFormData.title || 'Not set'}</li>
                <li>• Duration: {examFormData.duration_minutes} minutes</li>
                <li>• Questions: {examFormData.questions?.length || 0}</li>
                <li>• Total Marks: {
                  examFormData.questions?.reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0).toFixed(2) || '0.00'
                }</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-1">Settings:</p>
              <ul className="space-y-1 text-xs">
                <li>• Max Attempts: {examFormData.max_attempts}</li>
                <li>• Pass Marks: {examFormData.pass_marks || 'Not set'}</li>
                <li>• Result Display: {examFormData.result_display}</li>
                <li>• Proctoring: {
                  (examFormData.require_selfie || examFormData.lock_fullscreen || examFormData.enable_tab_switch_detection)
                    ? 'Enabled'
                    : 'Disabled'
                }</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Ready to Create */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-900">
          <strong>✓ Ready to Create:</strong> Review your settings above. Click "Create Exam" 
          to finalize and save this exam configuration.
        </p>
      </div>
    </div>
  );
}