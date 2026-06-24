/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Job {
  id: string;
  title: string;
  company: string;
  jobType: 'Internship' | 'Part-Time' | 'Full-Time' | 'Remote';
  industry: 'Computer Science' | 'Engineering' | 'Business' | 'Design';
  compensation: string;
  skills: string[];
}

export interface FilterState {
  jobTypes: {
    Internship: boolean;
    'Part-Time': boolean;
    'Full-Time': boolean;
    Remote: boolean;
  };
  industries: {
    'Computer Science': boolean;
    Engineering: boolean;
    Business: boolean;
    Design: boolean;
  };
}

export interface ApplicationInput {
  name: string;
  email: string;
  university: string;
  gradYear: string;
  resumeFile: File | null;
  resumeFileName?: string;
  coverLetter: string;
}
