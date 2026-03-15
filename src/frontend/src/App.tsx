import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/AdminPage";
import CheckoutCancelPage from "./pages/CheckoutCancelPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import HomePage from "./pages/HomePage";
import MyNotesPage from "./pages/MyNotesPage";
import NoteDetailPage from "./pages/NoteDetailPage";

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const noteDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notes/$id",
  component: NoteDetailPage,
});
const myNotesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-notes",
  component: MyNotesPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});
const checkoutSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/success",
  component: CheckoutSuccessPage,
});
const checkoutCancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/cancel",
  component: CheckoutCancelPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  noteDetailRoute,
  myNotesRoute,
  adminRoute,
  checkoutSuccessRoute,
  checkoutCancelRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
