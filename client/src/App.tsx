import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Messages from "./pages/Messages";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AuthPage from "./pages/auth/AuthPage";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminMessages from "./pages/admin/AdminMessages";

function Router() {
  return (
    <Switch>
      {/* Routes pharmacies */}
      <Route path={"/login"} component={AuthPage} />
      <Route path={"/"} component={Home} />
      <Route path={"/orders"} component={Orders} />
      <Route path={"/messages"} component={Messages} />

      {/* Routes admin */}
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/products"} component={AdminProducts} />
      <Route path={"/admin/orders"} component={AdminOrders} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/messages"} component={AdminMessages} />

      {/* Fallback */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
