import express from "express";
import joi from "joi";
import Todo from "../schemas/todo.schema.js";

const router = express.Router();
const createdTodoSchema = joi.object({
  value: joi.string().min(2).max(50).required(),
});

router.post("/todos", async (req, res, next) => {
  try {
    const validation = await createdTodoSchema.validateAsync(req.body);

    const { value } = validation;

    if (!value) {
      return res
        .status(400)
        .json({ errmsg: "해야할 일(Value) 데이터가 존재하지 않습니다." });
    }

    const todoMaxOrder = await Todo.findOne().sort("-order").exec();
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    const todo = new Todo({ value, order });
    await todo.save();

    return res.status(201).json({ todo: todo });
  } catch (error) {
    next(error);
  }
});

router.get("/todos", async (req, res, next) => {
  const todos = await Todo.find().sort("-order").exec();

  //next();
  return res.status(200).json({ todos });
});

router.patch("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;
  const { order, done, value } = req.body;

  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res.status(404).json({ errMsg: "존재하지 않는 해야할 일 입니다." });
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();

    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }

    currentTodo.order = order;
  }
  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }

  await currentTodo.save();

  return res.status(200).json({});
});

router.delete("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res.status(404).json({ errMsg: "존재하지 않는 해야할 일 입니다." });
  }

  await Todo.deleteOne({ _id: todoId });

  return res.status(200).json({});
});

router.delete("/todos", async (req, res, next) => {
  try {
    await Todo.deleteMany({});
    return res
      .status(200)
      .json({ message: "모든 Todo 데이터가 삭제되었습니다." });
  } catch (err) {
    console.error("데이터 삭제 중 오류가 발생했습니다:", err);
    return res
      .status(500)
      .json({ errMsg: "데이터 삭제 중 오류가 발생했습니다." });
  }
});

export default router;
