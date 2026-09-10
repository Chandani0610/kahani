// src/components/dashboard/StoryDetailModal.jsx
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const StoryDetailModal = ({ story, onClose, onEdit, onDelete }) => {
  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{story.title}</h3>
            {story.author && (
              <p className="text-gray-500 text-sm">By: {story.author}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            {story.category}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            {story.age_group}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {story.read_time || '5 Min Read'}
          </span>
        </div>

        {story.image_url || story.image ? (
          <img 
            src={story.image_url || story.image} 
            alt={story.title}
            className="w-full max-h-80 object-cover rounded-lg mb-4"
          />
        ) : null}

        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {story.story || story.content}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
          <button
            onClick={() => {
              onClose();
              onEdit(story);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PencilIcon className="w-4 h-4 inline mr-2" />
            Edit Story
          </button>
          <button
            onClick={() => onDelete(story)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="w-4 h-4 inline mr-2" />
            Delete Story
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailModal;