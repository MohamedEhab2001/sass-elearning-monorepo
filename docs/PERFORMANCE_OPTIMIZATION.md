# Performance Optimization Guide

This document outlines performance optimization strategies and recommendations for the SASS E-Learning platform.

## Table of Contents

1. [Frontend Optimization](#frontend-optimization)
2. [Backend Optimization](#backend-optimization)
3. [Database Optimization](#database-optimization)
4. [Media & Assets](#media--assets)
5. [Caching Strategies](#caching-strategies)
6. [Monitoring & Metrics](#monitoring--metrics)

---

## Frontend Optimization

### Code Splitting

**Implement dynamic imports for routes:**

```tsx
// ✅ Good - Route-level code splitting
const DashboardPage = dynamic(() => import('./dashboard/page'), {
  loading: () => <LoadingSpinner />,
});

const CoursePage = dynamic(() => import('./courses/[id]/page'), {
  loading: () => <CoursesSkeleton />,
});

// ❌ Avoid - All code in main bundle
import DashboardPage from './dashboard/page';
import CoursePage from './courses/[id]/page';
```

**Component-level code splitting for heavy components:**

```tsx
// ✅ Good - Heavy editor loaded only when needed
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div>جاري تحميل المحرر...</div>,
});

// ✅ Good - Chart library loaded on demand
const AnalyticsChart = dynamic(() => import('@/components/AnalyticsChart'), {
  ssr: false,
});
```

### Image Optimization

**Use Next.js Image component:**

```tsx
import Image from 'next/image';

// ✅ Good - Optimized with lazy loading
<Image
  src={course.thumbnail}
  alt={course.title}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ❌ Avoid - Unoptimized
<img src={course.thumbnail} alt={course.title} />
```

**Recommended image formats:**
- Use WebP with JPEG fallback
- Generate responsive image sizes (400w, 800w, 1200w)
- Compress images to 80-85% quality
- Use CDN for static assets

### Bundle Size Optimization

**Analyze bundle size:**

```bash
# Add to package.json
"scripts": {
  "analyze": "ANALYZE=true next build"
}

# Run analysis
npm run analyze
```

**Tree shaking - import specific modules:**

```tsx
// ✅ Good - Import only what you need
import { formatCurrency, formatDate } from '@/shared/utils/formatting';

// ❌ Avoid - Imports entire library
import * as formatting from '@/shared/utils/formatting';
```

**Optimize icon imports:**

```tsx
// ✅ Good - Import specific icons
import { ArrowRight, Check, X } from 'lucide-react';

// ❌ Avoid - Imports all icons
import * as Icons from 'lucide-react';
```

### Lazy Loading

**Implement intersection observer for lazy loading:**

```tsx
const LazySection = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? children : <div className="h-64 bg-gray-100 animate-pulse" />}
    </div>
  );
};
```

### React Performance

**Memoize expensive computations:**

```tsx
import { useMemo, useCallback } from 'react';

// ✅ Good - Memoize expensive filtering/sorting
const filteredCourses = useMemo(() => {
  return courses
    .filter(course => course.category === selectedCategory)
    .sort((a, b) => b.rating - a.rating);
}, [courses, selectedCategory]);

// ✅ Good - Memoize callbacks to prevent re-renders
const handleCourseClick = useCallback((courseId: string) => {
  router.push(`/courses/${courseId}`);
}, [router]);
```

**Use React.memo for pure components:**

```tsx
import { memo } from 'react';

// ✅ Good - Prevent unnecessary re-renders
const CourseCard = memo(({ course }) => {
  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <p>{course.description}</p>
    </div>
  );
});

CourseCard.displayName = 'CourseCard';
```

### Virtualization for Long Lists

**Use react-window for long lists:**

```tsx
import { FixedSizeList } from 'react-window';

const CoursesList = ({ courses }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <CourseCard course={courses[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={courses.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

---

## Backend Optimization

### Database Query Optimization

**Use select projections to limit fields:**

```typescript
// ✅ Good - Only fetch needed fields
const courses = await this.courseModel
  .find({ published: true })
  .select('title description price thumbnail')
  .limit(20)
  .lean()
  .exec();

// ❌ Avoid - Fetches all fields
const courses = await this.courseModel.find({ published: true }).exec();
```

**Use lean() for read-only queries:**

```typescript
// ✅ Good - Plain JavaScript objects (faster)
const course = await this.courseModel.findById(id).lean().exec();

// ❌ Avoid - Mongoose document with overhead
const course = await this.courseModel.findById(id).exec();
```

**Implement pagination:**

```typescript
// ✅ Good - Paginated results
async findAll(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    this.courseModel
      .find()
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    this.courseModel.countDocuments(),
  ]);

  return {
    data: courses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

### Caching

**Implement Redis caching for frequently accessed data:**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CoursesService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async findById(id: string) {
    // Check cache first
    const cached = await this.redis.get(`course:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const course = await this.courseModel.findById(id).lean().exec();

    // Cache for 1 hour
    await this.redis.setex(`course:${id}`, 3600, JSON.stringify(course));

    return course;
  }

  async update(id: string, updateDto: UpdateCourseDto) {
    const course = await this.courseModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    // Invalidate cache
    await this.redis.del(`course:${id}`);

    return course;
  }
}
```

### Batch Processing

**Process bulk operations in batches:**

```typescript
async enrollStudents(courseId: string, studentIds: string[]) {
  const BATCH_SIZE = 100;

  for (let i = 0; i < studentIds.length; i += BATCH_SIZE) {
    const batch = studentIds.slice(i, i + BATCH_SIZE);

    const enrollments = batch.map(studentId => ({
      courseId,
      studentId,
      enrolledAt: new Date(),
    }));

    await this.enrollmentModel.insertMany(enrollments);

    // Prevent overwhelming the database
    await this.delay(100);
  }
}

private delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Async Processing

**Use queues for heavy operations:**

```typescript
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailsService {
  constructor(
    @InjectQueue('emails') private emailQueue: Queue,
  ) {}

  async sendBulkEmails(recipients: string[], template: string, data: any) {
    // Add to queue instead of processing synchronously
    await this.emailQueue.add('send-bulk', {
      recipients,
      template,
      data,
    });

    return { message: 'Emails queued for sending' };
  }
}

// In email processor
@Processor('emails')
export class EmailProcessor {
  @Process('send-bulk')
  async handleBulkEmails(job: Job) {
    const { recipients, template, data } = job.data;

    for (const recipient of recipients) {
      await this.emailService.sendEmail(recipient, template, data);
      await job.progress((recipients.indexOf(recipient) / recipients.length) * 100);
    }
  }
}
```

---

## Database Optimization

### Indexes

**Create indexes for frequently queried fields:**

```typescript
// In schema file
@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, index: true })
  published: boolean;

  @Prop({ required: true, index: true })
  category: string;

  // Compound index for common queries
  @Index({ tenantId: 1, published: 1, category: 1 })
  static compoundIndex: void;
}
```

**Monitor slow queries:**

```typescript
// Enable MongoDB profiling
mongoose.set('debug', (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});
```

### Aggregation Pipeline Optimization

**Use $match early in pipeline:**

```typescript
// ✅ Good - Filter first
const stats = await this.courseModel.aggregate([
  { $match: { tenantId: new Types.ObjectId(tenantId), published: true } },
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

// ❌ Avoid - Filter after grouping
const stats = await this.courseModel.aggregate([
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $match: { tenantId: new Types.ObjectId(tenantId) } },
  { $sort: { count: -1 } },
]);
```

**Use $project to limit fields:**

```typescript
const courses = await this.courseModel.aggregate([
  { $match: { published: true } },
  { $project: { title: 1, price: 1, thumbnail: 1, _id: 1 } },
  { $limit: 20 },
]);
```

---

## Media & Assets

### Video Optimization

**Recommendations for video content:**

- Use adaptive bitrate streaming (HLS or DASH)
- Generate multiple quality levels (360p, 480p, 720p, 1080p)
- Use CDN for video delivery
- Implement lazy loading for video thumbnails
- Add preview/thumbnail generation

**Example video processing:**

```typescript
async processVideo(videoFile: Express.Multer.File) {
  // Upload original to S3
  const originalKey = await this.s3Service.upload(videoFile);

  // Queue transcoding job
  await this.videoQueue.add('transcode', {
    originalKey,
    qualities: ['360p', '480p', '720p', '1080p'],
    format: 'hls',
  });

  return { videoId: originalKey, status: 'processing' };
}
```

### Static Assets CDN

**Use CDN for static assets:**

```typescript
// .env
CDN_URL=https://cdn.yourplatform.com

// In code
const assetUrl = `${process.env.CDN_URL}/images/${filename}`;
```

**Set cache headers:**

```typescript
@Controller('assets')
export class AssetsController {
  @Get(':filename')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  getAsset(@Param('filename') filename: string) {
    return this.assetsService.getFile(filename);
  }
}
```

---

## Caching Strategies

### HTTP Caching

**Set appropriate cache headers:**

```typescript
// Static content - long cache
@Header('Cache-Control', 'public, max-age=31536000, immutable')

// Dynamic content - short cache
@Header('Cache-Control', 'public, max-age=300, must-revalidate')

// Private content - no cache
@Header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
```

### Redis Caching Patterns

**Cache-aside pattern:**

```typescript
async getCourse(id: string) {
  const cacheKey = `course:${id}`;

  // Try cache first
  const cached = await this.redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch from database
  const course = await this.courseModel.findById(id).lean().exec();

  // Store in cache
  if (course) {
    await this.redis.setex(cacheKey, 3600, JSON.stringify(course));
  }

  return course;
}
```

**Write-through pattern:**

```typescript
async updateCourse(id: string, data: UpdateCourseDto) {
  // Update database
  const course = await this.courseModel
    .findByIdAndUpdate(id, data, { new: true })
    .exec();

  // Update cache
  await this.redis.setex(
    `course:${id}`,
    3600,
    JSON.stringify(course)
  );

  return course;
}
```

---

## Monitoring & Metrics

### Performance Monitoring

**Track key metrics:**

- Response time (P50, P95, P99)
- Database query time
- Cache hit rate
- API error rate
- Bundle size
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

**Implement logging:**

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  async findAll() {
    const start = Date.now();

    const courses = await this.courseModel.find().lean().exec();

    const duration = Date.now() - start;
    this.logger.log(`findAll completed in ${duration}ms`);

    if (duration > 1000) {
      this.logger.warn(`Slow query detected: findAll took ${duration}ms`);
    }

    return courses;
  }
}
```

### Client-Side Performance

**Use Web Vitals:**

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## Implementation Checklist

### Frontend

- [ ] Implement route-based code splitting
- [ ] Add lazy loading for heavy components
- [ ] Optimize images (Next.js Image, WebP format)
- [ ] Implement virtualization for long lists
- [ ] Memoize expensive computations
- [ ] Use React.memo for pure components
- [ ] Analyze and reduce bundle size
- [ ] Enable compression (gzip/brotli)

### Backend

- [ ] Add database indexes for common queries
- [ ] Implement Redis caching
- [ ] Use lean() for read-only queries
- [ ] Add pagination to list endpoints
- [ ] Implement batch processing for bulk operations
- [ ] Use queues for heavy async tasks
- [ ] Set appropriate cache headers
- [ ] Monitor slow queries

### Database

- [ ] Create indexes for frequently queried fields
- [ ] Use compound indexes where appropriate
- [ ] Optimize aggregation pipelines
- [ ] Enable query logging for slow queries
- [ ] Implement connection pooling
- [ ] Regular index analysis and optimization

### Media & Assets

- [ ] Use CDN for static assets
- [ ] Implement video transcoding
- [ ] Generate responsive image sizes
- [ ] Add lazy loading for media
- [ ] Compress and optimize images
- [ ] Use WebP format with fallbacks

### Monitoring

- [ ] Set up performance monitoring (e.g., New Relic, DataDog)
- [ ] Track Web Vitals
- [ ] Monitor cache hit rates
- [ ] Log slow queries
- [ ] Set up alerts for performance degradation
- [ ] Regular performance audits

---

## Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit#optimizing-performance)
- [MongoDB Performance Best Practices](https://www.mongodb.com/docs/manual/administration/analyzing-mongodb-performance/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

---

## Version History

- **v1.0** (2025-11-22) - Initial performance optimization guide created for Phase 15
