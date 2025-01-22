import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles.css";
import { Button, Modal, Form, Input, Select } from "antd";

const KanbanPage = () => {
    const [columns, setColumns] = useState({
        todo: [],
        inProgress: [],
        done: [],
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/tasks");
                const tasks = response.data;

                const groupedTasks = {
                    todo: tasks.filter((task) => task.status === "todo"),
                    inProgress: tasks.filter((task) => task.status === "inProgress"),
                    done: tasks.filter((task) => task.status === "done"),
                };

                setColumns(groupedTasks);
            } catch (error) {
                console.error("Failed to fetch tasks:", error.message);
            }
        };

        fetchTasks();
    }, []);

    const handleDragStart = (columnId, taskIndex) => {
        setCurrentTask({ columnId, taskIndex });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (targetColumnId) => {
        if (!currentTask) return;

        const { columnId, taskIndex } = currentTask;
        const sourceColumn = [...columns[columnId]];
        const task = sourceColumn.splice(taskIndex, 1)[0];
        task.status = targetColumnId;

        const targetColumn = [...columns[targetColumnId]];
        targetColumn.push(task);

        setColumns((prev) => ({
            ...prev,
            [columnId]: sourceColumn,
            [targetColumnId]: targetColumn,
        }));

        try {
            await axios.put(`http://localhost:4000/api/tasks/${task.id}`, { status: targetColumnId });
        } catch (error) {
            console.error("Failed to update task status:", error.message);
        }

        setCurrentTask(null);
    };

    const handleAddTask = () => {
        setIsModalOpen(true);
    };

    const handleSaveTask = async (values) => {
        try {
            const response = await axios.post("http://localhost:4000/api/tasks", values);
            const newTask = response.data;

            setColumns((prev) => ({
                ...prev,
                [newTask.status]: [...prev[newTask.status], newTask],
            }));

            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error("Failed to add task:", error.message);
        }
    };

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ marginLeft: 260, padding: 20, width: "calc(100% - 260px)" }}>
                <h1>Kanban Board</h1>
                <Button type="primary" onClick={handleAddTask}>
                    Add Task
                </Button>
                <div className="columns-container">
                    {Object.keys(columns).map((columnId) => (
                        <div
                            key={columnId}
                            className="column"
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(columnId)}
                        >
                            <h2>{columnId.replace(/([A-Z])/g, " $1")}</h2>
                            <div className="task-container">
                                {columns[columnId].map((task, index) => (
                                    <div
                                        key={task.id}
                                        className="task"
                                        draggable
                                        onDragStart={() => handleDragStart(columnId, index)}
                                    >
                                        <div className="task-content">
                                            <strong>{task.title}</strong>
                                            <p>{task.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <Modal
                    title="Add Task"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null}
                >
                    <Form form={form} onFinish={handleSaveTask} layout="vertical">
                        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: "Please select a status!" }]}
                        >
                            <Select>
                                <Select.Option value="todo">To Do</Select.Option>
                                <Select.Option value="inProgress">In Progress</Select.Option>
                                <Select.Option value="done">Done</Select.Option>
                            </Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default KanbanPage;


