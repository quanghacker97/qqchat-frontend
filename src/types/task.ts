export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: number;
  updatedAt: number;
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Cần làm",
  doing: "Đang làm",
  done: "Hoàn thành",
};

export const STATUS_ORDER: TaskStatus[] = ["todo", "doing", "done"];

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};
