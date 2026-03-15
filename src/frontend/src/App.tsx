import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import DuasPage from "./pages/DuasPage";
import QuranPage from "./pages/QuranPage";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: AuthPage,
});

const quranRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quran",
  component: QuranPage,
});

const duasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/duas",
  component: DuasPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  quranRoute,
  duasRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
