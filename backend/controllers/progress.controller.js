import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

import { CourseProgress } from '../models/courseProgress.model.js';
import { Lesson } from '../models/lesson.model.js';
import { Purchase } from '../models/purchase.model.js';
import { Certificate } from '../models/certificate.model.js';
import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, '../../frontend/public/certificate_temp.png');

// Template dimensions: 1402 x 1122
const W = 1402;

// ── helpers ───────────────────────────────────────────────────────────────────

function svgText(text, x, y, fontSize, color = '#1a1a2e', fontWeight = 'bold', maxWidth = 900) {
  // Truncate long text with ellipsis
  const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<text
    x="${x}" y="${y}"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${fontSize}"
    font-weight="${fontWeight}"
    fill="${color}"
    text-anchor="middle"
    dominant-baseline="middle"
  >${safe}</text>`;
}

function buildSvgOverlay(studentName, courseName, issuedAt, certificateId) {
  const dateStr = new Date(issuedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const idStr = `SH-${new Date().getFullYear()}-${certificateId
    .replace(/-/g, '')
    .slice(0, 6)
    .toUpperCase()}`;

  const cx = W / 2; // 701 — horizontal center

  return Buffer.from(`
    <svg width="1402" height="1122" xmlns="http://www.w3.org/2000/svg">
      ${svgText(studentName, cx, 530, 62, '#1a1a2e', 'bold')}
      ${svgText(courseName, cx, 683, 38, '#2c3e7a', 'normal')}
      ${svgText(dateStr, 1045, 887, 28, '#555555', 'normal')}
      ${svgText(idStr, 405, 887, 22, '#4b5563', 'normal')}
    </svg>
  `);
}

// ── controllers ───────────────────────────────────────────────────────────────

export const getProgress = async (req, res) => {
  const userId = req.userId;
  const { courseId } = req.params;

  try {
    const purchased = await Purchase.findOne({ userId, courseId });
    if (!purchased) return res.status(403).json({ message: 'Course not purchased' });

    const progress = await CourseProgress.findOne({ userId, courseId });
    return res.status(200).json({ progress: progress || null });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch progress' });
  }
};

export const markLessonComplete = async (req, res) => {
  const userId = req.userId;
  const { courseId, lessonId } = req.params;

  try {
    const purchased = await Purchase.findOne({ userId, courseId });
    if (!purchased) return res.status(403).json({ message: 'Course not purchased' });

    const totalLessons = await Lesson.countDocuments({ courseId });

    let progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress) {
      progress = new CourseProgress({ userId, courseId, completedLessons: [], startedAt: new Date() });
    }

    const alreadyDone = progress.completedLessons.map(String).includes(String(lessonId));
    if (!alreadyDone) progress.completedLessons.push(lessonId);

    progress.lastAccessed = new Date();
    progress.completionPercentage = totalLessons > 0
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;

    if (progress.completionPercentage === 100 && !progress.completedAt) {
      progress.completedAt = new Date();
    }

    await progress.save();
    return res.status(200).json({ progress });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update progress', error: error.message });
  }
};

export const generateCertificate = async (req, res) => {
  const userId = req.userId;
  const { courseId } = req.params;

  try {
    // 1. Verify purchase
    const purchased = await Purchase.findOne({ userId, courseId });
    if (!purchased) return res.status(403).json({ message: 'Course not purchased' });

    // 2. Check progress >= 70%
    const progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress || progress.completionPercentage < 70) {
      return res.status(400).json({ message: 'Complete at least 70% of the course to get a certificate' });
    }

    // 3. Return existing certificate if already issued
    const existing = await Certificate.findOne({ userId, courseId });
    if (existing) {
      return res.status(200).json({ certificate: existing, alreadyIssued: true });
    }

    // 4. Fetch user + course
    const [user, course] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId),
    ]);

    const studentName = `${user.firstName} ${user.lastName}`;
    const courseName = course.title;
    const issuedAt = new Date();
    const certificateId = uuidv4();

    // 5. Composite text onto template using sharp + SVG overlay
    const svgOverlay = buildSvgOverlay(studentName, courseName, issuedAt, certificateId);

    const imageBuffer = await sharp(TEMPLATE_PATH)
      .composite([{ input: svgOverlay, blend: 'over' }])
      .png()
      .toBuffer();

    // 6. Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'skillharbor/certificates',
          public_id: `cert_${certificateId}`,
          resource_type: 'image',
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(imageBuffer);
    });

    // 7. Save to DB
    const certificate = await Certificate.create({
      certificateId,
      userId,
      courseId,
      studentName,
      courseName,
      issuedAt,
      certificateUrl: uploadResult.secure_url,
    });

    return res.status(201).json({ certificate });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return res.status(500).json({ message: 'Failed to generate certificate', error: error.message });
  }
};
