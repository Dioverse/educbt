import { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Copy, 
  MoreVertical,
  Eye,
  Calendar,
  Clock,
  FileQuestion,
  Award,
  Play,
  Archive,
  Upload as Publish,
} from 'lucide-react';
import { format } from 'date-fns';

export default function ExamCard({ 
  exam, 
  onDelete, 
  onDuplicate, 
  onView,
  onPublish,
  onActivate,
  onArchive,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-primary-100 text-primary-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    archived: 'bg-red-100 text-red-800',
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title and Status */}
            <div className="flex items-center gap-3 mb-2">
              <h3
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-primary-600"
                onClick={() => onView(exam.id)}
              >
                {exam.title}
              </h3>
              <span className={`px-2 py-1 text-xs rounded ${statusColors[exam.status]}`}>
                {getStatusLabel(exam.status)}
              </span>
              {exam.is_upcoming && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  Upcoming
                </span>
              )}
              {exam.is_ongoing && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1">
                  <Play size={12} />
                  Live
                </span>
              )}
            </div>

            {/* Code */}
            <p className="text-sm text-gray-500 mb-3">
              {exam.code}
            </p>

            {/* Description */}
            {exam.description && (
              <p className="text-gray-700 mb-4 line-clamp-2">
                {exam.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>{exam.duration_minutes} mins</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileQuestion size={16} />
                <span>{exam.total_questions || 0} questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award size={16} />
                <span>{exam.total_marks || 0} marks</span>
              </div>
              {exam.is_scheduled && exam.start_datetime && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>{format(new Date(exam.start_datetime), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>

            {/* Subject and Grade */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {exam.subject && (
                <span>
                  <span className="font-medium">Subject:</span> {exam.subject.name}
                </span>
              )}
              {exam.grade_level && (
                <span>
                  <span className="font-medium">Grade:</span> {exam.grade_level.name}
                </span>
              )}
              {exam.attempts_count !== undefined && (
                <span>
                  <span className="font-medium">Attempts:</span> {exam.attempts_count}
                </span>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                
                
                {/* // Update the actions column */}
              <div className="flex gap-2">
                <button
                  // eslint-disable-next-line no-undef
                  onClick={() => navigate(`/exams/${exam.id}`)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                  title="View Exam"
                >
                  <Eye size={20} />
                </button>
  
                <button
                  // eslint-disable-next-line no-undef
                  onClick={() => navigate(`/exams/${exam.id}/edit`)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Edit Exam"
                >
                  <Edit size={20} />
                </button>
                
                {exam.status === 'active' && (
                  <button
                    onClick={() => navigate(`/proctoring/live/${exam.id}`)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Live Monitoring"
                  >
                    <Eye size={20} />
                  </button>
                )}
                
                <button
                  // eslint-disable-next-line no-undef
                  onClick={() => handleDelete(exam.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete Exam"
                >
                  <Trash2 size={20} />
                </button>
              </div>


                <button
                  onClick={() => {
                    onDuplicate(exam.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy size={16} />
                  Duplicate
                </button>
                
                {exam.status === 'draft' && (
                  <button
                    onClick={() => {
                      onPublish(exam.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-primary-600"
                  >
                    <Publish size={16} />
                    Publish
                  </button>
                )}

                {exam.status === 'published' && (
                  <button
                    onClick={() => {
                      onActivate(exam.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-green-600"
                  >
                    <Play size={16} />
                    Activate
                  </button>
                )}

                {['published', 'active', 'completed'].includes(exam.status) && (
                  <button
                    onClick={() => {
                      onArchive(exam.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-orange-600"
                  >
                    <Archive size={16} />
                    Archive
                  </button>
                )}

                <button
                  onClick={() => {
                    onDelete(exam.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}