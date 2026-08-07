import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiBookOpen, FiCheck, FiChevronDown, FiChevronUp, FiEdit2, FiHome, FiLogOut, FiPlus, FiPlusCircle, FiStar, FiTrash2 } from 'react-icons/fi';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { MdOutlineVideoLibrary } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

import { BACKEND_URL } from '../utils/utils.js';

const STEPS = ['Course Details', 'Modules & Lessons', 'Review & Publish'];

const inputCls = 'w-full px-4 py-3 bg-slate-900/70 border border-white/10 text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-gray-500 transition-colors duration-200';
const labelCls = 'block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2';
const requiredLabelCls = 'text-red-400';

const navItems = [
  { to: '/admin/dashboard', label: 'Home', icon: FiHome, color: 'from-orange-500 to-amber-400' },
  { to: '/admin/our-courses', label: 'Our Courses', icon: FiBookOpen, color: 'from-emerald-500 to-green-400' },
  { to: '/admin/create-course', label: 'Create Course', icon: FiPlusCircle, color: 'from-sky-500 to-cyan-400' },
];

const getTrimmedValue = (value) => (typeof value === 'string' ? value.trim() : '');

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

// ── helpers ──────────────────────────────────────────────────────
const emptyLesson = (order) => ({ id: createId(), title: '', description: '', videoUrl: '', duration: '', order });
const emptyModule = (order) => ({ id: createId(), title: '', description: '', order, lessons: [emptyLesson(1)], _open: true });

export default function CourseCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const adminData = JSON.parse(localStorage.getItem("admin") || "null");
  const admin = adminData.admin;

  // Step 1 — course details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Step 2 — modules
  const [modules, setModules] = useState([emptyModule(1)]);

  const token = adminData?.token;
  console.log("Token from Course Create:", token);

  // ── image ──────────────────────────────────────────────────────
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ── module helpers ─────────────────────────────────────────────
  const addModule = () =>
    setModules(m => [...m, emptyModule(m.length + 1)]);

  const removeModule = (modId) =>
    setModules(m => m.filter(mod => mod.id !== modId).map((mod, i) => ({ ...mod, order: i + 1 })));

  const updateModule = (modId, field, val) =>
    setModules(m => m.map(mod => mod.id === modId ? { ...mod, [field]: val } : mod));

  const toggleModule = (modId) =>
    setModules(m => m.map(mod => mod.id === modId ? { ...mod, _open: !mod._open } : mod));

  // ── lesson helpers ─────────────────────────────────────────────
  const addLesson = (modId) =>
    setModules(m => m.map(mod =>
      mod.id === modId ? { ...mod, lessons: [...mod.lessons, emptyLesson(mod.lessons.length + 1)] } : mod
    ));

  const removeLesson = (modId, lessonIndex) =>
    setModules(m => m.map(mod =>
      mod.id === modId
        ? { ...mod, lessons: mod.lessons.filter((_, index) => index !== lessonIndex).map((l, j) => ({ ...l, order: j + 1 })) }
        : mod
    ));

  const updateLesson = (modId, lessonIndex, field, val) =>
    setModules(m => m.map(mod =>
      mod.id === modId
        ? { ...mod, lessons: mod.lessons.map((l, index) => index === lessonIndex ? { ...l, [field]: val } : l) }
        : mod
    ));

  // ── step 1 validation ──────────────────────────────────────────
  const validateStep1 = () => {
    if (!title.trim()) { toast.error('Course title is required'); return false; }
    if (!description.trim()) { toast.error('Course description is required'); return false; }
    if (!price || price <= 0) { toast.error('Valid price is required'); return false; }
    if (!image) { toast.error('Course thumbnail is required'); return false; }
    return true;
  };

  // ── step 2 validation ──────────────────────────────────────────
  const validateStep2 = () => {
    for (let mi = 0; mi < modules.length; mi++) {
      if (!getTrimmedValue(modules[mi].title)) {
        toast.error(`Module ${mi + 1} title is required`);
        return false;
      }

      for (let li = 0; li < modules[mi].lessons.length; li++) {
        if (!getTrimmedValue(modules[mi].lessons[li].title)) {
          toast.error(`Lesson ${li + 1} in Module ${mi + 1} title is required`);
          return false;
        }
      }
    }
    return true;
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/logout`, {
        withCredentials: true,
      });
      localStorage.removeItem('admin');
      toast.success(response.data.message || 'Logged out successfully');
    } catch (error) {
      console.log('Error in logging out ', error);
      toast.error(error?.response?.data?.errors || 'Error in logging out');
    }
  };

  // ── submit ─────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!token) { navigate('/admin/login'); return; }
    setSubmitting(true);

    try {
      // 1. Create course
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('image', image);

      const { data: courseData } = await axios.post(`${BACKEND_URL}/course/create`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const courseId = courseData.course._id;

      // 2. Create modules + lessons sequentially
      for (const mod of modules) {
        const { data: modData } = await axios.post(
          `${BACKEND_URL}/content/course/${courseId}/modules`,
          { title: mod.title, description: mod.description, order: mod.order },
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
        const moduleId = modData.module._id;

        for (const lesson of mod.lessons) {
          await axios.post(
            `${BACKEND_URL}/content/modules/${moduleId}/lessons`,
            {
              courseId,
              title: lesson.title,
              description: lesson.description,
              videoUrl: lesson.videoUrl,
              duration: lesson.duration ? Number(lesson.duration) : undefined,
              order: lesson.order,
            },
            { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
          );
        }
      }

      toast.success('Course published successfully! 🎉');
      navigate('/admin/our-courses');
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to publish course');
    } finally {
      setSubmitting(false);
    }
  };

  // ── total lessons count ────────────────────────────────────────
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.20),transparent_30%),linear-gradient(135deg,#020617_0%,#111827_50%,#0f172a_100%)] text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-slate-950/70 p-5 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-xl font-bold text-white">
              A
            </div>
            <div>
              <p className="text-sm text-slate-400">Welcome back</p>
              <h2 className="text-lg font-semibold text-white">{admin?.firstName || 'Admin'}</h2>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
            <p className="text-sm font-medium text-orange-300">SkillHarbor Admin</p>
            <p className="mt-1 text-sm text-slate-300">Create and structure new learning experiences in one place.</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${to === '/admin/create-course'
                  ? 'border-orange-400/40 bg-gradient-to-r from-orange-500/20 to-amber-400/10 text-white shadow-lg shadow-orange-500/10'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                  }`}
              >
                <span className={`rounded-lg bg-gradient-to-r ${color} p-2 text-white`}>
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </Link>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
            >
              <span className="rounded-lg bg-red-500/80 p-2 text-white">
                <FiLogOut className="h-4 w-4" />
              </span>
              Logout
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-3 sm:p-4 lg:p-5">
          {/* <header className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 shadow-2xl shadow-black/30 backdrop-blur sm:p-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-sm text-orange-300">
                  <FiStar className="h-4 w-4" />
                  Course Creation Wizard
                </div>
                <h1 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Create New Course</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-400 sm:text-sm">
                  Build course details, organize modules and lessons, and publish your content in a guided flow.
                </p>
              </div>
            </div>
          </header> */}

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3 shadow-2xl shadow-black/20 backdrop-blur sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${i < step ? 'border-orange-500 bg-orange-500 text-white' : i === step ? 'border-orange-500 bg-orange-500/20 text-orange-400' : 'border-slate-600 bg-slate-800 text-slate-500'}`}>
                      {i < step ? <FiCheck /> : i + 1}
                    </div>
                    <span className={`mt-1.5 hidden text-xs font-medium sm:block ${i === step ? 'text-orange-400' : 'text-slate-500'}`}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 w-10 sm:w-16 ${i < step ? 'bg-orange-500' : 'bg-slate-700'}`} />}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 sm:p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {step === 0 && 'Course Details'}
                    {step === 1 && 'Modules & Lessons'}
                    {step === 2 && 'Review & Publish'}
                  </h2>
                  <p className="text-sm text-slate-400">Step {step + 1} of {STEPS.length}</p>
                </div>
                {step === 1 && (
                  <div className="rounded-xl border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-sm text-orange-200">
                    <span className="font-semibold text-white">{modules.length}</span> modules · <span className="font-semibold text-white">{totalLessons}</span> lessons
                  </div>
                )}
              </div>

              <div className="space-y-3">

                {/* ════════════════════════════════════════════════════
                STEP 1 — Course Details
            ════════════════════════════════════════════════════ */}
                {step === 0 && (
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Course Title</label>
                      <input type="text" placeholder="e.g. Complete React Developer Course" value={title}
                        onChange={e => setTitle(e.target.value)} className={inputCls} />
                    </div>

                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea rows={3} placeholder="Describe what students will learn..."
                        value={description} onChange={e => setDescription(e.target.value)}
                        className={`${inputCls} resize-none`} />
                    </div>

                    <div>
                      <label className={labelCls}>Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                        <input type="number" placeholder="499" value={price}
                          onChange={e => setPrice(e.target.value)}
                          className={`${inputCls} pl-8`} />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Course Thumbnail</label>
                      {imagePreview && (
                        <div className="flex justify-center mb-3">
                          <img src={imagePreview} alt="Preview" className="h-28 w-auto rounded-xl object-cover border-2 border-orange-500/50 shadow-lg" />
                        </div>
                      )}
                      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-gray-800/50 transition-colors duration-200">
                        <span className="text-gray-400 text-sm">{imagePreview ? '📷 Click to change image' : '📁 Click to upload thumbnail'}</span>
                        <span className="text-gray-600 text-xs mt-1">PNG, JPG, WEBP supported</span>
                        <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════
                STEP 2 — Modules & Lessons
            ════════════════════════════════════════════════════ */}
                {step === 1 && (
                  <div className="space-y-3">
                    {modules.map((mod, mi) => (
                      <div key={mod.id} className="border border-white/10 rounded-xl overflow-hidden">

                        {/* Module header */}
                        <div className="flex items-center gap-3 bg-white/5 px-3 py-2.5">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold shrink-0">
                            {mi + 1}
                          </div>
                          <div className="flex-1 rounded-lg border border-gray-700 bg-gray-900/70 px-3 py-2 shadow-sm">
                            <label className="sr-only" htmlFor={`module-title-${mod.id}`}>Module title</label>
                            <input
                              id={`module-title-${mod.id}`}
                              type="text"
                              placeholder={`Module ${mi + 1} title *`}
                              value={mod.title}
                              onChange={e => updateModule(mod.id, 'title', e.target.value)}
                              className="w-full bg-transparent text-white placeholder-gray-500 outline-none font-semibold text-sm"
                              required
                            />
                          </div>
                          <button type="button" onClick={() => toggleModule(mod.id)} className="text-gray-400 hover:text-white transition-colors p-1">
                            {mod._open ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                          {modules.length > 1 && (
                            <button type="button" onClick={() => removeModule(mod.id)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                              <FiTrash2 />
                            </button>
                          )}
                        </div>

                        {/* Module body */}
                        {mod._open && (
                          <div className="px-3 py-3 space-y-3">
                            <input
                              type="text"
                              placeholder="Module description (optional)"
                              value={mod.description}
                              onChange={e => updateModule(mod.id, 'description', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700 text-white rounded-lg outline-none focus:border-orange-500 placeholder-gray-600 text-sm transition-colors"
                            />

                            {/* Lessons */}
                            <div className="space-y-2 pl-3 border-l-2 border-orange-500/20">
                              {mod.lessons.map((lesson, li) => (
                                <div key={`${mod.id}-${li}`} className="bg-gray-800/40 border border-white/5 rounded-xl p-3 space-y-2">
                                  {/* Lesson header row */}
                                  <div className="flex items-center gap-2">
                                    <MdOutlineVideoLibrary className="text-sky-400 shrink-0" />
                                    <div className="flex-1 rounded-lg border border-gray-700 bg-gray-900/70 px-3 py-1.5 shadow-sm">
                                      <label className="sr-only" htmlFor={`lesson-title-${mod.id}-${li}`}>Lesson title</label>
                                      <input
                                        id={`lesson-title-${mod.id}-${li}`}
                                        type="text"
                                        placeholder={`Lesson ${li + 1} title *`}
                                        value={lesson.title}
                                        onChange={e => updateLesson(mod.id, li, 'title', e.target.value)}
                                        className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm font-medium"
                                        required
                                      />
                                    </div>
                                    {mod.lessons.length > 1 && (
                                      <button type="button" onClick={() => removeLesson(mod.id, li)} className="text-red-400 hover:text-red-300 transition-colors shrink-0">
                                        <FiTrash2 className="text-sm" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Lesson detail fields */}
                                  <input
                                    type="text"
                                    placeholder="Lesson description (optional)"
                                    value={lesson.description}
                                    onChange={e => updateLesson(mod.id, li, 'description', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-gray-900/60 border border-gray-700 text-white rounded-lg outline-none focus:border-sky-500 placeholder-gray-600 text-sm transition-colors"
                                  />
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">URL</span>
                                      <input
                                        type="url"
                                        placeholder="https://youtube.com/..."
                                        value={lesson.videoUrl}
                                        onChange={e => updateLesson(mod.id, li, 'videoUrl', e.target.value)}
                                        className="w-full pl-10 pr-3 py-1.5 bg-gray-900/60 border border-gray-700 text-white rounded-lg outline-none focus:border-sky-500 placeholder-gray-600 text-sm transition-colors"
                                      />
                                    </div>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">sec</span>
                                      <input
                                        type="number"
                                        placeholder="Duration in seconds"
                                        value={lesson.duration}
                                        onChange={e => updateLesson(mod.id, li, 'duration', e.target.value)}
                                        className="w-full pl-10 pr-3 py-1.5 bg-gray-900/60 border border-gray-700 text-white rounded-lg outline-none focus:border-sky-500 placeholder-gray-600 text-sm transition-colors"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Add lesson */}
                            <button
                              type="button"
                              onClick={() => addLesson(mod.id)}
                              className="flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors mt-1"
                            >
                              <FiPlus /> Add Lesson
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add module */}
                    <button
                      type="button"
                      onClick={addModule}
                      className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-orange-500/30 hover:border-orange-500 text-orange-400 hover:text-orange-300 rounded-xl text-sm font-medium transition-all duration-200"
                    >
                      <FiPlus /> Add Module
                    </button>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════
                STEP 3 — Review & Publish
            ════════════════════════════════════════════════════ */}
                {step === 2 && (
                  <div className="space-y-3">
                    {/* Course summary card */}
                    <div className="flex gap-5 bg-white/5 border border-white/10 rounded-xl p-3">
                      {imagePreview && (
                        <img src={imagePreview} alt="thumbnail" className="w-24 h-16 object-cover rounded-lg shrink-0 border border-white/10" />
                      )}
                      <div>
                        <h3 className="text-white font-bold text-lg">{title}</h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{description}</p>
                        <span className="inline-block mt-2 text-sky-400 font-bold text-lg">₹{price}</span>
                      </div>
                    </div>

                    {/* Modules summary */}
                    <div className="space-y-2">
                      <h4 className="text-gray-300 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                        <HiOutlineBookOpen className="text-orange-400" />
                        {modules.length} Module{modules.length !== 1 ? 's' : ''} · {totalLessons} Lesson{totalLessons !== 1 ? 's' : ''}
                      </h4>
                      {modules.map((mod, mi) => (
                        <div key={mi} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-orange-400 font-bold text-sm">Module {mi + 1}</span>
                            <span className="text-white font-semibold text-sm">{mod.title}</span>
                          </div>
                          <ul className="space-y-1 pl-3 border-l border-orange-500/20">
                            {mod.lessons.map((l, li) => (
                              <li key={li} className="flex items-center gap-2 text-gray-400 text-sm">
                                <MdOutlineVideoLibrary className="text-sky-400 shrink-0 text-xs" />
                                <span>{l.title}</span>
                                {l.duration && <span className="text-gray-600 text-xs ml-auto">{Math.floor(l.duration / 60)}m {l.duration % 60}s</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Edit hint */}
                    <p className="text-gray-500 text-xs flex items-center gap-1.5">
                      <FiEdit2 /> Go back to any step to make changes before publishing.
                    </p>
                  </div>
                )}

                {/* ── Navigation buttons ── */}
                <div className="flex justify-between mt-4 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    disabled={step === 0}
                    className="px-4 py-2 rounded-xl border border-white/15 text-gray-300 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                  >
                    ← Back
                  </button>

                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (step === 0 && !validateStep1()) return;
                        if (step === 1 && !validateStep2()) return;
                        setStep(s => s + 1);
                      }}
                      className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors duration-200 text-sm shadow-lg shadow-orange-500/20"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={submitting}
                      className="px-6 py-2 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold transition-colors duration-200 text-sm shadow-lg shadow-green-500/20"
                    >
                      {submitting ? 'Publishing...' : '🚀 Publish Course'}
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
