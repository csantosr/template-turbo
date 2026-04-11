import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { activityRouter } from "./routers/activity";
import { rbacRouter } from "./routers/rbac";

export const appRouter = router({
  user: userRouter,
  activity: activityRouter,
  rbac: rbacRouter,
});

export type AppRouter = typeof appRouter;
