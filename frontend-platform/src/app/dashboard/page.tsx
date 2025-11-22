'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, tenant } = useAuth();

  // Placeholder data - will be replaced with real data in future phases
  const stats = [
    {
      name: 'إجمالي الطلاب',
      value: '0',
      change: '+0%',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      iconBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      iconColor: 'text-blue-600',
    },
    {
      name: 'عدد الدورات',
      value: '0',
      change: '+0%',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      gradient: 'from-emerald-500 via-green-600 to-teal-600',
      iconBg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      iconColor: 'text-emerald-600',
    },
    {
      name: 'إجمالي الإيرادات',
      value: '0 ج.م',
      change: '+0%',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: 'from-amber-500 via-orange-600 to-red-600',
      iconBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
      iconColor: 'text-amber-600',
    },
    {
      name: 'الرصيد المتاح',
      value: '0 ج.م',
      change: '+0%',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      gradient: 'from-purple-500 via-violet-600 to-indigo-600',
      iconBg: 'bg-gradient-to-br from-purple-50 to-violet-50',
      iconColor: 'text-purple-600',
    },
  ];

  const quickActions = [
    {
      title: 'إنشاء دورة جديدة',
      description: 'ابدأ بإنشاء دورتك الأولى',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      href: '/dashboard/courses',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'تخصيص الأكاديمية',
      description: 'غيّر الألوان والشعار',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/dashboard/academy',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'دعوة طلاب',
      description: 'شارك رابط أكاديميتك',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
      ),
      href: '/dashboard/students',
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Welcome Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            مرحباً، {user?.firstName}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            إليك نظرة عامة على أكاديمية <span className="font-semibold text-white">{tenant?.name}</span>
          </p>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      </div>

      {/* Email Verification Warning */}
      {!user?.isEmailVerified && (
        <Card variant="outline" className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 animate-in slide-down">
          <div className="flex items-start gap-4 p-4">
            <div className="bg-amber-100 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-amber-900 font-semibold text-lg mb-1">
                يرجى تأكيد بريدك الإلكتروني
              </h3>
              <p className="text-amber-800 text-sm">
                تحقق من بريدك الإلكتروني للحصول على رابط التأكيد. بعض الميزات قد تكون محدودة حتى تأكيد بريدك.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid with Enhanced Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={stat.name}
            variant="elevated"
            hoverable
            className="p-6 group overflow-hidden relative"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <div className={stat.iconColor}>
                    {stat.icon}
                  </div>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions with Modern Cards */}
      <Card variant="ghost" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">البدء السريع</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={action.title} href={action.href}>
              <Card
                variant="outline"
                hoverable
                className="p-5 group cursor-pointer border-2 hover:border-transparent relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl mb-4 bg-gradient-to-br ${action.gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-white transition-colors mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">
                    {action.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Card>

      {/* Academy Info with Modern Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">معلومات الأكاديمية</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-600 font-medium">اسم الأكاديمية</span>
              <span className="font-semibold text-gray-900">{tenant?.name}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-600 font-medium">الرابط</span>
              <code className="text-sm font-mono bg-white px-3 py-1 rounded border border-gray-200 text-indigo-600">
                {tenant?.slug}.academy.com
              </code>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-600 font-medium">حالة البريد الإلكتروني</span>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  user?.isEmailVerified
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                }`}
              >
                {user?.isEmailVerified ? '✓ مُفعّل' : '⚠ غير مُفعّل'}
              </span>
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold">الخطوات التالية</h2>
            </div>
            <ul className="space-y-3">
              {[
                'أكمل إعداد ملف الأكاديمية',
                'أضف أول دورة تعليمية',
                'قم بدعوة الطلاب',
                'راجع إعدادات الدفع',
              ].map((step, index) => (
                <li key={index} className="flex items-center gap-3 text-white/90 hover:text-white transition-colors">
                  <div className="bg-white/20 rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
