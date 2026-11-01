import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Header
    'brand.name': 'FixMyRAK',
    'brand.tagline': 'Your Community. Your Voice. A Better RAK.',
    'brand.badge': 'UAE',

    // Navigation
    'nav.home': 'Home',
    'nav.explore': 'Explore Reports',
    'nav.map': 'Interactive Map',
    'nav.myReports': 'My Reports',
    'nav.about': 'About & Transparency',
    'nav.feedback': 'Feedback',
    'nav.reportIssue': 'Report an Issue',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    'nav.admin': 'Admin Panel',
    'nav.profile': 'My Submissions & Profile',

    // Statuses
    'status.all': 'All Statuses',
    'status.Submitted': 'Submitted',
    'status.Under Review': 'Under Review',
    'status.In Progress': 'In Progress',
    'status.Resolved': 'Resolved',

    // Categories
    'cat.all': 'All Categories',
    'cat.Water Saving': 'Water Saving',
    'cat.Electricity Saving': 'Electricity Saving',
    'cat.Recycling': 'Recycling',
    'cat.Greener Living': 'Greener Living',
    'cat.Roads and Potholes': 'Roads & Potholes',
    'cat.Streetlights': 'Streetlights',
    'cat.Pavements': 'Pavements & Walkways',
    'cat.Public Facilities': 'Public Facilities',
    'cat.Other Infrastructure': 'Other Infrastructure',
    'cat.Waste Management': 'Waste Management (Legacy)',

    // Explore Reports Page
    'explore.badge': 'Ras Al Khaimah Public Reports',
    'explore.title': 'Explore Community Reports',
    'explore.subtitle': 'Search, filter, and track civic issues reported by citizens and visitors across RAK.',
    'explore.searchPlaceholder': 'Search by description, location, or reporter name...',
    'explore.searchAll': 'All Fields',
    'explore.searchDesc': 'Description',
    'explore.searchLocation': 'Location',
    'explore.searchReporter': 'Reporter Name',
    'explore.showing': 'Showing',
    'explore.of': 'of',
    'explore.reports': 'reports',
    'explore.clearFilters': 'Clear all filters',
    'explore.noReports': 'No matching reports found',
    'explore.noReportsDesc': 'Try adjusting your search query, changing the field scope, or clearing filters.',
    'explore.resetFilters': 'Reset Filters',
    'explore.sortNewest': 'Sort: Newest First',
    'explore.sortOldest': 'Sort: Oldest First',
    'explore.tabAll': 'All Community Reports',
    'explore.tabMy': 'My Reports Only',
    'explore.viewDetails': 'View Details',
    'explore.matchedIn': 'Matched in',

    // Map Page
    'map.badge': 'Geographic Explorer',
    'map.title': 'Interactive Ras Al Khaimah Map',
    'map.subtitle': 'Live geographic distribution of community-reported infrastructure defects in RAK.',
    'map.resetView': 'Reset RAK View',
    'map.myLocation': 'My Location',
    'map.googleMaps': 'Google Maps',
    'map.legend': 'Map Legend',
    'map.searchPlaceholder': 'Search map locations or reports...',
    'map.districts': 'Key Districts',
    'map.selectedReport': 'Selected Report',
    'map.inspectHint': 'Click any pin to inspect incident details',

    // My Reports / Dashboard
    'myreports.title': 'My Community Reports',
    'myreports.subtitle': 'Track the real-time progress of all civic issues you submitted to RAK authorities.',
    'myreports.total': 'Total Submitted',
    'myreports.awaiting': 'Awaiting Review',
    'myreports.inProgress': 'In Progress',
    'myreports.resolved': 'Resolved',
    'myreports.searchPlaceholder': 'Search within my reports by title, keyword, or street...',
    'myreports.noReports': 'You haven’t submitted any reports yet',
    'myreports.noReportsDesc': 'Spotted a pothole, broken streetlight, or damaged facility? Submit a report now to help improve RAK!',
    'myreports.submitFirst': 'Submit Your First Report',
    'myreports.guestNotice': 'You are currently browsing as a guest. Sign in to view and manage your submissions across all devices.',
    'myreports.trackDetails': 'Track Details',
    'myreports.showOnMap': 'Show on Map',
    'myreports.deleteReport': 'Delete',

    // Report Detail Modal
    'modal.timeline': 'Status Timeline',
    'modal.location': 'Report Location',
    'modal.submittedBy': 'Submitted by',
    'modal.aiAnalysis': 'AI Civic Analysis',
    'modal.translateBtn': 'Translate Report',
    'modal.translating': 'Translating...',
    'modal.showOriginal': 'Show Original',
    'modal.share': 'Share',
    'modal.linkCopied': 'Link Copied!',

    // Common
    'common.verified': 'Verified',
    'common.loading': 'Loading...',
    'common.close': 'Close',
  },
  ar: {
    // Brand & Header
    'brand.name': 'فكس ماي رأس الخيمة',
    'brand.tagline': 'مجتمعك. صوتك. رأس خيمة أفضل.',
    'brand.badge': 'الإمارات',

    // Navigation
    'nav.home': 'الرئيسية',
    'nav.explore': 'استكشاف البلاغات',
    'nav.map': 'الخريطة التفاعلية',
    'nav.myReports': 'بلاغاتي',
    'nav.about': 'عن المبادرة والشفافية',
    'nav.feedback': 'الملاحظات والآراء',
    'nav.reportIssue': 'إبلاغ عن مشكلة',
    'nav.signIn': 'تسجيل الدخول',
    'nav.signOut': 'تسجيل الخروج',
    'nav.admin': 'لوحة الإدارة',
    'nav.profile': 'بلاغاتي وملفي الشخصي',

    // Statuses
    'status.all': 'جميع الحالات',
    'status.Submitted': 'تم الإرسال',
    'status.Under Review': 'قيد المراجعة',
    'status.In Progress': 'قيد التنفيذ',
    'status.Resolved': 'تم الحل',

    // Categories
    'cat.all': 'جميع الفئات',
    'cat.Water Saving': 'ترشيد المياه والحفاظ عليها',
    'cat.Electricity Saving': 'ترشيد الكهرباء والطاقة',
    'cat.Recycling': 'إعادة التدوير',
    'cat.Greener Living': 'الحياة الخضراء والاستدامة',
    'cat.Roads and Potholes': 'الطرق والحفر',
    'cat.Streetlights': 'أعمدة الإنارة',
    'cat.Pavements': 'الأرصفة والممرات',
    'cat.Public Facilities': 'المرافق العامة',
    'cat.Other Infrastructure': 'بنية تحتية أخرى',
    'cat.Waste Management': 'إدارة النفايات (سابقة)',

    // Explore Reports Page
    'explore.badge': 'بلاغات رأس الخيمة العامة',
    'explore.title': 'استكشاف بلاغات المجتمع',
    'explore.subtitle': 'ابحث، صفِّ، وتابع الملاحظات البلدية التي أبلغ عنها المواطنون والمقيمون في رأس الخيمة.',
    'explore.searchPlaceholder': 'ابحث بالوصف، الموقع، أو اسم صاحب البلاغ...',
    'explore.searchAll': 'جميع الحقول',
    'explore.searchDesc': 'الوصف',
    'explore.searchLocation': 'الموقع',
    'explore.searchReporter': 'اسم المبلّغ',
    'explore.showing': 'عرض',
    'explore.of': 'من أصل',
    'explore.reports': 'بلاغ',
    'explore.clearFilters': 'مسح جميع الفلاتر',
    'explore.noReports': 'لم يتم العثور على بلاغات مطابقة',
    'explore.noReportsDesc': 'جرّب تعديل كلمات البحث، أو تغيير نطاق البحث، أو إعادة ضبط الفلاتر.',
    'explore.resetFilters': 'إعادة ضبط الفلاتر',
    'explore.sortNewest': 'الترتيب: الأحدث أولاً',
    'explore.sortOldest': 'الترتيب: الأقدم أولاً',
    'explore.tabAll': 'جميع بلاغات المجتمع',
    'explore.tabMy': 'بلاغاتي فقط',
    'explore.viewDetails': 'عرض التفاصيل',
    'explore.matchedIn': 'تمت المطابقة في',

    // Map Page
    'map.badge': 'المستكشف الجغرافي',
    'map.title': 'خريطة رأس الخيمة التفاعلية',
    'map.subtitle': 'التوزيع الجغرافي المباشر لملاحظات البنية التحتية في إمارة رأس الخيمة.',
    'map.resetView': 'إعادة ضبط الخريطة',
    'map.myLocation': 'موقعي الحالي',
    'map.googleMaps': 'خرائط جوجل',
    'map.legend': 'دليل الخريطة',
    'map.searchPlaceholder': 'ابحث في الخريطة أو المواقع...',
    'map.districts': 'المناطق الرئيسية',
    'map.selectedReport': 'البلاغ المختار',
    'map.inspectHint': 'انقر على أي نقطة للاطلاع على تفاصيل البلاغ',

    // My Reports / Dashboard
    'myreports.title': 'بلاغاتي المجتمعية',
    'myreports.subtitle': 'تابع تقدم ومعالجة كافة البلاغات التي قمت بتقديمها للجهات المختصة في رأس الخيمة.',
    'myreports.total': 'إجمالي البلاغات',
    'myreports.awaiting': 'بانتظار المراجعة',
    'myreports.inProgress': 'قيد المعالجة',
    'myreports.resolved': 'تم الإنجاز والحل',
    'myreports.searchPlaceholder': 'ابحث في بلاغاتي بالعنوان أو الحي أو الوصف...',
    'myreports.noReports': 'لم تقم بتقديم أي بلاغ حتى الآن',
    'myreports.noReportsDesc': 'هل لاحظت حفرة أو عمود إنارة معطلاً أو مرفقاً تالفاً؟ قدّم بلاغاً الآن للمساهمة في تطوير رأس الخيمة!',
    'myreports.submitFirst': 'قدّم بلاغك الأول',
    'myreports.guestNotice': 'أنت تتصفح حالياً كزائر. سجّل دخولك لحفظ ومتابعة بلاغاتك عبر مختلف أجهزتك.',
    'myreports.trackDetails': 'متابعة التفاصيل',
    'myreports.showOnMap': 'عرض على الخريطة',
    'myreports.deleteReport': 'حذف',

    // Report Detail Modal
    'modal.timeline': 'المخطط الزمني للحالة',
    'modal.location': 'موقع البلاغ',
    'modal.submittedBy': 'مُقدّم البلاغ',
    'modal.aiAnalysis': 'التحليل الذكي للبلاغ',
    'modal.translateBtn': 'ترجمة البلاغ',
    'modal.translating': 'جارٍ الترجمة...',
    'modal.showOriginal': 'عرض الأصل',
    'modal.share': 'مشاركة',
    'modal.linkCopied': 'تم نسخ الرابط!',

    // Common
    'common.verified': 'معتمد',
    'common.loading': 'جارٍ التحميل...',
    'common.close': 'إغلاق',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('fixmyrak_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fixmyrak_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL: language === 'ar',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
