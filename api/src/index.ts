import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import route from "./controller/index.controller";
import cors from "cors";

const port = process.env.PORT || 3000;

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/api/v1", route);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err.stack);
  res.status(500).send("Internal server error");
});

app.listen(port, () =>
  console.log(`🚀 Server ready at: http://localhost:${port}`)
);
