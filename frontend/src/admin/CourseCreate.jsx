import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { BACKEND_URL } from "../utils/utils";

export default function CourseCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const navigate = useNavigate();

  const changePhotoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreview(reader.result);
      setImage(file);
    };
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", image);

    const admin = JSON.parse(localStorage.getItem("admin"));
    const token = admin.token;

    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/course/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log(response.data);
      toast.success(response.data.message || "Course created successfully");
      navigate("/admin/our-courses");
      setTitle("");
      setPrice("");
      setImage("");
      setDescription("");
      setImagePreview("");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.errors);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

          {/* Card Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <h3 className="text-2xl font-bold text-white tracking-wide">✦ Create New Course</h3>
            <p className="text-orange-100 text-sm mt-1">Fill in the details to publish a new course</p>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateCourse} className="px-8 py-8 space-y-6">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">Course Title</label>
              <input
                type="text"
                placeholder="e.g. Complete React Developer Course"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-gray-500 transition-colors duration-200"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">Description</label>
              <textarea
                rows={4}
                placeholder="Describe what students will learn..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-gray-500 transition-colors duration-200 resize-none"
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">Price (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                <input
                  type="number"
                  placeholder="499"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-gray-500 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Course Image */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">Course Thumbnail</label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="flex justify-center mb-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-44 w-auto rounded-xl object-cover border-2 border-orange-500/50 shadow-lg"
                  />
                </div>
              )}

              {/* File Input */}
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-gray-800/50 transition-colors duration-200">
                <span className="text-gray-400 text-sm">{imagePreview ? "Click to change image" : "📁 Click to upload thumbnail"}</span>
                <span className="text-gray-600 text-xs mt-1">PNG, JPG, WEBP supported</span>
                <input type="file" onChange={changePhotoHandler} className="hidden" />
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors duration-200 cursor-pointer tracking-wide shadow-lg shadow-orange-500/20"
            >
              🚀 Publish Course
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
