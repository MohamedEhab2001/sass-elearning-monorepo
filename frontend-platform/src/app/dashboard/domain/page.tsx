'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import {
  Globe,
  Check,
  X,
  AlertCircle,
  Copy,
  RefreshCw,
  Shield,
  ExternalLink,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';

interface Domain {
  _id: string;
  tenantId: string;
  type: 'subdomain' | 'custom_domain';
  subdomain?: string;
  customDomain?: string;
  status: 'pending' | 'verified' | 'failed' | 'active' | 'inactive';
  verificationToken?: string;
  verifiedAt?: Date;
  requiredDNSRecords?: DNSRecord[];
  sslEnabled: boolean;
  sslIssuedAt?: Date;
  sslExpiresAt?: Date;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT';
  name: string;
  value: string;
  ttl?: number;
}

interface SubdomainAvailability {
  subdomain: string;
  available: boolean;
  suggestions?: string[];
}

export default function DomainSettingsPage() {
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Subdomain form
  const [subdomainInput, setSubdomainInput] = useState('');
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [subdomainAvailability, setSubdomainAvailability] = useState<SubdomainAvailability | null>(null);
  const [subdomainSubmitting, setSubdomainSubmitting] = useState(false);

  // Custom domain form
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [customDomainSubmitting, setCustomDomainSubmitting] = useState(false);
  const [showCustomDomainForm, setShowCustomDomainForm] = useState(false);

  // Verification
  const [verifying, setVerifying] = useState<string | null>(null);

  const platformDomain = 'platform.com'; // TODO: Get from config

  useEffect(() => {
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }

    loadDomains();
  }, [accessToken, router]);

  const loadDomains = async () => {
    try {
      const data = await apiClient.get<Domain[]>(
        `/domains/tenant/${user?.tenantId}`,
        accessToken!
      );
      setDomains(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'فشل تحميل إعدادات النطاق');
      setLoading(false);
    }
  };

  const checkSubdomainAvailability = async () => {
    if (!subdomainInput || subdomainInput.length < 3) {
      setSubdomainAvailability(null);
      return;
    }

    setSubdomainChecking(true);
    try {
      const data = await apiClient.get<SubdomainAvailability>(
        `/domains/subdomain/check?subdomain=${subdomainInput}`,
        accessToken!
      );
      setSubdomainAvailability(data);
    } catch (err: any) {
      setError(err.message || 'فشل التحقق من توفر النطاق الفرعي');
    } finally {
      setSubdomainChecking(false);
    }
  };

  const handleCreateSubdomain = async () => {
    if (!subdomainAvailability?.available) return;

    setSubdomainSubmitting(true);
    try {
      await apiClient.post(
        `/domains/subdomain/${user?.tenantId}`,
        { subdomain: subdomainInput },
        accessToken!
      );
      await loadDomains();
      setSubdomainInput('');
      setSubdomainAvailability(null);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء النطاق الفرعي');
    } finally {
      setSubdomainSubmitting(false);
    }
  };

  const handleUpdateSubdomain = async () => {
    if (!subdomainAvailability?.available) return;

    setSubdomainSubmitting(true);
    try {
      await apiClient.put(
        `/domains/subdomain/${user?.tenantId}`,
        { subdomain: subdomainInput },
        accessToken!
      );
      await loadDomains();
      setSubdomainInput('');
      setSubdomainAvailability(null);
    } catch (err: any) {
      setError(err.message || 'فشل تحديث النطاق الفرعي');
    } finally {
      setSubdomainSubmitting(false);
    }
  };

  const handleAddCustomDomain = async () => {
    if (!customDomainInput) return;

    setCustomDomainSubmitting(true);
    try {
      await apiClient.post(
        `/domains/custom/${user?.tenantId}`,
        { customDomain: customDomainInput },
        accessToken!
      );
      await loadDomains();
      setCustomDomainInput('');
      setShowCustomDomainForm(false);
    } catch (err: any) {
      setError(err.message || 'فشل إضافة النطاق المخصص');
    } finally {
      setCustomDomainSubmitting(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifying(domainId);
    try {
      const result = await apiClient.post(
        `/domains/custom/${domainId}/verify`,
        {},
        accessToken!
      );
      await loadDomains();
      if (result.verified) {
        alert('تم التحقق من النطاق بنجاح!');
      } else {
        alert('فشل التحقق. يرجى التأكد من إعدادات DNS.');
      }
    } catch (err: any) {
      setError(err.message || 'فشل التحقق من النطاق');
    } finally {
      setVerifying(null);
    }
  };

  const handleRemoveCustomDomain = async (domainId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا النطاق؟')) return;

    try {
      await apiClient.delete(
        `/domains/custom/${domainId}/${user?.tenantId}`,
        accessToken!
      );
      await loadDomains();
    } catch (err: any) {
      setError(err.message || 'فشل حذف النطاق');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم النسخ إلى الحافظة');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'نشط', className: 'bg-green-100 text-green-700', icon: Check },
      verified: { label: 'تم التحقق', className: 'bg-green-100 text-green-700', icon: Check },
      pending: { label: 'قيد الانتظار', className: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
      failed: { label: 'فشل', className: 'bg-red-100 text-red-700', icon: X },
      inactive: { label: 'غير نشط', className: 'bg-gray-100 text-gray-700', icon: X },
    };

    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const subdomainDomain = domains.find(d => d.type === 'subdomain');
  const customDomains = domains.filter(d => d.type === 'custom_domain');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowRight className="h-5 w-5" />
            رجوع
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إعدادات النطاق</h1>
          <p className="text-gray-600">إدارة النطاق الفرعي والنطاقات المخصصة للأكاديمية</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Subdomain Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">النطاق الفرعي</h2>
              <p className="text-sm text-gray-600">نطاقك على منصتنا</p>
            </div>
          </div>

          {subdomainDomain ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-semibold text-gray-900">
                    {subdomainDomain.subdomain}.{platformDomain}
                  </span>
                  {getStatusBadge(subdomainDomain.status)}
                  {subdomainDomain.isPrimary && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      أساسي
                    </span>
                  )}
                </div>
                <a
                  href={`https://${subdomainDomain.subdomain}.${platformDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  زيارة
                </a>
              </div>
              <p className="text-sm text-gray-600">
                تم الإنشاء: {new Date(subdomainDomain.createdAt).toLocaleDateString('ar-EG')}
              </p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
              <p className="text-gray-600 mb-4">لم يتم إنشاء نطاق فرعي بعد</p>
            </div>
          )}

          {/* Subdomain Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {subdomainDomain ? 'تحديث النطاق الفرعي' : 'إنشاء نطاق فرعي'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={subdomainInput}
                  onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  onBlur={checkSubdomainAvailability}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="academy-name"
                  dir="ltr"
                  minLength={3}
                  maxLength={63}
                />
                <span className="text-gray-600">.{platformDomain}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط (3-63 حرف)
              </p>
            </div>

            {subdomainChecking && (
              <div className="flex items-center gap-2 text-gray-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">جاري التحقق...</span>
              </div>
            )}

            {subdomainAvailability && (
              <div className={`p-4 rounded-lg ${subdomainAvailability.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {subdomainAvailability.available ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="h-5 w-5" />
                    <span>النطاق الفرعي متاح!</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                      <X className="h-5 w-5" />
                      <span>النطاق الفرعي غير متاح</span>
                    </div>
                    {subdomainAvailability.suggestions && subdomainAvailability.suggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">اقتراحات:</p>
                        <div className="flex flex-wrap gap-2">
                          {subdomainAvailability.suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => setSubdomainInput(suggestion)}
                              className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                            >
                              {suggestion}.{platformDomain}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {subdomainAvailability?.available && (
              <button
                onClick={subdomainDomain ? handleUpdateSubdomain : handleCreateSubdomain}
                disabled={subdomainSubmitting}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subdomainSubmitting ? 'جاري الحفظ...' : (subdomainDomain ? 'تحديث النطاق الفرعي' : 'إنشاء النطاق الفرعي')}
              </button>
            )}
          </div>
        </div>

        {/* Custom Domains Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">النطاقات المخصصة</h2>
                <p className="text-sm text-gray-600">استخدم نطاقك الخاص</p>
              </div>
            </div>
            {!showCustomDomainForm && (
              <button
                onClick={() => setShowCustomDomainForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                إضافة نطاق
              </button>
            )}
          </div>

          {/* Add Custom Domain Form */}
          {showCustomDomainForm && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">إضافة نطاق مخصص</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value.toLowerCase())}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="www.academy-name.com"
                    dir="ltr"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddCustomDomain}
                    disabled={customDomainSubmitting || !customDomainInput}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {customDomainSubmitting ? 'جاري الإضافة...' : 'إضافة النطاق'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomDomainForm(false);
                      setCustomDomainInput('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Domains List */}
          {customDomains.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-600">لا توجد نطاقات مخصصة بعد</p>
              <p className="text-sm text-gray-500 mt-1">أضف نطاقك الخاص للحصول على عنوان URL مميز</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customDomains.map((domain) => (
                <div key={domain._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-mono font-semibold text-gray-900">
                        {domain.customDomain}
                      </span>
                      {getStatusBadge(domain.status)}
                      {domain.isPrimary && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          أساسي
                        </span>
                      )}
                      {domain.sslEnabled && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          SSL
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {domain.status !== 'verified' && (
                        <button
                          onClick={() => handleVerifyDomain(domain._id)}
                          disabled={verifying === domain._id}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {verifying === domain._id ? 'جاري التحقق...' : 'التحقق'}
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveCustomDomain(domain._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* DNS Records */}
                  {domain.requiredDNSRecords && domain.requiredDNSRecords.length > 0 && domain.status !== 'verified' && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-3">
                      <h4 className="font-semibold text-gray-900 mb-3">سجلات DNS المطلوبة:</h4>
                      <div className="space-y-2">
                        {domain.requiredDNSRecords.map((record, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="grid grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">النوع:</span>
                                <p className="font-mono font-semibold">{record.type}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">الاسم:</span>
                                <p className="font-mono font-semibold">{record.name}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-600">القيمة:</span>
                                <div className="flex items-center gap-2">
                                  <p className="font-mono font-semibold text-xs break-all">{record.value}</p>
                                  <button
                                    onClick={() => copyToClipboard(record.value)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                          قم بإضافة هذه السجلات في إعدادات DNS لدى مزود النطاق الخاص بك، ثم انقر على "التحقق"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
