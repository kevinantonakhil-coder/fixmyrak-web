import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Report,
  ReportCategory,
  ReportStatus,
  ReportUpdate,
  UserNotification,
  UserFeedback,
} from '../types';

export const reportService = {
  // Real-time listener for public reports
  subscribeReports(
    callback: (reports: Report[]) => void,
    errorCallback?: (error: unknown) => void
  ) {
    const path = 'reports';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const reports: Report[] = [];
        snapshot.forEach((doc) => {
          reports.push({ id: doc.id, ...doc.data() } as Report);
        });
        callback(reports);
      },
      (error) => {
        console.error('Error in subscribeReports:', error);
        if (errorCallback) errorCallback(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  // Fetch report by ID
  async getReport(reportId: string): Promise<Report | null> {
    const path = `reports/${reportId}`;
    try {
      const snap = await getDoc(doc(db, 'reports', reportId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as Report;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // Create new community report
  async createReport(params: {
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
    aiSummary?: string;
  }): Promise<string> {
    const path = 'reports';
    const reportId = 'rak-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newReport: Report = {
      id: reportId,
      userId: params.userId,
      authorName: params.authorName || 'Community Resident',
      authorEmail: params.authorEmail || '',
      title: params.title.trim(),
      description: params.description.trim(),
      category: params.category,
      location: params.location.trim(),
      latitude: Number(params.latitude.toFixed(6)),
      longitude: Number(params.longitude.toFixed(6)),
      imageURL: params.imageURL || '',
      status: 'Submitted',
      isVerified: false,
      flagged: false,
      aiSummary: params.aiSummary || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'reports', reportId), newReport);

      // Create initial submission notification for citizen
      await this.createNotification({
        userId: params.userId,
        reportId: reportId,
        title: 'Report Submitted Successfully',
        message: `Your report "${params.title}" has been registered in FixMyRAK. Status is currently: Submitted.`,
      });

      return reportId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Update status (Admin only)
  async updateReportStatus(params: {
    reportId: string;
    targetUserId: string;
    previousStatus: ReportStatus;
    newStatus: ReportStatus;
    message?: string;
    adminId: string;
    adminName?: string;
  }): Promise<void> {
    const path = `reports/${params.reportId}`;
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'reports', params.reportId), {
        status: params.newStatus,
        updatedAt: now,
      });

      // Add status history record
      const updateId = 'upd-' + Date.now();
      const updateRecord: ReportUpdate = {
        id: updateId,
        reportId: params.reportId,
        previousStatus: params.previousStatus,
        newStatus: params.newStatus,
        message: params.message || `Status updated to ${params.newStatus}`,
        adminId: params.adminId,
        adminName: params.adminName || 'Municipal Coordinator',
        createdAt: now,
      };

      await setDoc(doc(db, 'reports', params.reportId, 'updates', updateId), updateRecord);

      // Notify report author
      if (params.targetUserId) {
        await this.createNotification({
          userId: params.targetUserId,
          reportId: params.reportId,
          updateId,
          title: `Report Status Updated: ${params.newStatus}`,
          message: params.message
            ? `Update: "${params.message}"`
            : `Your report status is now marked as "${params.newStatus}".`,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Fetch status updates history for a report
  async fetchReportUpdates(reportId: string): Promise<ReportUpdate[]> {
    const path = `reports/${reportId}/updates`;
    try {
      const q = query(collection(db, 'reports', reportId, 'updates'), orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);
      const updates: ReportUpdate[] = [];
      snap.forEach((doc) => {
        updates.push({ id: doc.id, ...doc.data() } as ReportUpdate);
      });
      return updates;
    } catch (error) {
      console.warn('Could not fetch updates subcollection:', error);
      return [];
    }
  },

  // Delete report
  async deleteReport(reportId: string): Promise<void> {
    const path = `reports/${reportId}`;
    try {
      await deleteDoc(doc(db, 'reports', reportId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Admin toggles: verified, flagged
  async setVerified(reportId: string, isVerified: boolean): Promise<void> {
    const path = `reports/${reportId}`;
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        isVerified,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async setFlagged(reportId: string, flagged: boolean): Promise<void> {
    const path = `reports/${reportId}`;
    try {
      await updateDoc(doc(db, 'reports', reportId), {
        flagged,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Notifications
  subscribeNotifications(userId: string, callback: (notifications: UserNotification[]) => void) {
    const path = 'notifications';
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifs: UserNotification[] = [];
        snapshot.forEach((doc) => {
          notifs.push({ id: doc.id, ...doc.data() } as UserNotification);
        });
        callback(notifs);
      },
      (error) => {
        console.warn('Error in subscribeNotifications:', error);
        callback([]);
      }
    );
  },

  async createNotification(params: {
    userId: string;
    reportId: string;
    updateId?: string;
    title: string;
    message: string;
  }): Promise<void> {
    const notifId = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newNotif: UserNotification = {
      id: notifId,
      userId: params.userId,
      reportId: params.reportId,
      ...(params.updateId ? { updateId: params.updateId } : {}),
      title: params.title,
      message: params.message.slice(0, 500),
      read: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'notifications', notifId), newNotif);
    } catch (err) {
      console.warn('Failed to save notification:', err);
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
      });
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  },

  async markAllNotificationsAsRead(notificationIds: string[]): Promise<void> {
    const unreadIds = [...new Set(notificationIds)].filter(Boolean);
    for (let offset = 0; offset < unreadIds.length; offset += 450) {
      const batch = writeBatch(db);
      unreadIds.slice(offset, offset + 450).forEach((notificationId) => {
        batch.update(doc(db, 'notifications', notificationId), { read: true });
      });
      await batch.commit();
    }
  },

  // Feedback
  async submitFeedback(params: {
    userId?: string;
    userName?: string;
    rating: number;
    category?: string;
    message: string;
  }): Promise<void> {
    const path = 'feedback';
    const feedbackId = 'fb-' + Date.now();
    const newFeedback: UserFeedback = {
      id: feedbackId,
      userId: params.userId || '',
      userName: params.userName || 'Anonymous Citizen',
      rating: params.rating,
      category: params.category || 'General Suggestion',
      message: params.message.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'feedback', feedbackId), newFeedback);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async fetchAllFeedback(): Promise<UserFeedback[]> {
    const path = 'feedback';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: UserFeedback[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as UserFeedback);
      });
      return list;
    } catch (error) {
      console.warn('Could not fetch feedback:', error);
      return [];
    }
  },

  // Seed authentic initial community reports if empty
  async seedInitialReports(currentUserId?: string): Promise<void> {
    const snap = await getDocs(collection(db, 'reports'));
    if (!snap.empty) {
      return; // Already has reports
    }

    const defaultUserId = currentUserId || 'system-seed-user';
    const initialSeed: Omit<Report, 'id'>[] = [
      {
        userId: defaultUserId,
        authorName: 'Rashid Al Nuaimi',
        authorEmail: 'rashid.nuaimi@example.com',
        title: 'Deep Pothole at Al Nakheel Main Junction',
        description:
          'A dangerous pothole roughly 40cm wide has formed in the middle lane following recent rain showers near the Al Nakheel commercial center roundabout. Causing vehicles to swerve abruptly into adjacent traffic.',
        category: 'Roads and Potholes',
        location: 'Al Nakheel Commercial District, near Gold Souk Roundabout',
        latitude: 25.7925,
        longitude: 55.9732,
        imageURL:
          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        status: 'In Progress',
        isVerified: true,
        flagged: false,
        aiSummary:
          'Severe road surface hazard in high-traffic commercial area. Requires prompt asphalt milling and resurfacing.',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        userId: defaultUserId,
        authorName: 'Fatima Al Mansoori',
        authorEmail: 'fatima.m@example.com',
        title: 'Flickering Streetlights along Corniche Al Qawasim',
        description:
          'Three consecutive solar-powered streetlight poles between park gates 2 and 3 along Corniche promenade are flickering intermittently and turning off completely after 9:00 PM, creating a dark strip on the pedestrian running track.',
        category: 'Streetlights',
        location: 'Corniche Al Qawasim Promenade, between Gate 2 & 3',
        latitude: 25.7892,
        longitude: 55.9458,
        imageURL:
          'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
        status: 'Under Review',
        isVerified: true,
        flagged: false,
        aiSummary:
          'Lighting failure impacting evening joggers and families on the Corniche waterfront track.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        userId: defaultUserId,
        authorName: 'Dr. Tariq Al Qasimi',
        authorEmail: 'tariq.q@example.com',
        title: 'Recycling Station Overflow near Al Hamra Marina',
        description:
          'The communal recycling container cluster beside the marina promenade is overflowing with sorted cardboard boxes and plastic bottles after the weekend rush. Needs urgent collection to prevent windblown debris into the water.',
        category: 'Recycling',
        location: 'Al Hamra Village Marina Promenade, Block 4',
        latitude: 25.6882,
        longitude: 55.7794,
        imageURL:
          'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
        status: 'Submitted',
        isVerified: false,
        flagged: false,
        aiSummary:
          'Overflowing municipal recycling station requiring scheduled sorting and pickup.',
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        userId: defaultUserId,
        authorName: 'Salem Al Zaabi',
        authorEmail: 'salem.zaabi@example.com',
        title: 'Park Pathway Floodlights Left On During Daylight Hours',
        description:
          'High-intensity pathway and decorative ground floodlights remain powered on all morning under full sunlight due to a faulty twilight photo-sensor. Recalibrating or replacing the sensor will save energy.',
        category: 'Electricity Saving',
        location: 'Corniche Al Qawasim Park, Section 4',
        latitude: 25.7912,
        longitude: 55.9498,
        imageURL:
          'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
        status: 'Under Review',
        isVerified: true,
        flagged: false,
        aiSummary:
          'Energy conservation report: automated daytime lighting shutoff failure.',
        createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
      },
      {
        userId: defaultUserId,
        authorName: 'Hind Al Nuaimi',
        authorEmail: 'hind.nuaimi@example.com',
        title: 'Broken Landscaping Sprinkler Flooding Street',
        description:
          'A municipal landscaping sprinkler head has cracked open at the roadside median, spraying a fountain of water onto the asphalt instead of the turf, creating slippery puddles and wasting clean irrigation water.',
        category: 'Water Saving',
        location: 'Al Dhait South, Central Median Parkway',
        latitude: 25.7381,
        longitude: 55.9189,
        imageURL:
          'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
        status: 'In Progress',
        isVerified: true,
        flagged: false,
        aiSummary:
          'High water loss from ruptured roadside irrigation head requiring valve shutdown and nozzle replacement.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
      {
        userId: defaultUserId,
        authorName: 'Noura Al Shehhi',
        authorEmail: 'noura.shehhi@example.com',
        title: 'Community Mangrove & Native Ghaf Greening Support',
        description:
          'Request for mulch and protective sapling stakes around newly planted native Ghaf trees along the community eco-trail to boost local biodiversity and green tree cover.',
        category: 'Greener Living',
        location: 'Mina Al Arab, Coastal Mangrove Boardwalk',
        latitude: 25.7115,
        longitude: 55.8562,
        imageURL:
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
        status: 'Under Review',
        isVerified: true,
        flagged: false,
        aiSummary:
          'Civic urban greening request to protect native desert flora and saplings.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        userId: defaultUserId,
        authorName: 'Sultan Al Zaabi',
        authorEmail: 'sultan.zaabi@example.com',
        title: 'Broken Interlocking Pavers on Khuzam Walkway',
        description:
          'Several interlocking brick tiles along the shaded community walking path in Khuzam have cracked and sunken, posing an obvious tripping hazard for senior residents and strollers.',
        category: 'Pavements',
        location: 'Khuzam Residential Area, Park Street near Masjid',
        latitude: 25.7654,
        longitude: 55.9392,
        imageURL:
          'https://images.unsplash.com/photo-1584463699042-43bb22920239?auto=format&fit=crop&w=800&q=80',
        status: 'Resolved',
        isVerified: true,
        flagged: false,
        aiSummary:
          'Uneven paver hazard on neighbourhood walkway repaired and releveled with mortar base.',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        userId: defaultUserId,
        authorName: 'Mariam Al Shehhi',
        authorEmail: 'mariam.shehhi@example.com',
        title: 'Damaged Sunshade Canopy at Mina Al Arab Children Playground',
        description:
          'The fabric tensile sunshade structure above the swing set at the community park has torn loose at two grommet anchor points due to high winds, leaving playground equipment exposed to direct sun.',
        category: 'Public Facilities',
        location: 'Mina Al Arab, Bermuda Lagoon Playground',
        latitude: 25.7088,
        longitude: 55.8529,
        imageURL:
          'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
        status: 'In Progress',
        isVerified: true,
        flagged: false,
        aiSummary:
          'Safety issue with canopy cloth detachment over active community playground.',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        userId: defaultUserId,
        authorName: 'Ahmed Al Marzooqi',
        authorEmail: 'ahmed.m@example.com',
        title: 'Damaged Safety Guardrail on Jebel Jais Viewing Curve 7',
        description:
          'A 5-meter stretch of the galvanized steel mountain road barrier appears to have been dented and dislodged on a sharp hairpin turn. Reflector markers are missing on the downhill side.',
        category: 'Other Infrastructure',
        location: 'Jebel Jais Mountain Highway, Curve 7 Elevation 650m',
        latitude: 25.9388,
        longitude: 56.1342,
        imageURL:
          'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        status: 'Under Review',
        isVerified: true,
        flagged: false,
        aiSummary:
          'Roadside barrier damage along scenic mountain highway requiring reinforcement and reflector replacement.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];

    for (let i = 0; i < initialSeed.length; i++) {
      const item = initialSeed[i];
      const repId = 'rak-seed-' + (i + 1);
      try {
        await setDoc(doc(db, 'reports', repId), { id: repId, ...item });
      } catch (e) {
        console.warn('Seed write failed for item', repId, e);
      }
    }
  },
};
