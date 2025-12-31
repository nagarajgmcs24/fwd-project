
import { User, ProblemReport, UserRole, IssueStatus } from './types';
import { BENGALURU_WARDS } from './constants';

// Simulated DB Keys
const DB_USERS = 'fwm_users_v1';
const DB_REPORTS = 'fwm_reports_v1';

// Helper to simulate network latency
const sleep = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const getStoredData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStoredData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  async signup(data: any): Promise<User> {
    await sleep();
    const users = getStoredData<User>(DB_USERS);
    
    if (users.find(u => u.phone === data.phone)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      phone: data.phone,
      role: data.role as UserRole,
      wardId: data.wardId,
      // Note: In a real app, password would be handled securely on a real server
    };

    users.push(newUser);
    setStoredData(DB_USERS, users);
    return newUser;
  },

  async login(data: any): Promise<User> {
    await sleep();
    const users = getStoredData<User>(DB_USERS);
    const user = users.find(u => u.phone === data.phone && u.role === data.role);
    
    // For demo purposes, allow the default councillor login if not in local storage
    if (!user && data.role === UserRole.COUNCILLOR && data.phone === '9000000001') {
      return { 
        id: 'c1', 
        name: 'Manjunath Reddy', 
        phone: '9000000001', 
        role: UserRole.COUNCILLOR, 
        wardId: '151' 
      };
    }

    if (!user) {
      throw new Error('Invalid credentials');
    }
    return user;
  },

  async getWards(): Promise<any[]> {
    await sleep(200);
    return BENGALURU_WARDS;
  },

  async submitReport(data: any): Promise<ProblemReport> {
    await sleep(800);
    const reports = getStoredData<ProblemReport>(DB_REPORTS);
    
    const newReport: ProblemReport = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: data.userId,
      userName: data.userName,
      userPhone: data.userPhone,
      wardId: data.wardId,
      description: data.description,
      image: data.image,
      aiVerificationReason: data.aiVerificationReason,
      status: IssueStatus.PENDING,
      createdAt: Date.now()
    };

    reports.unshift(newReport);
    setStoredData(DB_REPORTS, reports);
    return newReport;
  },

  async getReports(wardId?: string, userId?: string): Promise<ProblemReport[]> {
    await sleep(400);
    let reports = getStoredData<ProblemReport>(DB_REPORTS);
    
    if (wardId) {
      reports = reports.filter(r => r.wardId === wardId);
    }
    if (userId) {
      reports = reports.filter(r => r.userId === userId);
    }
    
    return reports;
  },

  async verifyReport(id: string): Promise<ProblemReport> {
    await sleep(600);
    const reports = getStoredData<ProblemReport>(DB_REPORTS);
    const index = reports.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error('Report not found');
    }

    reports[index].status = IssueStatus.VERIFIED;
    setStoredData(DB_REPORTS, reports);
    return reports[index];
  }
};
