// src/pages/admin/AdminStories.jsx

import { useEffect, useRef, useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  
} from "@heroicons/react/24/outline";

import storyService from "../../services/storyService";

// ============================================================
// CONSTANTS
// ============================================================

const API_BASE_URL = "http://localhost:5000/api";

const EMPTY_FORM = {
  title: "",
  category_id: "",
  age_group: "",
  story: "",
  description: "",
  language: "English",
  status: "published",
  read_time: "",
  author: "",
  image: null,
  remove_image: false,
};

const AGE_GROUPS = [
  "Nursery",
  "LKG",
  "UKG",
  "3-5",
  "5-7",
  "7-9",
  "9-12",
];

const FALLBACK_LANGUAGES = [
  { id: 1, name: "English" },
  { id: 2, name: "Hindi" },
  { id: 3, name: "Maithili" },
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// ============================================================
// IMAGE COMPONENT
// ============================================================

const StoryImage = ({ story, className = "" }) => {
  const [failedImage, setFailedImage] = useState(null);

  const image = story?.image || story?.image_url || "";

  if (!image || failedImage === image) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <PhotoIcon className="w-10 h-10 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={story?.title || "Story"}
      className={`object-cover ${className}`}
      onError={() => setFailedImage(image)}
    />
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AdminStories() {
  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ----------------------------------------------------------
  // SEARCH
  // ----------------------------------------------------------

  const [search, setSearch] = useState("");

  // ----------------------------------------------------------
  // STORY MODAL
  // ----------------------------------------------------------

  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  // ----------------------------------------------------------
  // CATEGORY MODAL
  // ----------------------------------------------------------

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] =
    useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // ----------------------------------------------------------
  // IMAGE
  // ----------------------------------------------------------

  const [imagePreview, setImagePreview] = useState(null);

  const imageInputRef = useRef(null);

  // ----------------------------------------------------------
  // FORM
  // ----------------------------------------------------------

  const [formData, setFormData] = useState(EMPTY_FORM);

  // ----------------------------------------------------------
  // NOTIFICATION
  // ----------------------------------------------------------

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // ==========================================================
  // NOTIFICATION
  // ==========================================================

  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setNotification({
        show: false,
        type: "",
        message: "",
      });
    }, 3000);
  };

  // ==========================================================
  // LOAD STORIES
  // ==========================================================

  const loadStories = async () => {
    try {
      const response = await storyService.getAll();

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.stories)) {
        data = response.stories;
      }

      setStories(data);
    } catch (error) {
      console.error("Failed to load stories:", error);

      showNotification(
        "error",
        error?.message || "Failed to load stories"
      );
    }
  };

  // ==========================================================
  // LOAD CATEGORIES
  // ==========================================================

  const loadCategories = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/story-categories`
      );

      if (!response.ok) {
        throw new Error(
          `Category API failed: ${response.status}`
        );
      }

      const result = await response.json();

      let data = [];

      if (Array.isArray(result)) {
        data = result;
      } else if (Array.isArray(result?.data)) {
        data = result.data;
      } else if (Array.isArray(result?.categories)) {
        data = result.categories;
      }

      setCategories(data);

      console.log("✅ Loaded categories:", data);
    } catch (error) {
      console.error("Failed to load categories:", error);

      // Existing categories from your database
      setCategories([
        { id: 1, name: "Animals" },
        { id: 2, name: "Adventure" },
        { id: 3, name: "Moral" },
        { id: 4, name: "Science" },
        { id: 5, name: "Educational" },
        { id: 6, name: "Bedtime" },
        { id: 7, name: "Fairy Tales" },
        { id: 8, name: "Panchatantra" },
        { id: 15, name: "Moral Story" },
        { id: 16, name: "Fantasy" },
        { id: 17, name: "Friendship" },
        { id: 18, name: "Bedtime Story" },
        { id: 19, name: "Animal Tales" },
      ]);
    }
  };

  // ==========================================================
  // LOAD LANGUAGES
  // ==========================================================

  const loadLanguages = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/languages`
      );

      if (!response.ok) {
        throw new Error(
          `Language API failed: ${response.status}`
        );
      }

      const result = await response.json();

      let data = [];

      if (Array.isArray(result)) {
        data = result;
      } else if (Array.isArray(result?.data)) {
        data = result.data;
      } else if (Array.isArray(result?.languages)) {
        data = result.languages;
      }

      if (data.length > 0) {
        setLanguages(data);
      } else {
        setLanguages(FALLBACK_LANGUAGES);
      }
    } catch (error) {
      console.error("Failed to load languages:", error);
      setLanguages(FALLBACK_LANGUAGES);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        loadStories(),
        loadCategories(),
        loadLanguages(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ==========================================================
  // HANDLE FORM CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================================
  // IMAGE UPLOAD
  // ==========================================================

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showNotification(
        "error",
        "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
      );

      e.target.value = "";
      return;
    }

    // Validate size
    if (file.size > MAX_IMAGE_SIZE) {
      showNotification(
        "error",
        "Image size must be less than 10 MB."
      );

      e.target.value = "";
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);

    setFormData((prev) => ({
      ...prev,
      image: file,
      remove_image: false,
    }));
  };

  // ==========================================================
  // REMOVE IMAGE
  // ==========================================================

  const removeImage = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(null);

    setFormData((prev) => ({
      ...prev,
      image: null,
      remove_image: Boolean(editingStory),
    }));

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // ==========================================================
  // CALCULATE READ TIME
  // ==========================================================

  const calculateReadTime = (text) => {
    if (!text) {
      return 1;
    }

    const words = text.trim().split(/\s+/).length;

    return Math.max(1, Math.ceil(words / 150));
  };

  // ==========================================================
  // OPEN CREATE MODAL
  // ==========================================================

  const handleAddStory = () => {
    setEditingStory(null);
    setFormData(EMPTY_FORM);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setShowModal(true);
  };

  // ==========================================================
  // OPEN EDIT MODAL
  // ==========================================================

  const handleEditStory = (story) => {
    setEditingStory(story);

    setFormData({
      title: story.title || "",
      category_id:
        story.category_id !== null &&
        story.category_id !== undefined
          ? String(story.category_id)
          : "",
      age_group: story.age_group || "",
      story: story.story || "",
      description: story.description || "",
      language: story.language || "English",
      status: story.status || "published",
      read_time: story.read_time || "",
      author: story.author || "",
      image: null,
      remove_image: false,
    });

    setImagePreview(story.image || story.image_url || null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setShowModal(true);
  };

  // ==========================================================
  // CLOSE STORY MODAL
  // ==========================================================

  const closeModal = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setShowModal(false);
    setEditingStory(null);
    setFormData(EMPTY_FORM);
    setImagePreview(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // ==========================================================
  // ADD CATEGORY
  // ==========================================================

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();

    if (!name) {
      showNotification(
        "error",
        "Please enter category name."
      );
      return;
    }

    try {
      setIsAddingCategory(true);

      const response = await fetch(
        `${API_BASE_URL}/story-categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description: newCategoryDescription.trim(),
            status: "active",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to add category"
        );
      }

      const newCategory =
        result?.data ||
        result?.category ||
        result;

      if (!newCategory?.id) {
        throw new Error(
          "Category created but category ID was not returned."
        );
      }

      // Add new category to dropdown
      setCategories((prev) => {
        const exists = prev.some(
          (item) =>
            Number(item.id) === Number(newCategory.id)
        );

        if (exists) {
          return prev;
        }

        return [...prev, newCategory];
      });

      // Automatically select new category
      setFormData((prev) => ({
        ...prev,
        category_id: String(newCategory.id),
      }));

      setNewCategoryName("");
      setNewCategoryDescription("");
      setShowCategoryModal(false);

      showNotification(
        "success",
        "Category added successfully."
      );
    } catch (error) {
      console.error("Add category error:", error);

      showNotification(
        "error",
        error?.message || "Failed to add category."
      );
    } finally {
      setIsAddingCategory(false);
    }
  };

  // ==========================================================
  // SUBMIT STORY
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      showNotification(
        "error",
        "Please enter story title."
      );
      return;
    }

    if (!formData.category_id) {
      showNotification(
        "error",
        "Please select a category."
      );
      return;
    }

    if (!formData.age_group) {
      showNotification(
        "error",
        "Please select age group."
      );
      return;
    }

    if (!formData.story.trim()) {
      showNotification(
        "error",
        "Please enter story content."
      );
      return;
    }

    try {
      setSaving(true);

      const calculatedReadTime = calculateReadTime(
        formData.story
      );

      // IMPORTANT:
      // Only send image if user selected a NEW file.
      //
      // This prevents an existing image from being removed
      // during edit when no new image is selected.
      const hasNewImage =
        formData.image instanceof File ||
        formData.image instanceof Blob;

      const storyData = {
        title: formData.title.trim(),
        category_id: parseInt(
          formData.category_id,
          10
        ),
        age_group: formData.age_group,
        story: formData.story.trim(),
        description: formData.description.trim(),
        language: formData.language,
        status: formData.status,
        read_time: calculatedReadTime,
        author: formData.author.trim(),
        remove_image:
          formData.remove_image === true,
      };

      if (hasNewImage) {
        storyData.image = formData.image;
      }

      console.log(
        "📤 Sending story:",
        storyData
      );

      let response;

      if (editingStory) {
        response = await storyService.update(
          editingStory.id,
          storyData
        );
      } else {
        response = await storyService.create(
          storyData
        );
      }

      console.log(
        "✅ Story save response:",
        response
      );

      showNotification(
        "success",
        editingStory
          ? "Story updated successfully."
          : "Story created successfully."
      );

      closeModal();

      await loadStories();
    } catch (error) {
      console.error(
        "❌ Save story error:",
        error
      );

      showNotification(
        "error",
        error?.message ||
          "Failed to save story."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE STORY
  // ==========================================================

  const handleDeleteStory = async (story) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${story.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await storyService.delete(story.id);

      showNotification(
        "success",
        "Story deleted successfully."
      );

      await loadStories();
    } catch (error) {
      console.error(
        "Delete story error:",
        error
      );

      showNotification(
        "error",
        error?.message ||
          "Failed to delete story."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================================
  // FILTER STORIES
  // ==========================================================

  const filteredStories = stories.filter((story) => {
    const searchText = search
      .trim()
      .toLowerCase();

    if (!searchText) {
      return true;
    }

    return (
      story.title
        ?.toLowerCase()
        .includes(searchText) ||
      story.description
        ?.toLowerCase()
        .includes(searchText) ||
      story.author
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  // ==========================================================
  // CATEGORY NAME
  // ==========================================================

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) =>
        Number(item.id) === Number(categoryId)
    );

    return (
      category?.name ||
      category?.title ||
      "Uncategorized"
    );
  };

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-blue-50 p-4 md:p-6">

      {/* ======================================================
          NOTIFICATION
      ====================================================== */}

      {notification.show && (
        <div
          className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-lg shadow-lg text-white ${
            notification.type === "success"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Story Studio
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Curate, edit, and publish illustrated tales and fables for children
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddStory}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all text-xs"
        >
          <PlusIcon className="w-4 h-4" />
          Add New Story
        </button>
      </div>

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search stories by title or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* ======================================================
          STORIES
      ====================================================== */}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            Loading stories...
          </p>
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80 shadow-sm">
          <PhotoIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">
            No stories found
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Add your first story to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/70 border-b border-slate-200/80">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Image
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Story
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Age
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Language
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-200">

                {filteredStories.map((story) => (

                  <tr
                    key={story.id}
                    className="hover:bg-gray-50"
                  >

                    {/* IMAGE */}

                    <td className="px-5 py-4">

                      <StoryImage
                        story={story}
                        className="w-16 h-16 rounded-lg"
                      />

                    </td>

                    {/* STORY */}

                    <td className="px-5 py-4 max-w-xs">

                      <div className="font-semibold text-gray-900 truncate">
                        {story.title}
                      </div>

                      {story.description && (
                        <div className="text-sm text-gray-500 truncate mt-1">
                          {story.description}
                        </div>
                      )}

                      {story.author && (
                        <div className="text-xs text-gray-400 mt-1">
                          By {story.author}
                        </div>
                      )}

                    </td>

                    {/* CATEGORY */}

                    <td className="px-5 py-4">

                      <span className="inline-flex px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">
                        {getCategoryName(
                          story.category_id
                        )}
                      </span>

                    </td>

                    {/* AGE */}

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {story.age_group || "-"}
                    </td>

                    {/* LANGUAGE */}

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {story.language || "-"}
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          story.status ===
                          "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {story.status ||
                          "draft"}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex items-center justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEditStory(
                              story
                            )
                          }
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteStory(
                              story
                            )
                          }
                          disabled={deleting}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* ======================================================
          STORY MODAL
      ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">

            {/* MODAL HEADER */}

            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingStory
                    ? "Edit Story"
                    : "Add Story"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {editingStory
                    ? "Update story information"
                    : "Create a new story"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* TITLE */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Story Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter story title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                </div>

                {/* CATEGORY */}

                <div>

                  <div className="flex items-center justify-between mb-2">

                    <label className="block text-sm font-semibold text-gray-700">
                      Category *
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setNewCategoryName("");
                        setNewCategoryDescription("");
                        setShowCategoryModal(
                          true
                        );
                      }}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      + Add Category
                    </button>

                  </div>

                  <select
                    name="category_id"
                    value={
                      formData.category_id
                    }
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >

                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name ||
                            category.title}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* AGE GROUP */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age Group *
                  </label>

                  <select
                    name="age_group"
                    value={
                      formData.age_group
                    }
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >

                    <option value="">
                      Select Age Group
                    </option>

                    {AGE_GROUPS.map(
                      (age) => (
                        <option
                          key={age}
                          value={age}
                        >
                          {age}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* LANGUAGE */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Language
                  </label>

                  <select
                    name="language"
                    value={
                      formData.language
                    }
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >

                    {languages.length > 0
                      ? languages.map(
                          (language) => (
                            <option
                              key={
                                language.id ||
                                language.name
                              }
                              value={
                                language.name
                              }
                            >
                              {language.name}
                            </option>
                          )
                        )
                      : FALLBACK_LANGUAGES.map(
                          (language) => (
                            <option
                              key={
                                language.id
                              }
                              value={
                                language.name
                              }
                            >
                              {language.name}
                            </option>
                          )
                        )}

                  </select>

                </div>

                {/* AUTHOR */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Author
                  </label>

                  <input
                    type="text"
                    name="author"
                    value={
                      formData.author
                    }
                    onChange={handleChange}
                    placeholder="Author name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                </div>

                {/* STATUS */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >

                    <option value="published">
                      Published
                    </option>

                    <option value="draft">
                      Draft
                    </option>

                  </select>

                </div>

                {/* IMAGE */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Story Image
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-5">

                    {imagePreview ? (
                      <div className="flex flex-col items-center">

                        <img
                          src={imagePreview}
                          alt="Story preview"
                          className="w-full max-w-md h-56 object-cover rounded-xl border"
                        />

                        <div className="flex gap-3 mt-4">

                          <button
                            type="button"
                            onClick={() =>
                              imageInputRef.current?.click()
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Change Image
                          </button>

                          <button
                            type="button"
                            onClick={
                              removeImage
                            }
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          >
                            Remove Image
                          </button>

                        </div>

                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          imageInputRef.current?.click()
                        }
                        className="w-full flex flex-col items-center justify-center py-8 text-gray-500 hover:text-blue-600"
                      >

                        <PhotoIcon className="w-12 h-12 mb-3" />

                        <span className="font-semibold">
                          Click to upload image
                        </span>

                        <span className="text-sm mt-1">
                          JPG, PNG, WEBP or GIF
                          • Maximum 10 MB
                        </span>

                      </button>
                    )}

                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={
                        handleImageUpload
                      }
                      className="hidden"
                    />

                  </div>

                </div>

                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    rows={3}
                    placeholder="Short description of the story"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                </div>

                {/* STORY */}

                <div className="md:col-span-2">

                  <div className="flex items-center justify-between mb-2">

                    <label className="block text-sm font-semibold text-gray-700">
                      Story Content *
                    </label>

                    <span className="text-sm text-gray-500">
                      Estimated read time:{" "}
                      {calculateReadTime(
                        formData.story
                      )}{" "}
                      min
                    </span>

                  </div>

                  <textarea
                    name="story"
                    value={formData.story}
                    onChange={handleChange}
                    rows={12}
                    placeholder="Write your story here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                </div>

              </div>

              {/* FORM BUTTONS */}

              <div className="flex justify-end gap-3 mt-6 pt-5 border-t">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
                >

                  {saving && (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingStory
                    ? "Update Story"
                    : "Create Story"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================================
          ADD CATEGORY MODAL
      ====================================================== */}

      {showCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Add Category
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Create a new story category
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCategoryModal(false)
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

            </div>

            {/* BODY */}

            <div className="p-6">

              <div className="mb-4">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name *
                </label>

                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) =>
                    setNewCategoryName(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter"
                    ) {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  placeholder="e.g. Mythology"
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

              </div>

              <div className="mb-6">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  value={
                    newCategoryDescription
                  }
                  onChange={(e) =>
                    setNewCategoryDescription(
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Category description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowCategoryModal(false)
                  }
                  disabled={isAddingCategory}
                  className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={
                    isAddingCategory ||
                    !newCategoryName.trim()
                  }
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2"
                >

                  {isAddingCategory && (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}

                  {isAddingCategory
                    ? "Adding..."
                    : "Add Category"}

                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}