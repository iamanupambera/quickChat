import { Router } from "express";
import userRoute from "./userController";
import conversationsRoute from "./conversationsController";
import groupsRoute from "./groupController";
import messagesRoute from "./messagesController";

const mainRoute = Router();

mainRoute.use("/users", userRoute);
mainRoute.use("/conversations", conversationsRoute);
mainRoute.use("/messages", messagesRoute);
mainRoute.use("/groups", groupsRoute);

export default mainRoute;
