
export interface Email {
  id: string;
  email: string;
  name?: string;
  position?: string;
  dateAdded: Date;
  status?: 'pending' | 'sent' | 'failed';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  dateCreated: Date;
  status: 'active' | 'completed' | 'archived';
  emails: Email[];
}
