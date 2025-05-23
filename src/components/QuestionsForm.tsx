// components/ProjectForm.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { Topic } from "@/types/project";

type QuestionsFormProps = {
  defaultTopics?: Topic[];
  loading?: boolean;
  onSubmit: (topics: Topic[]) => void;
  onCancel?: () => void;
  showSaveButton?: boolean;
};

export default function QuestionsForm({
  defaultTopics = [],
  loading,
  onSubmit,
  onCancel,
  showSaveButton = true,
}: QuestionsFormProps) {
  const [topics, setTopics] = useState<Topic[]>(defaultTopics);
  const [nextTopicID, setNextTopicID] = useState(defaultTopics.length || 0);
  const [nextQuestionID, setNextQuestionID] = useState(() =>
    defaultTopics.reduce(
      (max, topic) =>
        Math.max(max, ...topic.questions.map((q) => q.id), 0),
      0
    ) + 1
  );

  const handleAddTopic = () => {
    setTopics([
      ...topics,
      { id: nextTopicID, title: `Topic ${nextTopicID + 1}`, questions: [] },
    ]);
    setNextTopicID(nextTopicID + 1);
  };

  const handleRemoveTopic = (topicId: number) => {
    setTopics(topics.filter((t) => t.id !== topicId));
  };

  const handleTopicTitleChange = (topicId: number, newTitle: string) => {
    setTopics(
      topics.map((t) =>
        t.id === topicId ? { ...t, title: newTitle } : t
      )
    );
  };

  const handleAddQuestion = (topicId: number) => {
    setTopics(
      topics.map((t) =>
        t.id === topicId
          ? {
            ...t,
            questions: [
              ...t.questions,
              { id: nextQuestionID, text: "" },
            ],
          }
          : t
      )
    );
    setNextQuestionID(nextQuestionID + 1);
  };

  const handleRemoveQuestion = (topicId: number, questionId: number) => {
    setTopics(
      topics.map((t) =>
        t.id === topicId
          ? {
            ...t,
            questions: t.questions.filter((q) => q.id !== questionId),
          }
          : t
      )
    );
  };

  const handleQuestionChange = (
    topicId: number,
    questionId: number,
    value: string
  ) => {
    setTopics(
      topics.map((t) =>
        t.id === topicId
          ? {
            ...t,
            questions: t.questions.map((q) =>
              q.id === questionId ? { ...q, text: value } : q
            ),
          }
          : t
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(topics);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="space-y-6">
        {topics.map((topic, topicIdx) => (
          <div key={topic.id} className="border p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <Input
                value={topic.title}
                onChange={(e) =>
                  handleTopicTitleChange(topic.id, e.target.value)
                }
                placeholder={`Topic ${topicIdx + 1}`}
                className="font-semibold text-lg"
                required
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleRemoveTopic(topic.id)}
                aria-label="Remove topic"
                size="icon"
              >
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
            {topic.questions.map((q, qIdx) => (
              <div key={q.id} className="flex items-center gap-2">
                <Input
                  value={q.text}
                  onChange={(e) =>
                    handleQuestionChange(topic.id, q.id, e.target.value)
                  }
                  onBlur={(e) =>
                    onSubmit(topics)
                  }

                  placeholder={`Question ${qIdx + 1}`}
                  className="flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleRemoveQuestion(topic.id, q.id)}
                  aria-label="Remove question"
                  size="icon"
                >
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddQuestion(topic.id)}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="default"
          onClick={handleAddTopic}
          className="mt-4"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Topic
        </Button>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {showSaveButton && (
          <Button
            type="submit"
            className="bg-hr-primary hover:bg-hr-secondary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Questions"}
          </Button>
        )}
      </div>
    </form>
  );
}
