export type ReportCategory =
  | 'Water Saving'
  | 'Electricity Saving'
  | 'Recycling'
  | 'Greener Living'
  | 'Roads and Potholes'
  | 'Streetlights'
  | 'Pavements'
  | 'Public Facilities'
  | 'Other Infrastructure'
  | 'Waste Management';

export type ReportStatus = 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved';

export interface Report {
  id: string;
  userId: string;
  authorName?: string;
  authorEmail?: string;
  title: string;
  description: string;
  category: ReportCategory;
  location: string;
  latitude: number;
  longitude: number;
  imageURL?: string;
  status: ReportStatus;
  isVerified?: boolean;
  flagged?: boolean;
  aiSummary?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReportUpdate {
  id: string;
  reportId: string;
  previousStatus: ReportStatus;
  newStatus: ReportStatus;
  message?: string;
  adminId: string;
  adminName?: string;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  reportId: string;
  updateId?: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface CommunityAnalytics {
  totalReports: number;
  geocodedReports: number;
  categoryCounts: { label: string; count: number }[];
  statusCounts: { label: string; count: number }[];
  areaCounts: { label: string; count: number }[];
  weeklyCounts: { weekStart: string; count: number }[];
  recentPeriod: { start: string; end: string; count: number };
  previousPeriod: { start: string; end: string; count: number };
  periodChangePercent: number | null;
  reportsWithValidDates: number;
}

export interface AICommunityInsight {
  heading: string;
  explanation: string;
  period: string;
  reportCount: number;
  kind: 'summary' | 'pattern' | 'area' | 'activity' | 'emerging';
}

export interface AICommunityInsightsResult {
  insights: AICommunityInsight[];
  generatedAt: string;
  reportsAnalyzed: number;
}

export interface UserFeedback {
  id: string;
  userId?: string;
  userName?: string;
  rating: number;
  category?: string;
  message: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AICategorizeResult {
  category: ReportCategory;
  suggestedTitle: string;
  shortSummary: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
}

export interface AIEnhanceResult {
  enhancedDescription: string;
  keyPoints: string[];
}

export interface AIDuplicateCandidate {
  reportId: string;
  similarityScore: number;
  matchReason: string;
}

export interface AISummarizeResult {
  executiveSummary: string;
  mainIssue: string;
  locationContext: string;
  urgencyLevel: string;
  suggestedAction: string;
}

export interface GroundedPlace {
  title: string;
  uri: string;
  snippet?: string;
}

export interface AIMapsGroundingResult {
  analysis: string;
  isRealReport: boolean;
  confidence: number;
  groundedPlaces: GroundedPlace[];
  isFallback: boolean;
  civicRecommendation?: string;
  nearbyContext?: string;
}

export const RAK_PRESET_LOCATIONS = [
  { name: 'Al Nakheel Commercial District', lat: 25.7925, lng: 55.9732 },
  { name: 'Corniche Al Qawasim', lat: 25.7892, lng: 55.9458 },
  { name: 'Al Hamra Village Marina', lat: 25.6882, lng: 55.7794 },
  { name: 'Mina Al Arab Lagoon', lat: 25.7088, lng: 55.8529 },
  { name: 'Khuzam Residential Area', lat: 25.7654, lng: 55.9392 },
  { name: 'Al Dhait South', lat: 25.7381, lng: 55.9189 },
  { name: 'Jebel Jais Mountain Road', lat: 25.9388, lng: 56.1342 },
  { name: 'RAK Old Town / Fort Area', lat: 25.8011, lng: 55.9525 },
];
