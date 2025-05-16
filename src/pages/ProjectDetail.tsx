
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addEmailToProject, getProjectById, sendN8nRequest } from "@/services/projectService";
import { Project, Email } from "@/types/project";
import Header from "@/components/Header";
import { ArrowLeft, Plus, Mail } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [newEmail, setNewEmail] = useState({
    email: "",
    name: "",
    position: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      
      try {
        const data = await getProjectById(id);
        setProject(data);
      } catch (error) {
        console.error("Error loading project:", error);
        toast.error("Failed to load project details");
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const handleAddEmail = async () => {
    if (!id || !project) return;
    
    try {
      setIsSaving(true);
      const updatedProject = await addEmailToProject(
        id,
        newEmail.email,
        newEmail.name,
        newEmail.position
      );
      
      if (updatedProject) {
        setProject(updatedProject);
        setDialogOpen(false);
        setNewEmail({ email: "", name: "", position: "" });
        toast.success("Email added successfully");
      } else {
        toast.error("Failed to add email");
      }
    } catch (error) {
      console.error("Error adding email:", error);
      toast.error("Failed to add email");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendRequest = async () => {
    if (!id || !project || !selectedEmail) return;
    
    try {
      setIsSending(true);
      const success = await sendN8nRequest(
        id,
        selectedEmail.id,
        webhookUrl
      );
      
      if (success) {
        // Update the email status locally
        const updatedEmails = project.emails.map(email => 
          email.id === selectedEmail.id 
            ? { ...email, status: 'sent' as const } 
            : email
        );
        
        setProject({
          ...project,
          emails: updatedEmails
        });
        
        setEmailDialogOpen(false);
        setSelectedEmail(null);
        toast.success("Request sent to n8n successfully");
      } else {
        toast.error("Failed to send request");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Failed to send request to n8n");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status?: Email["status"]) => {
    switch (status) {
      case "sent":
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Sent</span>;
      case "failed":
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Failed</span>;
      case "pending":
      default:
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hr-primary"></div>
          </div>
        ) : project ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <div className="mt-2 flex items-center">
                <p className="text-gray-500 mr-4">
                  Created {format(new Date(project.dateCreated), "MMMM d, yyyy")}
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    project.status === "active"
                      ? "bg-green-100 text-green-800"
                      : project.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              <p className="mt-4 text-gray-600">{project.description}</p>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Email List</h2>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-hr-primary hover:bg-hr-secondary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Email
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {project.emails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-lg text-gray-500 mb-4">No emails added yet</p>
                    <Button
                      onClick={() => setDialogOpen(true)}
                      className="bg-hr-primary hover:bg-hr-secondary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add your first email
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {project.emails.map((email) => (
                        <TableRow key={email.id}>
                          <TableCell>{email.email}</TableCell>
                          <TableCell>{email.name || "-"}</TableCell>
                          <TableCell>{email.position || "-"}</TableCell>
                          <TableCell>
                            {format(new Date(email.dateAdded), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{getStatusBadge(email.status)}</TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEmail(email);
                                      setEmailDialogOpen(true);
                                    }}
                                    disabled={email.status === "sent"}
                                  >
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Send request to n8n</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-gray-500 mb-4">Project not found</p>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Email</DialogTitle>
            <DialogDescription>
              Add a new email to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newEmail.email}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                value={newEmail.name}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, name: e.target.value })
                }
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position (Optional)</Label>
              <Input
                id="position"
                value={newEmail.position}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, position: e.target.value })
                }
                placeholder="Enter position"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEmail}
              className="bg-hr-primary hover:bg-hr-secondary"
              disabled={!newEmail.email || isSaving}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                "Add Email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Request to n8n</DialogTitle>
            <DialogDescription>
              Enter your n8n webhook URL to send a request for this email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={selectedEmail?.email || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook">n8n Webhook URL *</Label>
              <Input
                id="webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-n8n-instance.com/webhook/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the webhook URL from your n8n instance
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailDialogOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              className="bg-hr-primary hover:bg-hr-secondary"
              disabled={!webhookUrl || isSending}
            >
              {isSending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                "Send Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;
