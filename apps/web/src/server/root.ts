import { activityRouter } from "./routers/activity";
import { chatRouter } from "./routers/chat";
import { kanbanRouter } from "./routers/kanban";
import { rbacRouter } from "./routers/rbac";
import { userRouter } from "./routers/user";
import { router } from "./trpc";

export const appRouter = router({
  user: userRouter,
  activity: activityRouter,
  rbac: rbacRouter,
  chat: chatRouter,
  kanban: kanbanRouter,
});

export type AppRouter = typeof appRouter;
