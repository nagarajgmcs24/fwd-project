
export type Language = 'en' | 'hi' | 'kn';

export enum UserRole {
  CITIZEN = 'citizen',
  COUNCILLOR = 'councillor'
}

export enum IssueStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  VERIFIED = 'VERIFIED'
}

export interface Ward {
  id: string;
  name: string;
  councillorName: string;
  party: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  wardId: string;
  password?: string; // In a real app, this would be hashed and on the server
}

export interface ProblemReport {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  wardId: string;
  description: string;
  image: string; // base64
  status: IssueStatus;
  aiVerificationReason?: string;
  createdAt: number;
}

export interface TranslationSchema {
  title: string;
  subtitle: string;
  loginAsCitizen: string;
  loginAsCouncillor: string;
  reportProblem: string;
  viewStatus: string;
  wardLabel: string;
  councillorLabel: string;
  partyLabel: string;
  uploadPhoto: string;
  descriptionPlaceholder: string;
  nameLabel: string;
  phoneLabel: string;
  submitBtn: string;
  logout: string;
  pendingStatus: string;
  verifiedStatus: string;
  rejectedStatus: string;
  aiAnalyzing: string;
  aiValid: string;
  aiInvalid: string;
  languageSelect: string;
  noReports: string;
  verifyBtn: string;
  loginTitle: string;
  signupTitle: string;
  passwordLabel: string;
  noAccount: string;
  hasAccount: string;
  signupBtn: string;
  loginBtn: string;
  wardSelectLabel: string;
  authError: string;
  welcomeBack: string;
  createAccount: string;
}
