export interface Student {
  id: string;
  name: string;
  email: string;
  major: string;
  year: number;
}

export interface GradeRecord {
  courseId: string;
  courseName: string;
  grade: string;
  credits: number;
  semester: string;
}

export interface ClassSchedule {
  courseId: string;
  courseName: string;
  instructor: string;
  room: string;
  days: string[]; // e.g., ["Monday", "Wednesday"]
  startTime: string; // e.g., "10:00 AM"
  endTime: string; // e.g., "11:15 AM"
}

export interface AcademicSummary {
  gpa: number;
  totalCreditsEarned: number;
  currentEnrollment: ClassSchedule[];
  gradesHistory: GradeRecord[];
}
