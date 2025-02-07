import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { auth } from "../middleware/auth";
import { validate } from "../middleware/validationMiddleware";
import { updateGroupSchema, UpdateGroupType } from "../helper/validationSchema";

const groupsRoute = Router();
const prisma = new PrismaClient();

groupsRoute.patch(
  "/:groupId",
  auth,
  validate(updateGroupSchema),
  async (req, res) => {
    const group_id = +req.params.groupId;
    const { group_name }: UpdateGroupType = req.body;

    const group = await prisma.group.update({
      where: { group_id },
      data: { group_name },
    });
  }
);

export default groupsRoute;
