import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter, { authMiddleware } from "./auth";
import usersRouter from "./users";
import coursesRouter from "./courses";
import enrollmentsRouter from "./enrollments";
import liveClassesRouter from "./live-classes";
import testsRouter from "./tests";
import discussionsRouter from "./discussions";
import recommendationsRouter from "./recommendations";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(authMiddleware as any);
router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(coursesRouter);
router.use(enrollmentsRouter);
router.use(liveClassesRouter);
router.use(testsRouter);
router.use(discussionsRouter);
router.use(recommendationsRouter);
router.use(analyticsRouter);

export default router;
