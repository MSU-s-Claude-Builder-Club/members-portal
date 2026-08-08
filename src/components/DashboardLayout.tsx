import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, UserBadge } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavLink } from '@/components/ui/navigation-link';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  BookOpen,
  FolderKanban,
  Users,
  LogOut,
  Settings,
  Trophy,
  UserPlus,
  ChevronUp,
  TabletSmartphone
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState, useEffect } from 'react';
import { Database } from '@/integrations/supabase/database.types';
import { User } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  title: string;
  url: string;
  icon;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, profile, signOut } = useAuth();
  const { isBoardOrAbove } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Responsive layout: Remove forced landscape lock, but warn on landscape on small screens
  const [showRotate, setShowRotate] = useState(false);

  useEffect(() => {
    // Only check for portrait on mobile screens
    if (typeof window !== "undefined") {
      const handler = () => {
        // Mobile landscape: screen is small (mobile) and orientation is landscape
        const isLandscape = window.matchMedia("(orientation: landscape)").matches;
        setShowRotate(isMobile && isLandscape);
      };
      window.addEventListener("orientationchange", handler);
      window.addEventListener("resize", handler);
      handler(); // initial
      return () => {
        window.removeEventListener("orientationchange", handler);
        window.removeEventListener("resize", handler);
      };
    }
  }, [isMobile]);

  // Mono breadcrumb: first path segment names the current section
  const section = location.pathname.split('/')[1] || 'dashboard';

  if (showRotate) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-page p-8 text-foreground">
        <div className="flex w-full max-w-xs flex-col items-center border border-border p-8 text-center">
          <TabletSmartphone size={48} className="mb-4 text-primary" aria-hidden="true" />
          <h2 className="mb-2 font-mono text-xl font-extrabold tracking-[-0.02em]">Rotate your device</h2>
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            For best experience, please use portrait orientation.
          </p>
        </div>
      </div>
    );
  }

  // Responsive main layout (works on mobile & desktop!)
  return (
    <SidebarProvider>
      <div className="flex h-svh w-full">
        <AppSidebar
          user={user}
          profile={profile}
          isBoardOrAbove={isBoardOrAbove}
          signOut={signOut}
          navigate={navigate}
          isMobile={isMobile}
        />
        <div className="flex h-full min-w-0 flex-1 flex-col">
          <header className="hatch flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-page px-4">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="h-9 w-9 shrink-0 rounded-none text-foreground transition-colors hover:bg-primary hover:text-primary-foreground" />
              <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />
              <span className="truncate font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Portal / <span className="text-foreground">{section}</span>
              </span>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex min-h-0 w-full flex-1 overflow-y-auto bg-page">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// --- Navigation Configuration ---
const getMenuItems = (isBoardOrAbove: boolean): MenuItem[] => {
  const baseItems: MenuItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Events', url: '/events', icon: Calendar },
    { title: 'Classes', url: '/classes', icon: BookOpen },
    { title: 'Projects', url: '/projects', icon: FolderKanban },
    { title: 'Applications', url: '/applications', icon: FileText },
    { title: 'Members', url: '/members', icon: Users },
  ];

  // Board and E-board get Prospects page
  if (isBoardOrAbove) {
    baseItems.push({ title: 'Prospects', url: '/prospects', icon: UserPlus });
  }

  return baseItems;
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Print-production registration mark: two crossed 1px arms, ~10px, in primary
const RegistrationMark = ({ className }: { className: string }) => (
  <span aria-hidden="true" className={`pointer-events-none absolute h-2.5 w-2.5 ${className}`}>
    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary" />
    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-primary" />
  </span>
);

// --- Sidebar Component ---
interface AppSidebarProps {
  user: User;
  profile: Profile;
  isBoardOrAbove: boolean;
  signOut: () => void;
  navigate: (path: string) => void;
  isMobile: boolean;
}

const AppSidebar = ({
  user,
  profile,
  isBoardOrAbove,
  signOut,
  navigate,
  isMobile,
}: AppSidebarProps) => {
  const { setOpenMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const menuItems = getMenuItems(isBoardOrAbove);

  return (
    <Sidebar>
      <SidebarContent className="gap-0">
        {/* Brand block */}
        <div className="relative border-b border-sidebar-border p-3">
          <RegistrationMark className="left-1 top-1" />
          <RegistrationMark className="right-1 top-1" />
          <RegistrationMark className="bottom-1 left-1" />
          <RegistrationMark className="bottom-1 right-1" />
          <button
            onClick={() => navigate('/')}
            className="flex w-full cursor-pointer items-center gap-3 px-2 py-3 text-left transition-colors hover:bg-tint"
          >
            <div className="relative h-10 w-10 flex-shrink-0">
              <img
                src="/msu-logo.png"
                alt="MSU Logo"
                className="h-full w-full bg-transparent object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-mono text-[13px] font-bold uppercase leading-tight tracking-tight text-sidebar-foreground">
                Claude Builder Club
              </h2>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                MSU Chapter
              </p>
            </div>
          </button>
        </div>


        {/* Navigation */}
        <SidebarGroup className="flex-1 py-4">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-0">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="h-auto min-h-[44px] gap-3 rounded-none p-0 text-xs hover:bg-sidebar-primary hover:text-sidebar-primary-foreground hover:shadow-none"
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className="flex min-h-[44px] w-full items-center gap-3 px-4 font-mono text-xs font-medium uppercase tracking-[0.12em] transition-colors [&:not([aria-current=page])]:text-muted-foreground [&:not([aria-current=page])]:hover:bg-tint [&:not([aria-current=page])]:hover:text-foreground"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground"
                      onClick={handleNavClick}
                    >
                      <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Profile Card at Bottom */}
        <div className="border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 p-2 text-left transition-colors hover:bg-tint">
                <Avatar className="h-10 w-10 rounded-none border border-border">
                  <AvatarImage src={profile?.profile_picture_url || undefined} />
                  <AvatarFallback className="rounded-none font-mono text-sm">
                    {profile?.full_name
                      ? getInitials(profile.full_name)
                      : user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-semibold text-sidebar-foreground">
                    {profile?.full_name || 'No name'}
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <UserBadge className="shrink-0 whitespace-nowrap px-2 py-0 font-mono text-[10px] tracking-[0.08em]" />
                    {profile && (
                      <span className="flex items-center gap-1 font-mono text-xs tabular-nums text-muted-foreground">
                        <Trophy className="h-3 w-3" aria-hidden="true" />
                        <span className="font-medium">{profile.points}</span>
                      </span>
                    )}
                  </div>
                </div>
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className={isMobile ? "w-[250px]" : "w-56"}
              side="top"
              sideOffset={8}
            >
              <DropdownMenuItem onClick={() => {
                navigate('/profile');
                handleNavClick();
              }}>
                <Settings className="h-4 w-4 mr-1" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardLayout;
