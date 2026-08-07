import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiBookOpen, FiCheck, FiChevronDown, FiChevronUp, FiEdit2, FiHome, FiLogOut, FiPlus, FiPlusCircle, FiStar, FiTrash2 } from 'react-icons/fi';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { MdOutlineVideoLibrary } from 'react-icons/md';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { BACKEND_URL } from '../../utils/utils';

const STEPS = ['Course Details', 'Modules & Lessons', 'Review & Save'];

const inputCls = 'w-full px-4 py-3 bg-slate-900/70 border border-white/10 text-white rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-gray-500 transition-colors duration-200';
const labelCls = 'block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2';

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

const emptyLesson = (order, existing = null) => ({
  id: createId(),
  serverId: existing?._id || null,
  title: existing?.title || '',
  description: existing?.description || '',
  videoUrl: existing?.videoUrl || '',
  duration: existing?.duration ? String(existing.duration) : '',
  order,
  isNew: !existing?._id,
});

const emptyModule = (order, existing = null) => ({
  id: createId(),
  serverId: existing?._id || null,
  title: existing?.title || '',
  description: existing?.description || '',
  order,
  lessons: [],
  _open: true,
  isNew: !existing?._id,
});

export default function UpdateCourse() {
  const navigate = useNavigate();
  const { courseId: id } = useParams();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [modules, setModules] = useState([]);
  const [deletedModuleIds, setDeletedModuleIds] = useState([]);
  const [deletedLessonIds, setDeletedLessonIds] = useState([]);

  const adminData = JSON.parse(localStorage.getItem('admin') || 'null');
  const admin = adminData?.admin || adminData;
  const token = adminData?.token || admin?.token;

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;

      try {
        const { data: courseData } = await axios.get(`${BACKEND_URL}/course/${id}`, { withCredentials: true });
        setTitle(courseData.course?.title || '');
        setDescription(courseData.course?.description || '');
        setPrice(courseData.course?.price || '');
        setImagePreview(courseData.course?.image?.url || '');

        const moduleRes = await axios.get(`${BACKEND_URL}/content/course/${id}/modules`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const moduleList = moduleRes.data.modules || [];
        const moduleState = [];

        for (let i = 0; i < moduleList.length; i++) {
          const mod = moduleList[i];
          const lessonRes = await axios.get(`${BACKEND_URL}/content/modules/${mod._id}/lessons`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });

          const lessonState = (lessonRes.data.lessons || []).map((lesson, li) => emptyLesson(li + 1, lesson));
          const builtMod = emptyModule(i + 1, mod);
          builtMod.lessons = lessonState;
          moduleState.push(builtMod);
        }

        setModules(moduleState);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course data', error);
        toast.error('Failed to load course details');
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, token]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const addModule = () => setModules((m) => [...m, emptyModule(m.length + 1)]);

  const removeModule = (modId) => {
    setModules((m) => {
      const target = m.find((mod) => mod.id === modId);
      if (target?.serverId) {
        setDeletedModuleIds((prev) => [...prev, target.serverId]);
      }
      return m.filter((mod) => mod.id !== modId).map((mod, index) => ({ ...mod, order: index + 1 }));
    });
  };

  const updateModule = (modId, field, val) => setModules((m) => m.map((mod) => (mod.id === modId ? { ...mod, [field]: val } : mod)));

  const toggleModule = (modId) => setModules((m) => m.map((mod) => (mod.id === modId ? { ...mod, _open: !mod._open } : mod)));

  const addLesson = (modId) => setModules((m) => m.map((mod) => (mod.id === modId ? { ...mod, lessons: [...mod.lessons, emptyLesson(mod.lessons.length + 1)] } : mod)));

  const removeLesson = (modId, lessonId) => {
    setModules((m) => {
      const targetModule = m.find((mod) => mod.id === modId);
      const targetLesson = targetModule?.lessons.find((lesson) => lesson.id === lessonId);
      if (targetLesson?.serverId) {
        setDeletedLessonIds((prev) => [...prev, targetLesson.serverId]);
      }
      return m.map((mod) => (mod.id === modId ? { ...mod, lessons: mod.lessons.filter((lesson) => lesson.id !== lessonId).map((lesson, index) => ({ ...lesson, order: index + 1 })) } : mod));
    });
  };

  const updateLesson = (modId, lessonId, field, val) => setModules((m) => m.map((mod) => (mod.id === modId ? { ...mod, lessons: mod.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, [field]: val } : lesson)) } : mod)));

  const validateStep1 = () => {
    if (!title.trim()) { toast.error('Course title is required'); return false; }
    if (!description.trim()) { toast.error('Course description is required'); return false; }
    if (!price || Number(price) <= 0) { toast.error('Valid price is required'); return false; }
    return true;
  };

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
      const response = await axios.get(`${BACKEND_URL}/admin/logout`, { withCredentials: true });
      localStorage.removeItem('admin');
      toast.success(response.data.message || 'Logged out successfully');
      navigate("/admin/login");
    } catch (error) {
      console.error('Error in logging out', error);
      toast.error(error?.response?.data?.errors || 'Error in logging out');
    }
  };

  const handleSave = async () => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (!validateStep1() || !validateStep2()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      if (image instanceof File) {
        formData.append('image', image);
      }

      await axios.put(`${BACKEND_URL}/course/update/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      for (const deletedId of deletedModuleIds) {
        await axios.delete(`${BACKEND_URL}/content/modules/${deletedId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
      }

      for (const deletedId of deletedLessonIds) {
        await axios.delete(`${BACKEND_URL}/content/lessons/${deletedId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
      }

      for (const mod of modules) {
        if (mod.serverId) {
          await axios.put(`${BACKEND_URL}/content/modules/${mod.serverId}`, {
            title: mod.title,
            description: mod.description,
            order: mod.order,
          }, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
        } else {
          const { data: modData } = await axios.post(`${BACKEND_URL}/content/course/${id}/modules`, {
            title: mod.title,
            description: mod.description,
            order: mod.order,
          }, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          mod.serverId = modData.module?._id || modData.module?.id;
        }

        for (const lesson of mod.lessons) {
          if (lesson.serverId) {
            await axios.put(`${BACKEND_URL}/content/lessons/${lesson.serverId}`, {
              title: lesson.title,
              description: lesson.description,
              videoUrl: lesson.videoUrl,
              duration: lesson.duration ? Number(lesson.duration) : undefined,
              order: lesson.order,
            }, {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            });
          } else {
            await axios.post(`${BACKEND_URL}/content/modules/${mod.serverId}/lessons`, {
              courseId: id,
              title: lesson.title,
              description: lesson.description,
              videoUrl: lesson.videoUrl,
              duration: lesson.duration ? Number(lesson.duration) : undefined,
              order: lesson.order,
            }, {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            });
          }
        }
      }

      toast.success('Course updated successfully');
      navigate('/admin/our-courses');
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  const totalLessons = modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.20),transparent_30%),linear-gradient(135deg,#020617_0%,#111827_50%,#0f172a_100%)] text-slate-100 flex items-center justify-center">
        <p className="text-slate-300">Loading course details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.20),transparent_30%),linear-gradient(135deg,#020617_0%,#111827_50%,#0f172a_100%)] text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-slate-950/70 p-5 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500 to-amber-400 text-xl font-bold text-white">
              A
            </div>
            <div>
              <p className="text-sm text-slate-400">Welcome back</p>
              <h2 className="text-lg font-semibold text-white">{admin?.firstName || 'Admin'}</h2>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
            <p className="text-sm font-medium text-orange-300">SkillHarbor Admin</p>
            <p className="mt-1 text-sm text-slate-300">Update course content, modules, and lessons in one place.</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${to === '/admin/our-courses'
                  ? 'border-orange-400/40 bg-linear-to-r from-orange-500/20 to-amber-400/10 text-white shadow-lg shadow-orange-500/10'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'} `}
              >
                <span className={`rounded-lg bg-linear-to-r ${color} p-2 text-white`}>
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
                  Update Course Wizard
                </div>
                <h1 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Edit Course Content</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-400">
                  Update course basics, reorganize modules and lessons, and save your changes.
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
                    {step === 2 && 'Review & Save'}
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
                {step === 0 && (
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Course Title</label>
                      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full Stack Web Development" className={inputCls} />
                    </div>

                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what students will learn..." className={`${inputCls} resize-none`} />
                    </div>

                    <div>
                      <label className={labelCls}>Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="499" className={`${inputCls} pl-8`} />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Course Thumbnail</label>
                      {imagePreview && (
                        <div className="mb-3 flex justify-center">
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

                {step === 1 && (
                  <div className="space-y-3">
                    {modules.map((mod, mi) => (
                      <div key={mod.id} className="overflow-hidden rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 bg-white/5 px-3 py-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/20 text-xs font-bold text-orange-400">
                            {mi + 1}
                          </div>
                          <div className="flex-1 rounded-lg border border-gray-700 bg-gray-900/70 px-3 py-2 shadow-sm">
                            <label className="sr-only" htmlFor={`module-title-${mod.id}`}>Module title</label>
                            <input
                              id={`module-title-${mod.id}`}
                              type="text"
                              placeholder={`Module ${mi + 1} title *`}
                              value={mod.title}
                              onChange={(e) => updateModule(mod.id, 'title', e.target.value)}
                              className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm font-semibold"
                            />
                          </div>
                          <button type="button" onClick={() => toggleModule(mod.id)} className="p-1 text-gray-400 transition-colors hover:text-white">
                            {mod._open ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                          <button type="button" onClick={() => removeModule(mod.id)} className="p-1 text-red-400 transition-colors hover:text-red-300">
                            <FiTrash2 />
                          </button>
                        </div>

                        {mod._open && (
                          <div className="space-y-3 px-3 py-3">
                            <input
                              type="text"
                              placeholder="Module description (optional)"
                              value={mod.description}
                              onChange={(e) => updateModule(mod.id, 'description', e.target.value)}
                              className="w-full rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-sm text-white outline-none placeholder-gray-600 transition-colors focus:border-orange-500"
                            />

                            <div className="space-y-2 border-l-2 border-orange-500/20 pl-3">
                              {mod.lessons.map((lesson, li) => (
                                <div key={lesson.id} className="space-y-2 rounded-xl border border-white/5 bg-gray-800/40 p-3">
                                  <div className="flex items-center gap-2">
                                    <MdOutlineVideoLibrary className="shrink-0 text-sky-400" />
                                    <div className="flex-1 rounded-lg border border-gray-700 bg-gray-900/70 px-3 py-1.5 shadow-sm">
                                      <label className="sr-only" htmlFor={`lesson-title-${mod.id}-${li}`}>Lesson title</label>
                                      <input
                                        id={`lesson-title-${mod.id}-${li}`}
                                        type="text"
                                        placeholder={`Lesson ${li + 1} title *`}
                                        value={lesson.title}
                                        onChange={(e) => updateLesson(mod.id, lesson.id, 'title', e.target.value)}
                                        className="w-full bg-transparent text-sm font-medium text-white outline-none placeholder-gray-500"
                                      />
                                    </div>
                                    <button type="button" onClick={() => removeLesson(mod.id, lesson.id)} className="shrink-0 text-red-400 transition-colors hover:text-red-300">
                                      <FiTrash2 className="text-sm" />
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    placeholder="Lesson description (optional)"
                                    value={lesson.description}
                                    onChange={(e) => updateLesson(mod.id, lesson.id, 'description', e.target.value)}
                                    className="w-full rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-1.5 text-sm text-white outline-none placeholder-gray-600 transition-colors focus:border-sky-500"
                                  />
                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">URL</span>
                                      <input
                                        type="url"
                                        placeholder="https://youtube.com/..."
                                        value={lesson.videoUrl}
                                        onChange={(e) => updateLesson(mod.id, lesson.id, 'videoUrl', e.target.value)}
                                        className="w-full rounded-lg border border-gray-700 bg-gray-900/60 py-1.5 pl-10 pr-3 text-sm text-white outline-none placeholder-gray-600 transition-colors focus:border-sky-500"
                                      />
                                    </div>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">sec</span>
                                      <input
                                        type="number"
                                        placeholder="Duration in seconds"
                                        value={lesson.duration}
                                        onChange={(e) => updateLesson(mod.id, lesson.id, 'duration', e.target.value)}
                                        className="w-full rounded-lg border border-gray-700 bg-gray-900/60 py-1.5 pl-10 pr-3 text-sm text-white outline-none placeholder-gray-600 transition-colors focus:border-sky-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <button type="button" onClick={() => addLesson(mod.id)} className="mt-1 flex items-center gap-2 text-sm font-medium text-sky-400 transition-colors hover:text-sky-300">
                              <FiPlus /> Add Lesson
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    <button type="button" onClick={addModule} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-500/30 py-2 text-sm font-medium text-orange-400 transition-all duration-200 hover:border-orange-500 hover:text-orange-300">
                      <FiPlus /> Add Module
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    <div className="flex gap-5 rounded-xl border border-white/10 bg-white/5 p-3">
                      {imagePreview && <img src={imagePreview} alt="thumbnail" className="h-16 w-24 shrink-0 rounded-lg border border-white/10 object-cover" />}
                      <div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        <p className="mt-1 text-sm text-gray-400 line-clamp-2">{description}</p>
                        <span className="mt-2 inline-block text-lg font-bold text-sky-400">₹{price}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-300">
                        <HiOutlineBookOpen className="text-orange-400" />
                        {modules.length} Module{modules.length !== 1 ? 's' : ''} · {totalLessons} Lesson{totalLessons !== 1 ? 's' : ''}
                      </h4>
                      {modules.map((mod, mi) => (
                        <div key={mi} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm font-bold text-orange-400">Module {mi + 1}</span>
                            <span className="text-sm font-semibold text-white">{mod.title}</span>
                          </div>
                          <ul className="space-y-1 border-l border-orange-500/20 pl-3">
                            {mod.lessons.map((lesson, li) => (
                              <li key={li} className="flex items-center gap-2 text-sm text-gray-400">
                                <MdOutlineVideoLibrary className="shrink-0 text-xs text-sky-400" />
                                <span>{lesson.title}</span>
                                {lesson.duration && <span className="ml-auto text-xs text-gray-600">{Math.floor(Number(lesson.duration) / 60)}m {Number(lesson.duration) % 60}s</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <p className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FiEdit2 /> Review everything, then save your changes.
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    disabled={step === 0}
                    className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ← Back
                  </button>

                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (step === 0 && !validateStep1()) return;
                        if (step === 1 && !validateStep2()) return;
                        setStep((s) => s + 1);
                      }}
                      className="rounded-xl bg-orange-500 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-colors duration-200 hover:bg-orange-600"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={submitting}
                      className="rounded-xl bg-green-500 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-green-500/20 transition-colors duration-200 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? 'Saving...' : '💾 Save Changes'}
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
