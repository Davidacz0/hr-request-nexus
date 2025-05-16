
import { Project } from "@/types/project";

// Mock project data
const mockProjects: Project[] = [
  {
    id: "1",
    name: "New Employee Onboarding",
    description: "Onboarding process for new hires in Q2 2025",
    dateCreated: new Date("2025-05-01"),
    status: "active",
    emails: [
      { 
        id: "1", 
        email: "john.doe@example.com", 
        name: "John Doe", 
        position: "Software Engineer",
        dateAdded: new Date("2025-05-02"), 
        status: "sent" 
      },
      { 
        id: "2", 
        email: "jane.smith@example.com", 
        name: "Jane Smith", 
        position: "Product Manager",
        dateAdded: new Date("2025-05-03"),
        status: "pending" 
      },
    ],
  },
  {
    id: "2",
    name: "Quarterly Performance Reviews",
    description: "Q2 2025 performance review process",
    dateCreated: new Date("2025-04-15"),
    status: "active",
    emails: [
      { 
        id: "3", 
        email: "manager@example.com", 
        name: "Team Manager", 
        position: "Department Manager",
        dateAdded: new Date("2025-04-16"),
        status: "sent" 
      }
    ],
  },
];

// Get all projects
export const getProjects = async (): Promise<Project[]> => {
  // In a real application, you would make an API call here
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProjects);
    }, 500);
  });
};

// Get project by ID
export const getProjectById = async (id: string): Promise<Project | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = mockProjects.find((p) => p.id === id);
      resolve(project || null);
    }, 300);
  });
};

// Create a new project
export const createProject = async (
  project: Omit<Project, "id" | "dateCreated" | "emails">
): Promise<Project> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProject: Project = {
        ...project,
        id: `${mockProjects.length + 1}`,
        dateCreated: new Date(),
        emails: [],
      };
      mockProjects.push(newProject);
      resolve(newProject);
    }, 500);
  });
};

// Add email to project
export const addEmailToProject = async (
  projectId: string,
  email: string,
  name?: string,
  position?: string
): Promise<Project | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = mockProjects.find((p) => p.id === projectId);
      if (project) {
        const newEmail = {
          id: `${project.emails.length + 1}`,
          email,
          name,
          position,
          dateAdded: new Date(),
          status: "pending" as const,
        };
        project.emails.push(newEmail);
        resolve(project);
      } else {
        resolve(null);
      }
    }, 300);
  });
};

// Send request to n8n for a specific email in a project
export const sendN8nRequest = async (
  projectId: string,
  emailId: string,
  webhookUrl: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find project and email
      const project = mockProjects.find((p) => p.id === projectId);
      if (!project) {
        resolve(false);
        return;
      }

      const email = project.emails.find((e) => e.id === emailId);
      if (!email) {
        resolve(false);
        return;
      }

      // In a real application, you would make an API call to the n8n webhook
      console.log(`Sending request to n8n webhook ${webhookUrl} for email ${email.email}`);
      
      // Update email status
      email.status = "sent";
      resolve(true);
    }, 800);
  });
};
