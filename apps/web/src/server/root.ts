import { activityRouter } from "./routers/activity";
import { kanbanRouter } from "./routers/kanban";
import { rbacRouter } from "./routers/rbac";
import { userRouter } from "./routers/user";
import { router } from "./trpc";

export const appRouter = router({
  user: userRouter,
  activity: activityRouter,
  rbac: rbacRouter,
  kanban: kanbanRouter,
});

export type AppRouter = typeof appRouter;
