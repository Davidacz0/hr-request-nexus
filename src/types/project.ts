
export interface Email {
  id: string;
  email: string;
  name?: string;
  position?: string;
  dateCreated: Date;
  status?: 'sent' | 'failed' | 'not_sent' | 'done';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  dateCreated: Date;
  status: 'active' | 'completed' | 'archived';
  emails: Email[];
  topics: Topic[];
}

export type Question = {
  id: number;
  text: string;
};

export type Topic = {
  id: number;
  title: string;
  questions: Question[];
};
