'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AcademySettingsPage() {
  const { user, tenant } = useAuth();

  // Profile Settings State
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Academy Settings State
  const [academyData, setAcademyData] = useState({
    name: tenant?.name || '',
    slug: tenant?.slug || '',
    description: '',
    logo: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAcademyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAcademyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Implement profile update API call
      console.log('Saving profile:', profileData);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setSuccessMessage('تم حفظ التغييرات بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcademySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Implement academy update API call
      console.log('Saving academy settings:', academyData);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setSuccessMessage('تم حفظ إعدادات الأكاديمية بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving academy settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إعدادات الأكاديمية</h1>
        <p className="text-gray-600 mt-2">إدارة الملف الشخصي وإعدادات الأكاديمية</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Profile Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">الملف الشخصي</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="الاسم الأول"
              name="firstName"
              type="text"
              value={profileData.firstName}
              onChange={handleProfileChange}
              disabled={isSaving}
            />

            <Input
              label="اسم العائلة"
              name="lastName"
              type="text"
              value={profileData.lastName}
              onChange={handleProfileChange}
              disabled={isSaving}
            />
          </div>

          <Input
            label="البريد الإلكتروني"
            name="email"
            type="email"
            value={profileData.email}
            onChange={handleProfileChange}
            disabled={isSaving}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Academy Branding */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">العلامة التجارية</h2>
        <form onSubmit={handleAcademySave} className="space-y-4">
          <Input
            label="اسم الأكاديمية"
            name="name"
            type="text"
            value={academyData.name}
            onChange={handleAcademyChange}
            disabled={isSaving}
          />

          <div>
            <Input
              label="رابط الأكاديمية"
              name="slug"
              type="text"
              value={academyData.slug}
              onChange={handleAcademyChange}
              disabled={true}
            />
            <p className="text-sm text-gray-500 mt-1">
              الرابط: {academyData.slug}.academy.com (لا يمكن تغييره)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف الأكاديمية
            </label>
            <textarea
              name="description"
              rows={4}
              value={academyData.description}
              onChange={handleAcademyChange}
              disabled={isSaving}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="اكتب وصفاً موجزاً عن أكاديميتك..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللون الأساسي
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="primaryColor"
                  value={academyData.primaryColor}
                  onChange={handleAcademyChange}
                  disabled={isSaving}
                  className="h-11 w-20 rounded-lg cursor-pointer"
                />
                <Input
                  type="text"
                  value={academyData.primaryColor}
                  onChange={handleAcademyChange}
                  disabled={isSaving}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللون الثانوي
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="secondaryColor"
                  value={academyData.secondaryColor}
                  onChange={handleAcademyChange}
                  disabled={isSaving}
                  className="h-11 w-20 rounded-lg cursor-pointer"
                />
                <Input
                  type="text"
                  value={academyData.secondaryColor}
                  onChange={handleAcademyChange}
                  disabled={isSaving}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Academy URL */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">رابط الأكاديمية</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">رابط أكاديميتك العام:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white px-4 py-2 rounded border border-gray-300 font-mono text-sm">
              https://{tenant?.slug}.academy.com
            </code>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(`https://${tenant?.slug}.academy.com`);
                setSuccessMessage('تم نسخ الرابط بنجاح');
                setTimeout(() => setSuccessMessage(''), 3000);
              }}
            >
              نسخ
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-4">منطقة الخطر</h2>
        <p className="text-gray-600 mb-4">
          إجراءات لا يمكن التراجع عنها. تعامل بحذر.
        </p>
        <Button variant="destructive" disabled>
          حذف الأكاديمية (قريباً)
        </Button>
      </Card>
    </div>
  );
}
