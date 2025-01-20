import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles.css";

const KanbanPage = () => {
    const [columns, setColumns] = useState({
        todo: [
            { id: "1", content: "Task 1" },
            { id: "2", content: "Task 2" },
        ],
        inProgress: [
            { id: "3", content: "Task 3" },
            { id: "4", content: "Task 4" },
        ],
        done: [
            { id: "5", content: "Task 5" },
            { id: "6", content: "Task 6" },
        ],
    });

    const [draggingTask, setDraggingTask] = useState(null);
    const [draggingFrom, setDraggingFrom] = useState(null);
    const [editingTask, setEditingTask] = useState(null); // ID редактируемой задачи
    const [editingContent, setEditingContent] = useState(""); // Содержимое редактируемой задачи

    const handleDragStart = (columnId, taskIndex) => {
        setDraggingTask(taskIndex);
        setDraggingFrom(columnId);
    };

    const handleDragOver = (e, columnId, taskIndex) => {
        e.preventDefault();

        if (
            draggingFrom === null ||
            draggingTask === null ||
            (draggingFrom === columnId && draggingTask === taskIndex)
        ) {
            return;
        }

        const sourceColumn = [...columns[draggingFrom]];
        const targetColumn = [...columns[columnId]];

        if (draggingFrom === columnId) {
            // Перетаскивание внутри одной и той же колонки
            const [movedTask] = sourceColumn.splice(draggingTask, 1);
            sourceColumn.splice(taskIndex, 0, movedTask);

            setColumns((prev) => ({
                ...prev,
                [columnId]: sourceColumn,
            }));
        } else {
            // Перетаскивание между разными колонками
            const [movedTask] = sourceColumn.splice(draggingTask, 1);
            targetColumn.splice(taskIndex, 0, movedTask);

            setColumns((prev) => ({
                ...prev,
                [draggingFrom]: sourceColumn,
                [columnId]: targetColumn,
            }));
        }

        setDraggingTask(taskIndex);
        setDraggingFrom(columnId);
    };

    const handleDrop = () => {
        setDraggingTask(null);
        setDraggingFrom(null);
    };

    const handleAddTask = (columnId) => {
        const newTask = {
            id: Date.now().toString(),
            content: `New Task ${Date.now()}`,
        };
        setColumns((prev) => ({
            ...prev,
            [columnId]: [...prev[columnId], newTask],
        }));
    };

    const handleDeleteTask = (columnId, taskId) => {
        setColumns((prev) => ({
            ...prev,
            [columnId]: prev[columnId].filter((task) => task.id !== taskId),
        }));
    };

    const handleEditTask = (taskId, columnId, content) => {
        setEditingTask(taskId);
        setEditingContent(content);
    };

    const handleSaveEdit = (columnId) => {
        setColumns((prev) => ({
            ...prev,
            [columnId]: prev[columnId].map((task) =>
                task.id === editingTask ? { ...task, content: editingContent } : task
            ),
        }));
        setEditingTask(null);
        setEditingContent("");
    };

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ marginLeft: 260, padding: 20, width: "calc(100% - 260px)" }}>
                <h1>Task Board</h1>
                <div className="columns-container">
                    {Object.keys(columns).map((columnId) => (
                        <div key={columnId} className="column">
                            <h2>{columnId.replace(/([A-Z])/g, " $1")}</h2>
                            <button
                                className="add-task-button"
                                onClick={() => handleAddTask(columnId)}
                            >
                                Add Task
                            </button>
                            <div
                                className="task-container"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                {columns[columnId].map((task, index) => (
                                    <div
                                        key={task.id}
                                        className={`task ${
                                            draggingFrom === columnId && draggingTask === index
                                                ? "dragging"
                                                : ""
                                        }`}
                                        draggable
                                        onDragStart={() => handleDragStart(columnId, index)}
                                        onDragOver={(e) => handleDragOver(e, columnId, index)}
                                        onDrop={handleDrop}
                                    >
                                        {editingTask === task.id ? (
                                            <input
                                                className="edit-input"
                                                value={editingContent}
                                                onChange={(e) =>
                                                    setEditingContent(e.target.value)
                                                }
                                                onBlur={() => handleSaveEdit(columnId)}
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                <div
                                                    className="task-content"
                                                    onDoubleClick={() =>
                                                        handleEditTask(
                                                            task.id,
                                                            columnId,
                                                            task.content
                                                        )
                                                    }
                                                >
                                                    {task.content}
                                                </div>
                                                <button
                                                    className="delete-task-button"
                                                    onClick={() =>
                                                        handleDeleteTask(columnId, task.id)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KanbanPage;
