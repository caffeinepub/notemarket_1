import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  BookMarked,
  BookOpen,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export default function Navbar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-xs">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-medium text-foreground">
            Note<span className="text-primary">Market</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-ocid="nav.home.link"
          >
            Browse Notes
          </Link>
          {isLoggedIn && (
            <Link
              to="/my-notes"
              className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
              data-ocid="nav.my-notes.link"
            >
              <BookMarked className="w-3.5 h-3.5" />
              My Notes
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
              data-ocid="nav.admin.link"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </div>

        {/* Auth Button */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">
                {identity?.getPrincipal().toString().slice(0, 12)}…
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clear()}
                className="gap-1.5"
                data-ocid="nav.logout.button"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="nav.login.button"
            >
              <LogIn className="w-3.5 h-3.5" />
              {loginStatus === "logging-in" ? "Signing in…" : "Sign In"}
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-ocid="nav.mobile.toggle"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          <Link
            to="/"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
            onClick={() => setMobileOpen(false)}
            data-ocid="nav.mobile.home.link"
          >
            Browse Notes
          </Link>
          {isLoggedIn && (
            <Link
              to="/my-notes"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
              onClick={() => setMobileOpen(false)}
              data-ocid="nav.mobile.my-notes.link"
            >
              My Notes
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
              onClick={() => setMobileOpen(false)}
              data-ocid="nav.mobile.admin.link"
            >
              Admin
            </Link>
          )}
          <div className="pt-2 border-t border-border mt-1">
            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clear();
                  setMobileOpen(false);
                }}
                className="w-full gap-1.5"
                data-ocid="nav.mobile.logout.button"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  login();
                  setMobileOpen(false);
                }}
                className="w-full gap-1.5"
                data-ocid="nav.mobile.login.button"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
