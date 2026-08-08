import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  FiAward, FiCheckCircle, FiChevronDown, FiChevronLeft, FiChevronUp,
  FiCircle, FiFileText, FiImage, FiPlayCircle, FiMenu, FiX
} from 'react-icons/fi';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BACKEND_URL } from '../../utils/utils.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/\s]{11})/);
  return match ? match[1] : null;
}

function ContentArea({ lesson }) {
  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-4">
        <HiOutlineBookOpen className="text-6xl text-sky-500/40" />
        <p className="text-gray-400 text-lg font-medium">Select a lesson to start learning</p>
      </div>
    );
  }

  const type = lesson.contentType || (lesson.videoUrl ? 'video' : 'text');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Video */}
      {type === 'video' && lesson.videoUrl && (() => {
        const ytId = getYouTubeId(lesson.videoUrl);
        return ytId ? (
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full rounded-xl"
              src={`https://www.youtube.com/embed/${ytId}`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            key={lesson._id}
            controls
            className="w-full rounded-xl max-h-[60vh] bg-black"
            src={lesson.videoUrl}
          />
        );
      })()}

      {/* Image */}
      {type === 'image' && lesson.videoUrl && (
        <img src={lesson.videoUrl} alt={lesson.title} className="w-full rounded-xl max-h-[60vh] object-contain bg-black" />
      )}

      {/* Document (PDF embed) */}
      {type === 'document' && lesson.content && (
        <iframe src={lesson.content} title={lesson.title} className="w-full rounded-xl" style={{ height: '60vh' }} />
      )}

      {/* Lesson info */}
      <div className="mt-5 space-y-2">
        <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
        {lesson.duration > 0 && (
          <p className="text-xs text-gray-500">{Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s</p>
        )}
        {lesson.description && (
          <p className="text-gray-400 text-sm leading-relaxed">{lesson.description}</p>
        )}
      </div>

      {/* Text / Notes content */}
      {lesson.content && type !== 'document' && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-3 text-sky-400 font-semibold text-sm">
            <FiFileText /> Lesson Notes
          </div>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{lesson.content}</p>
        </div>
      )}

      {/* Placeholder when no content at all */}
      {type === 'video' && !lesson.videoUrl && !lesson.content && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 py-16 text-center">
          <FiPlayCircle className="text-5xl text-gray-600 mb-3" />
          <p className="text-gray-500 text-sm">No video uploaded for this lesson yet.</p>
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function Learn() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [completionPct, setCompletionPct] = useState(0);
  const [openModules, setOpenModules] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [certificate, setCertificate] = useState(null);

  const userData = JSON.parse(localStorage.getItem('user') || 'null');
  const token = userData?.token;

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    const fetchAll = async () => {
      try {
        // Course info
        const { data: courseData } = await axios.get(`${BACKEND_URL}/course/${courseId}`, { withCredentials: true });
        setCourse(courseData.course);

        // Modules + lessons
        const { data: modData } = await axios.get(`${BACKEND_URL}/content/course/${courseId}/modules`, { withCredentials: true });
        const moduleList = modData.modules || [];

        const modulesWithLessons = await Promise.all(
          moduleList.map(async (mod) => {
            const { data: lessonData } = await axios.get(`${BACKEND_URL}/content/modules/${mod._id}/lessons`, { withCredentials: true });
            return { ...mod, lessons: lessonData.lessons || [] };
          })
        );

        setModules(modulesWithLessons);

        // Open all modules by default, select first lesson
        const openState = {};
        moduleList.forEach(m => { openState[m._id] = true; });
        setOpenModules(openState);

        const firstLesson = modulesWithLessons[0]?.lessons[0] || null;
        setActiveLesson(firstLesson);

        // Progress
        const { data: progressData } = await axios.get(`${BACKEND_URL}/content/progress/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (progressData.progress) {
          setCompletedLessons(progressData.progress.completedLessons.map(String));
          setCompletionPct(progressData.progress.completionPercentage);
        }
      } catch (error) {
        console.error(error);
        if (error?.response?.status === 403) {
          toast.error('Please purchase this course first');
          navigate('/courses');
        } else {
          toast.error('Failed to load course');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [courseId, token]);

  const handleMarkComplete = async () => {
    if (!activeLesson || marking) return;
    if (completedLessons.includes(String(activeLesson._id))) {
      toast('Already completed!', { icon: '✅' });
      return;
    }
    setMarking(true);
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/content/progress/${courseId}/complete/${activeLesson._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      const updated = data.progress;
      setCompletedLessons(updated.completedLessons.map(String));
      setCompletionPct(updated.completionPercentage);
      if (updated.completionPercentage === 100) {
        toast.success('🎉 Course completed! Certificate issued.');
      } else {
        toast.success('Lesson marked as complete');
      }
    } catch (error) {
      toast.error('Failed to mark lesson');
    } finally {
      setMarking(false);
    }
  };

  // Navigate to next lesson automatically
  const goToNextLesson = () => {
    const allLessons = modules.flatMap(m => m.lessons);
    const idx = allLessons.findIndex(l => l._id === activeLesson?._id);
    if (idx !== -1 && idx < allLessons.length - 1) {
      setActiveLesson(allLessons[idx + 1]);
    }
  };

  const handleGenerateCertificate = async () => {
    if (generatingCert) return;
    setGeneratingCert(true);
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/content/certificate/${courseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setCertificate(data.certificate);
      if (data.alreadyIssued) {
        toast('Certificate already issued!', { icon: '🎓' });
      } else {
        toast.success('🎓 Certificate generated successfully!');
      }
      // Open certificate URL in new tab
      if (data.certificate?.certificateUrl) {
        window.open(data.certificate.certificateUrl, '_blank');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setGeneratingCert(false);
    }
  };

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const isCompleted = activeLesson && completedLessons.includes(String(activeLesson._id));
  const certEligible = completionPct >= 70;

  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen text-white flex flex-col">

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-gray-900/80 backdrop-blur px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/purchases" className="shrink-0 text-gray-400 hover:text-white transition-colors">
            <FiChevronLeft className="text-xl" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">SkillHarbor</p>
            <h1 className="text-sm font-semibold text-white truncate">{course?.title}</h1>
          </div>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-gray-400">{completionPct}% complete</span>
          <div className="w-36 h-1.5 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="shrink-0 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Content area ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ContentArea lesson={activeLesson} />

          {/* Action buttons */}
          {activeLesson && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleMarkComplete}
                disabled={marking || isCompleted}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                  isCompleted
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400 cursor-default'
                    : 'bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-60'
                }`}
              >
                {isCompleted ? <><FiCheckCircle /> Completed</> : marking ? 'Saving...' : <><FiCheckCircle /> Mark as Complete</>}
              </button>

              <button
                onClick={goToNextLesson}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors"
              >
                Next Lesson →
              </button>
            </div>
          )}

          {/* Mobile progress */}
          <div className="sm:hidden mt-6 space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>{completedLessons.length}/{totalLessons} lessons</span>
              <span>{completionPct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        </main>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside className="w-full sm:w-80 shrink-0 border-l border-white/10 bg-gray-900/60 overflow-y-auto flex flex-col absolute inset-y-0 right-0 top-[57px] z-20 sm:relative sm:top-auto sm:inset-auto">
            <div className="p-4 border-b border-white/10">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Course Content</p>
              <p className="text-xs text-gray-500 mt-0.5">{totalLessons} lessons · {completedLessons.length} completed</p>
            </div>

            <div className="flex-1 overflow-y-auto pb-2">
              {modules.map((mod, mi) => (
                <div key={mod._id} className="border-b border-white/5">
                  {/* Module header */}
                  <button
                    onClick={() => setOpenModules(o => ({ ...o, [mod._id]: !o[mod._id] }))}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 border border-orange-500/30 text-xs font-bold text-orange-400">
                      {mi + 1}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-white line-clamp-1">{mod.title}</span>
                    <span className="text-xs text-gray-500 shrink-0">{mod.lessons.length}</span>
                    {openModules[mod._id] ? <FiChevronUp className="text-gray-500 shrink-0" /> : <FiChevronDown className="text-gray-500 shrink-0" />}
                  </button>

                  {/* Lessons */}
                  {openModules[mod._id] && (
                    <ul className="border-t border-white/5">
                      {mod.lessons.map((lesson) => {
                        const done = completedLessons.includes(String(lesson._id));
                        const active = activeLesson?._id === lesson._id;
                        const type = lesson.contentType || (lesson.videoUrl ? 'video' : 'text');
                        const Icon = type === 'video' ? FiPlayCircle : type === 'image' ? FiImage : FiFileText;

                        return (
                          <li key={lesson._id}>
                            <button
                              onClick={() => { setActiveLesson(lesson); if (window.innerWidth < 640) setSidebarOpen(false); }}
                              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                                active ? 'bg-sky-500/15 border-l-2 border-sky-500' : 'hover:bg-white/5 border-l-2 border-transparent'
                              }`}
                            >
                              <span className="mt-0.5 shrink-0">
                                {done
                                  ? <FiCheckCircle className="text-green-400 text-base" />
                                  : <FiCircle className={`text-base ${active ? 'text-sky-400' : 'text-gray-600'}`} />
                                }
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm line-clamp-2 ${active ? 'text-white font-semibold' : done ? 'text-gray-400' : 'text-gray-300'}`}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Icon className="text-xs text-gray-600" />
                                  {lesson.duration > 0 && (
                                    <span className="text-xs text-gray-600">{Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            {/* ── Generate Certificate ── */}
            <div className="p-4 border-t border-white/10 mt-auto">
              {!certEligible && (
                <p className="text-xs text-gray-500 text-center mb-2">
                  Complete 70% to unlock certificate ({completionPct}% done)
                </p>
              )}
              <div className="w-full bg-white/5 rounded-full h-1.5 mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${completionPct >= 70 ? 'bg-yellow-400' : 'bg-white/20'}`}
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <button
                onClick={handleGenerateCertificate}
                disabled={!certEligible || generatingCert}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                  certEligible
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 hover:opacity-90 shadow-lg shadow-yellow-500/20'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
                }`}
              >
                <FiAward className={certEligible ? 'text-gray-900' : 'text-gray-600'} />
                {generatingCert ? 'Generating...' : certificate ? 'Download Certificate' : 'Generate Certificate'}
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
