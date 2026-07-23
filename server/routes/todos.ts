import express from "express";
import TodoController from "../controllers/todoController";
import { authentication } from "../middleware/authentication";

const TodoRouter = express.Router();

TodoRouter.get("/", TodoController.getTodos);
TodoRouter.get("/:id", TodoController.getTodoById);
TodoRouter.get("/:id/room", TodoController.getTodoByIdRoom);
TodoRouter.post("/", authentication, TodoController.createTodo);
TodoRouter.put("/:id", TodoController.updateTodo);
TodoRouter.delete("/:id", authentication, TodoController.deleteTodo);

export default TodoRouter;
