import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { reportService } from '../services/reportService';
import { aiService } from '../services/aiService';
import {
  Report,
  ReportCategory,
  AIDuplicateCandidate,
  RAK_PRESET_LOCATIONS,
} from '../types';
import { MapComponent } from '../components/MapComponent';
import {
  MapPin,
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  X,
  RefreshCw,
  Search,
  Check,
  ChevronDown,
  Navigation,
  Info,
} from 'lucide-react';

interface ReportSubmissionPageProps {
  existingReports: Report[];
  onReportCreated: (newReportId: string) => void;
  openAuthModal: () => void;
  setCurrentTab: (tab: string) => void;
}

export const ReportSubmissionPage: React.FC<ReportSubmissionPageProps> = ({
  existingReports,
  onReportCreated,
  openAuthModal,
  setCurrentTab,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Water Saving');
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [latitude, setLatitude] = useState(25.7895);
  const [longitude, setLongitude] = useState(55.9432);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState('');

  // AI Loading & Results States
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateCandidates, setDuplicateCandidates] = useState<AIDuplicateCandidate[]>([]);
  const [duplicateCheckDone, setDuplicateCheckDone] = useState(false);
  const [aiCategorizeNotice, setAiCategorizeNotice] = useState<string | null>(null);
  const [aiEnhanceKeyPoints, setAiEnhanceKeyPoints] = useState<string[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReportId, setSuccessReportId] = useState<string | null>(null);

  const categories: ReportCategory[] = [
    'Water Saving',
    'Electricity Saving',
    'Recycling',
    'Greener Living',
    'Roads and Potholes',
    'Streetlights',
    'Pavements',
    'Public Facilities',
    'Other Infrastructure',
  ];

  // Handle Photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImagePreview(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // AI Action 1: Categorize & Suggest Title
  const handleAiCategorize = async () => {
    if (!description.trim() || description.trim().length < 5) {
      alert('Please enter at least a brief description of the problem first.');
      return;
    }

    setIsCategorizing(true);
    setAiCategorizeNotice(null);
    try {
      const res = await aiService.categorizeIssue(description);
      setCategory(res.category);
      if (!title || title.trim().length < 4) {
        setTitle(res.suggestedTitle);
      }
      setAiSummary(res.shortSummary);
      setAiCategorizeNotice(
        `AI Suggestion: Classified as "${res.category}". Urgency estimate: ${res.urgency.toUpperCase()}. Reason: ${res.reasoning}`
      );
    } catch (err: any) {
      console.error('Categorize error:', err);
      alert('Could not complete AI categorization. You can select manually.');
    } finally {
      setIsCategorizing(false);
    }
  };

  // AI Action 2: Enhance Description
  const handleAiEnhance = async () => {
    if (!description.trim() || description.trim().length < 5) {
      alert('Please write an initial description to improve.');
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await aiService.enhanceDescription(description, locationLabel);
      setDescription(res.enhancedDescription);
      setAiEnhanceKeyPoints(res.keyPoints || []);
    } catch (err: any) {
      console.error('Enhance error:', err);
      alert('Failed to enhance description with AI.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // AI Action 3: Duplicate Check
  const handleCheckDuplicates = async () => {
    if (!description.trim() && !title.trim()) {
      alert('Please enter a title or description before checking duplicates.');
      return;
    }

    setIsCheckingDuplicates(true);
    setDuplicateCheckDone(true);
    try {
      const duplicates = await aiService.checkDuplicates(
        title || 'Community Defect',
        description,
        category,
        locationLabel,
        existingReports
      );
      setDuplicateCandidates(duplicates);
    } catch (err) {
      console.error('Duplicate check error:', err);
      setDuplicateCandidates([]);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      openAuthModal();
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage('Please provide a title with at least 3 characters.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage('Please provide a detailed description (at least 10 characters).');
      return;
    }

    if (!locationLabel.trim()) {
      setErrorMessage('Please describe the street or area location.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReportId = await reportService.createReport({
        userId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Community Member',
        authorEmail: user.email || '',
        title: title.trim(),
        description: description.trim(),
        category,
        location: locationLabel.trim(),
        latitude,
        longitude,
        imageURL: imagePreview || '',
        aiSummary: aiSummary || '',
      });

      setSuccessReportId(newReportId);
      onReportCreated(newReportId);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage('Failed to submit report. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (successReportId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in bg-[#f6f7f3]">
        <div className="w-20 h-20 bg-[#e8f1e9] text-[#143d35] rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#143d35] font-manrope tracking-tight">
          Report Registered Successfully!
        </h2>
        <p className="text-sm text-[#74817b] max-w-md mx-auto leading-relaxed">
          Thank you for helping make Ras Al Khaimah cleaner and safer. Your report has been saved to Cloud Firestore with ID:
          <span className="font-mono font-bold block mt-1 text-[#143d35]">{successReportId}</span>
        </p>

        <div className="p-4 bg-[#e8f1e9]/70 rounded-2xl border border-[#143d35]/15 text-xs text-[#143d35] max-w-md mx-auto text-left">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <Check className="w-4 h-4 text-[#143d35]" />
            Next Steps:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#1c302c]">
            <li>Your submission is now visible on the public map with status "Submitted".</li>
            <li>Municipal coordinators review active reports daily.</li>
            <li>You will receive in-app notifications whenever status changes.</li>
          </ul>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="w-full sm:w-auto px-6 py-3 bg-[#143d35] hover:bg-[#205347] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Go to My Reports
          </button>
          <button
            onClick={() => {
              setSuccessReportId(null);
              setTitle('');
              setDescription('');
              setLocationLabel('');
              setImagePreview(null);
              setAiSummary('');
              setDuplicateCandidates([]);
              setDuplicateCheckDone(false);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-[#f6f7f3] hover:bg-[#e8f1e9] text-[#143d35] font-bold text-xs rounded-xl border border-[#e4e9e1] transition-all cursor-pointer"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#f6f7f3]">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="flex justify-center mb-1">
          <img
            src="/assets/aistudio/FixMyRAK_Coastal_Community_Logo_d0e1428a.png"
            alt="FixMyRAK"
            className="w-14 h-14 object-contain rounded-2xl bg-white p-1 border border-[#e4e9e1] shadow-xs"
          />
        </div>
        <span className="text-[10px] font-bold text-[#819087] uppercase tracking-widest block">
          Civic Infrastructure Reporting
        </span>
        <h1 className="text-3xl font-extrabold text-[#143d35] font-manrope tracking-tight">
          Report an Issue in Ras Al Khaimah
        </h1>
        <p className="text-xs sm:text-sm text-[#74817b]">
          Fill out the details below. Use the Gemini AI assistant to categorize your report, enhance clarity, and verify against existing submissions.
        </p>
      </div>

      {!user && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              You are currently viewing as a guest. You can fill out the form now, and you will be prompted to sign in with Google or Email upon submitting.
            </span>
          </div>
          <button
            type="button"
            onClick={openAuthModal}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0 cursor-pointer"
          >
            Sign In First
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-[#e4e9e1] shadow-xs">
        {/* Section 1: Problem Description & Gemini AI Assistant */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-[#143d35] font-manrope">
              1. What is the issue? <span className="text-[#e97950]">*</span>
            </label>
            <span className="text-[11px] font-semibold text-[#74817b]">
              {description.length} characters
            </span>
          </div>

          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. There is a deep pothole on the right lane near the roundabout leading towards Corniche Al Qawasim. Vehicles are swerving to avoid tire damage..."
            className="w-full p-3.5 text-xs sm:text-sm border border-[#e4e9e1] rounded-xl focus:ring-2 focus:ring-[#143d35] focus:outline-hidden bg-[#f6f7f3]/50 leading-relaxed text-[#1c302c]"
          />

          {/* AI Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleAiCategorize}
              disabled={isCategorizing}
              className="px-3.5 py-2 rounded-xl bg-[#e8f1e9] hover:bg-[#dcebd4] text-[#143d35] text-xs font-bold border border-[#143d35]/20 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isCategorizing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#143d35]" />
              )}
              <span>AI Categorize & Suggest Title</span>
            </button>

            <button
              type="button"
              onClick={handleAiEnhance}
              disabled={isEnhancing}
              className="px-3.5 py-2 rounded-xl bg-[#fff0e8] hover:bg-[#ffe2d3] text-[#e97950] text-xs font-bold border border-[#e97950]/25 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isEnhancing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#e97950]" />
              )}
              <span>AI Polish Clarity</span>
            </button>

            <button
              type="button"
              onClick={handleCheckDuplicates}
              disabled={isCheckingDuplicates}
              className="px-3.5 py-2 rounded-xl bg-[#efebf8] hover:bg-[#e4def0] text-[#6b21a8] text-xs font-bold border border-[#6b21a8]/25 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isCheckingDuplicates ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5 text-[#6b21a8]" />
              )}
              <span>Check for Duplicates</span>
            </button>
          </div>

          {/* AI Feedback Notices */}
          {aiCategorizeNotice && (
            <div className="p-3 bg-[#e8f1e9] border border-[#143d35]/20 rounded-xl text-xs text-[#143d35] animate-in fade-in">
              {aiCategorizeNotice}
            </div>
          )}

          {aiEnhanceKeyPoints.length > 0 && (
            <div className="p-3 bg-[#fff0e8] border border-[#e97950]/20 rounded-xl text-xs text-[#c2410c] animate-in fade-in">
              <p className="font-bold mb-1">Key Extracted Points:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[#9a3412]">
                {aiEnhanceKeyPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Duplicate check results card */}
          {duplicateCheckDone && (
            <div className="p-4 bg-[#efebf8]/80 border border-[#6b21a8]/20 rounded-2xl text-xs space-y-2 animate-in fade-in">
              <p className="font-bold text-[#581c87] flex items-center gap-1.5">
                <Search className="w-4 h-4 text-[#6b21a8]" />
                Duplicate Detection Analysis:
              </p>
              {duplicateCandidates.length === 0 ? (
                <p className="text-[#6b21a8]">
                  No matching reports found nearby. Your issue appears to be unique!
                </p>
              ) : (
                <div className="space-y-2 pt-1">
                  <p className="text-[#6b21a8]">
                    We found {duplicateCandidates.length} potential existing report(s) describing similar concerns. Please verify if one of these matches your problem:
                  </p>
                  <div className="divide-y divide-[#6b21a8]/20 bg-white/90 rounded-xl border border-[#6b21a8]/20 p-2">
                    {duplicateCandidates.map((dup) => {
                      const matchingReport = existingReports.find((r) => r.id === dup.reportId);
                      return (
                        <div key={dup.reportId} className="py-2 px-1">
                          <div className="flex items-center justify-between font-bold text-[#581c87]">
                            <span>{matchingReport?.title || 'Report #' + dup.reportId}</span>
                            <span className="text-[10px] bg-[#efebf8] text-[#6b21a8] px-2 py-0.5 rounded-full">
                              Match: {Math.round(dup.similarityScore * 100)}%
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7e22ce] mt-0.5">{dup.matchReason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Title and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[#e4e9e1]">
          <div>
            <label className="block text-sm font-bold text-[#143d35] font-manrope mb-1.5">
              2. Report Title <span className="text-[#e97950]">*</span>
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hazardous Pothole on Corniche Road"
              className="w-full p-2.5 text-xs sm:text-sm border border-[#e4e9e1] rounded-xl focus:ring-2 focus:ring-[#143d35] focus:outline-hidden bg-[#f6f7f3]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#143d35] font-manrope mb-1.5">
              3. Category <span className="text-[#e97950]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
              className="w-full p-2.5 text-xs sm:text-sm border border-[#e4e9e1] rounded-xl focus:ring-2 focus:ring-[#143d35] focus:outline-hidden bg-[#f6f7f3]/50 font-medium text-[#1c302c]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({t(`cat.${cat}`)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Location Details & Interactive Map Picker */}
        <div className="space-y-4 pt-4 border-t border-[#e4e9e1]">
          <div>
            <label className="block text-sm font-bold text-[#143d35] font-manrope mb-1">
              4. Location in Ras Al Khaimah <span className="text-[#e97950]">*</span>
            </label>
            <p className="text-xs text-[#74817b] mb-2">
              Enter the street/neighborhood name and drop the pin precisely on the map below.
            </p>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#143d35] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="e.g. Corniche Al Qawasim, near Al Fanar Restaurant"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-[#e4e9e1] rounded-xl focus:ring-2 focus:ring-[#143d35] focus:outline-hidden bg-[#f6f7f3]/50"
              />
            </div>
          </div>

          {/* Interactive Location Picker Map */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#74817b] mb-1.5">
              <span className="font-semibold text-[#143d35]">
                Pinpoint on Map (Click map or drag the pin):
              </span>
              <span className="font-mono text-[11px] text-[#74817b]">
                Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
              </span>
            </div>

            <MapComponent
              isPickerMode={true}
              pickerLat={latitude}
              pickerLng={longitude}
              onPickerLocationChange={(lat, lng, label) => {
                setLatitude(lat);
                setLongitude(lng);
                if (label && (!locationLabel || locationLabel.trim().length < 4)) {
                  setLocationLabel(label);
                }
              }}
              height="340px"
              zoomLevel={12}
            />
          </div>
        </div>

        {/* Section 4: Photograph Upload */}
        <div className="space-y-3 pt-4 border-t border-[#e4e9e1]">
          <label className="block text-sm font-bold text-[#143d35] font-manrope">
            5. Attach Photograph (Optional)
          </label>
          <p className="text-xs text-[#74817b]">
            Photos help community members and municipal coordinators verify the defect quickly.
          </p>

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-[#e4e9e1] max-h-64 bg-[#f6f7f3] flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="max-h-64 w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-3 right-3 p-1.5 bg-[#143d35]/80 hover:bg-[#143d35] text-white rounded-full transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-[#e4e9e1] hover:border-[#143d35] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#f6f7f3]/50 hover:bg-[#e8f1e9]/30">
              <Upload className="w-7 h-7 text-[#74817b] mb-2" />
              <p className="text-xs font-bold text-[#143d35]">
                Click to upload or drag photo here
              </p>
              <p className="text-[11px] text-[#74817b] mt-0.5">
                PNG, JPG or WebP up to 5MB
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#e4e9e1]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl bg-[#143d35] hover:bg-[#205347] active:scale-98 text-white font-bold text-xs shadow-md shadow-[#143d35]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Report to Cloud Firestore...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-[#d7edbd]" />
                <span>Save Report to FixMyRAK &rarr;</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-[#74817b] text-center mt-2.5">
            By submitting, you confirm the accuracy of the report. Reports are public for community awareness.
          </p>
        </div>
      </form>
    </div>
  );
};
