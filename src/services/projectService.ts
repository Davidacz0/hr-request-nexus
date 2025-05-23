import supabase from "@/api/supabaseClient";
import { Project, Email, Question, Topic } from "@/types/project";
import { sendSurveyEmail } from "./emailService";

const getEmailsForProject = async (projectId: string): Promise<Email[]> => {
  const { data, error } = await supabase
    .from("projects_emails")
    .select(`
      status,
      emails:emails (
        id,
        email,
        name,
        position,
        dateCreated
      )
    `)
    .eq("project_id", projectId);
  console.log("getEmailsForProject", data, error);
  return (data ?? []).flatMap(item => {
    return ({
      id: item.emails.id,
      email: item.emails.email,
      name: item.emails.name,
      position: item.emails.position,
      dateCreated: item.emails.dateCreated,
      status: item.status,
    })
  }
  )
}

export const getQuestionsByProjectId = async (projectId: string) => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("project_id", projectId);
  if (error) throw error;
  console.log("getQuestionsByProjectId", data);
  const groupedTopic = regroupQuestions(data);
  return groupedTopic;
}

// Get all projects (with emails)
export const getProjects = async (): Promise<Project[]> => {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("dateCreated", { ascending: false });

  if (error) throw error;

  // Fetch emails for each project
  const projectsWithEmails: Project[] = await Promise.all(
    (projects ?? []).map(async (project) => ({
      ...project,
      emails: await getEmailsForProject(project.id),
    }))
  );

  return projectsWithEmails;
};

// Get project by ID (with emails)
export const getProjectById = async (id: string): Promise<Project | null> => {
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !project) return null;
  console.log("getProjectById", project);
  const emails = await getEmailsForProject(project.id);
  return { ...project, emails };
};

// Create a new project
export const createProject = async (
  project: Omit<Project, "id" | "dateCreated" | "emails">
): Promise<Project> => {
  console.log("CReating project ", project);
  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        name: project.name,
        description: project.description,
        status: "active",
        dateCreated: new Date().toISOString(),
      },
    ])
    .select()
    .single();
  if (error) throw error;
  // upload quesitons to question table
  const questionsToSave = project.topics.flatMap((topic) =>
    topic.questions.map((question) => ({
      id: question.id,
      text: question.text,
      project_id: data.id,
      topic: topic.title

    }))
  );

  console.log("questionsToSave", questionsToSave);

  const { error: questionError } = await supabase
    .from("questions")
    .insert(
      questionsToSave.map((question) => ({
        id: question.id,
        text: question.text,
        project_id: data.id,
        topic: question.topic
      }))
    );
  // createQuestionsToProject(data.id, project.questions);
  if (questionError) throw questionError;

  return { ...data, emails: [] };
};

export const createQuestionsToProject = async (
  projectId: string,
  questions: { id: number, text: string }[]
) => {

  const { error } = await supabase
    .from("questions")
    .upsert(
      questions.map((question) => ({
        id: question.id,
        text: question.text,
        project_id: projectId,
      }),
        {
          onConflict: ["id", "project_id"], // Match composite key
          ignoreDuplicates: false // Set to true if you want to skip duplicates
        }
      )
    );
  if (error) throw error;
}

// Add email to project (creates email, then join)
export const addEmailToProject = async (
  projectId: string,
  email: string,
  name?: string,
  position?: string
): Promise<Project | null> => {
  const { data: emailData, error: emailError } = await supabase
    .from("emails")
    .insert([
      {
        email,
        name,
        position,
        dateCreated: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (emailError) throw emailError;

  // 2. Link email to project in join table
  const { error: joinError } = await supabase
    .from("projects_emails")
    .insert([
      {
        project_id: projectId,
        email_id: emailData.id,
        status: "not_sent",
      },
    ]);

  if (joinError) throw joinError;

  // 3. Return updated project
  return await getProjectById(projectId);
};

export const updateEmailStatus = async (
  projectId: string,
  emailId: string,
  status: "pending" | "sent" | "failed"
): Promise<boolean> => {
  const { error } = await supabase
    .from("projects_emails")
    .update({ status })
    .eq("project_id", projectId)
    .eq("email_id", emailId);
  return !error;
}

export const sendEmail = async (
  projectId: string,
  emailId: string,
  emailAddress: string,
  subject: string,
  body: string
): Promise<boolean> => {
  // Simulate sending email
  const project = await getProjectById(projectId);

  const success = await sendSurveyEmail(emailAddress, projectId, emailId, project.name);

  if (success) {
    await updateEmailStatus(projectId, emailId, "sent");
    return true;
  } else {
    await updateEmailStatus(projectId, emailId, "failed");
    return false;
  }
}


function regroupQuestions(questions: { id: number, text: string, project_id: number, topic: string }[]): Topic[] {
  const topicMap: Record<string, Question[]> = {};
  for (const q of questions) {
    if (!topicMap[q.topic]) {
      topicMap[q.topic] = [];
    }
    topicMap[q.topic].push({ id: q.id, text: q.text });
  }

  const topics: Topic[] = [];
  let topicId = 1;
  for (const [title, qs] of Object.entries(topicMap)) {
    topics.push({
      id: topicId,
      title,
      questions: qs,
    });
    topicId++;
  }
  return topics;
}