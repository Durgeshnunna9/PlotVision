import React, { useEffect, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';

interface Task {
  taskId: number;
  taskName: string;
  description: string;
  status: "PENDING" | "ONGOING" | "COMPLETED";
  assignedDate: string;
  agentId: number;
  managerId: number;
  property?: { propertyId: number }; // added property field for modal
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user: agent } = useAuth(); 
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState("AGENT"); // you can dynamically set this later

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`http://localhost:8090/tasks/agent/${agent?.userId}`);
        const data = await res.json();
  
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error("Expected array, got:", data);
          setTasks([]); // fallback
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
  
    if (agent?.userId) fetchTasks();
  }, [agent]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const pendingTasks = Array.isArray(tasks)
    ? tasks.filter((t) => t.status === "PENDING")
    : [];

  const ongoingTasks = Array.isArray(tasks)
    ? tasks.filter((t) => t.status === "ONGOING")
    : [];

  const completedTasks = Array.isArray(tasks)
    ? tasks.filter((t) => t.status === "COMPLETED")
    : [];

  if (loading) return <p className="text-center text-gray-500">Loading tasks...</p>;
  if (!Array.isArray(tasks)) {
    return <p className="text-center text-red-500">Error loading tasks.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Tasks</h1>

      {/* Section Component */}
      <TaskSection title="Pending Tasks" tasks={pendingTasks} color="yellow" onTaskClick={handleTaskClick} />
      <TaskSection title="Ongoing Tasks" tasks={ongoingTasks} color="blue" onTaskClick={handleTaskClick} />
      <TaskSection title="Completed Tasks" tasks={completedTasks} color="green" onTaskClick={handleTaskClick} />

      {/* 🟢 Modal Section */}
      {isModalOpen && selectedTask && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl w-[420px] shadow-2xl transform transition-all duration-300">
      <h2 className="text-2xl font-semibold text-gray-800 mb-3 border-b pb-2">
        {selectedTask.taskName}
        <p className="text-gray-700 text-sm pt-2">
        {new Date(selectedTask.assignedDate).toLocaleDateString()}</p>
      </h2>

      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        <strong>Description:</strong> {selectedTask.description || "No description provided."}
      </p>

      <div className="text-sm text-gray-700 space-y-2 mb-4">
        
        <p>
          <strong>Property ID:</strong>{" "}
          {selectedTask.property?.propertyId ?? "N/A"}
        </p>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <strong>Status:</strong>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              selectedTask.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : selectedTask.status === "ONGOING"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {selectedTask.status}
          </span>
        </div>
      </div>

      {/* Manager-only Status Dropdown */}
      {userRole === "MANAGER" && (
        <select
          className="border p-2 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={selectedTask.status}
          onChange={(e) =>
            setSelectedTask({
              ...selectedTask,
              status: e.target.value as Task["status"],
            })
          }
        >
          <option value="PENDING">Pending</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
        >
          Close
        </button>

        {userRole === "MANAGER" && (
          <button
            onClick={async () => {
              await fetch(`http://localhost:8090/tasks/${selectedTask.taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: selectedTask.status }),
              });
              setIsModalOpen(false);
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Save
          </button>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  color: string;
  onTaskClick: (task: Task) => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({ title, tasks, color, onTaskClick }) => {
  return (
    <div className="mb-10">
      <h2 className={`text-xl font-semibold text-${color}-700 mb-3`}>{title}</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500 italic">No tasks in this category.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.taskId}
              onClick={() => { console.log("Clicked task:", task); onTaskClick(task)}} // 🟢 Added click handler
              className="cursor-pointer bg-white shadow-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition"
            > 
              <h3 className="text-lg font-semibold text-gray-800">{task.taskName}</h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{task.description}</p>
              
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}
              >
                {task.status.toUpperCase()}
              </span> 
              <div className="mt-3 text-right text-xs text-gray-500">
                Assigned: {new Date(task.assignedDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
