import Link from 'next/link';
import Image from 'next/image';
import { Clock, BarChart3 } from 'lucide-react';
import type { Course } from '@/lib/types';
import { formatNaira } from '@/lib/format';

export default function CourseCard({ course, href }: { course: Course; href?: string }) {
  return (
    <Link
      href={href ?? `/courses/${course.slug}`}
      className="group block bg-white border border-navy-100 rounded-2xl overflow-hidden card-hover"
    >
      <div className="relative h-44 bg-navy-100">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950 text-white font-bold text-lg px-4 text-center">
            {course.title}
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white/95 text-navy-900 text-xs font-semibold px-2.5 py-1 rounded-full">
          {course.level}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-navy-900 text-lg group-hover:text-navy-700 transition-colors">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="text-sm text-navy-500 mt-1.5 line-clamp-2">{course.subtitle}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-xs text-navy-500">
          {course.duration_hours != null && (
            <span className="flex items-center gap-1">
              <Clock size={14} /> {course.duration_hours}h
            </span>
          )}
          <span className="flex items-center gap-1">
            <BarChart3 size={14} /> {course.level}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-navy-950">
            {course.price_kobo > 0 ? formatNaira(course.price_kobo) : 'Free'}
          </span>
          <span className="text-sm font-semibold text-navy-700 group-hover:underline">
            View course →
          </span>
        </div>
      </div>
    </Link>
  );
}
