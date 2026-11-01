import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { reportService } from './services/reportService';
import { Report, ReportCategory } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ReportDetailModal } from './components/ReportDetailModal';
import { HomePage } from './pages/HomePage';
import { ExploreReportsPage } from './pages/ExploreReportsPage';
import { ReportSubmissionPage } from './pages/ReportSubmissionPage';
import { MapPage } from './pages/MapPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { FeedbackPage } from './pages/FeedbackPage';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);
  const [selectedReportForModal, setSelectedReportForModal] = useState<Report | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Subscribe to real-time reports from Cloud Firestore
  useEffect(() => {
    // Seed initial authentic RAK reports if database is empty
    reportService.seedInitialReports(user?.uid).catch((err) => {
      console.warn('Initial seed check:', err);
    });

    const unsubscribe = reportService.subscribeReports(
      (updatedReports) => {
        setReports(updatedReports);
        setLoadingReports(false);
      },
      (error) => {
        console.error('Subscription error:', error);
        setLoadingReports(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handle URL query parameters (e.g. ?reportId=xyz)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reportIdParam = params.get('reportId');
    if (reportIdParam && reports.length > 0) {
      const match = reports.find((r) => r.id === reportIdParam);
      if (match) {
        setSelectedReportForModal(match);
      }
    }
  }, [reports]);

  const handleSelectReport = (report: Report) => {
    setSelectedReportForModal(report);
  };

  const handleReportCreated = (newReportId: string) => {
    const created = reports.find((r) => r.id === newReportId);
    if (created) {
      setSelectedReportForModal(created);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f3] text-[#1c302c] font-sans antialiased selection:bg-[#143d35] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={() => setIsAuthModalOpen(true)}
        myReportsCount={user ? reports.filter((r) => r.userId === user.uid).length : 0}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            reports={reports}
            setCurrentTab={setCurrentTab}
            setSelectedCategory={setSelectedCategory}
            onSelectReport={handleSelectReport}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreReportsPage
            reports={reports}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectReport={handleSelectReport}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'map' && (
          <MapPage
            reports={reports}
            onSelectReport={handleSelectReport}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'report' && (
          <ReportSubmissionPage
            existingReports={reports}
            onReportCreated={handleReportCreated}
            openAuthModal={() => setIsAuthModalOpen(true)}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'dashboard' && (
          <UserDashboardPage
            reports={reports}
            onSelectReport={handleSelectReport}
            setCurrentTab={setCurrentTab}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage
            reports={reports}
            onSelectReport={handleSelectReport}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'about' && <AboutPage />}

        {currentTab === 'feedback' && <FeedbackPage />}
      </main>

      {/* Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ReportDetailModal
        report={selectedReportForModal}
        onClose={() => setSelectedReportForModal(null)}
        onStatusUpdated={() => {
          // Reports update automatically via onSnapshot
        }}
        onReportDeleted={() => {
          setSelectedReportForModal(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainApp />
      </LanguageProvider>
    </AuthProvider>
  );
}
