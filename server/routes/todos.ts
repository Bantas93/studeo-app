import express from "express";
import TodoController from "../controllers/todoController";

const TodoRouter = express.Router();

TodoRouter.get("/", TodoController.getTodos);
TodoRouter.get("/:id", TodoController.getTodoById);
TodoRouter.post("/", TodoController.createTodo);
TodoRouter.put("/:id", TodoController.updateTodo);
TodoRouter.delete("/:id", TodoController.deleteTodo);

export default TodoRouter;
