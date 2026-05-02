import { ReactNode, useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, GraduationCap, HelpCircle, LayoutDashboard, User, Search, Menu, MessageSquare, Sun, Moon, Monitor, Bot, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { authService, AuthUser } from '@/services/authService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('jaara-theme') as any) || 'system';
  });

  useEffect(() => {
    // Load custom session
    setUser(authService.getSession());

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('jaara-theme', theme);
  }, [theme]);

  const handleSignOut = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/exams', icon: GraduationCap, label: 'Exams' },
    { to: '/questions', icon: HelpCircle, label: 'Q&A' },
    { to: '/books', icon: BookOpen, label: 'Books' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/ai-tutor', icon: Bot, label: 'AI Tutor' },
    { to: '/leaderboard', icon: GraduationCap, label: 'Leaders' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-6">
            <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-md group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Jaara Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block dark:text-white">Jaara Academy</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest leading-none">Learn Smart</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}

          {/* Admin link - restricted in logic later */}
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2">
          {user ? (
            <div className="flex items-center gap-3 px-2 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to="/profile">
                  <p className="text-sm font-medium truncate dark:text-white hover:text-blue-600 transition-colors cursor-pointer">{user.displayName || user.phoneNumber || 'Student'}</p>
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="text-xs text-slate-500 hover:text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex-1">
              <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700" variant="default">
                <User className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button variant="ghost" size="icon" className="shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                  {theme === 'light' ? <Sun className="w-4 h-4" /> : theme === 'dark' ? <Moon className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-lg">
              <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer gap-2">
                <Sun className="w-4 h-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer gap-2">
                <Moon className="w-4 h-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer gap-2">
                <Monitor className="w-4 h-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Header for Mobile */}
      <header className="md:hidden bg-white border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg dark:text-white">Jaara Academy</span>
        </Link>
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6 border-b border-slate-100">
              <span className="font-bold text-xl">Menu</span>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50"
                >
                  <item.icon className="w-5 h-5 text-slate-600" />
                  <span className="text-slate-800 font-medium">{item.label}</span>
                </NavLink>
              ))}
              <NavLink to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50">
                <LayoutDashboard className="w-5 h-5 text-slate-600" />
                <span className="text-slate-800 font-medium">Dashboard</span>
              </NavLink>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search exams, questions, books..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:hidden w-full relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>
        </div>
        {children}
        
        {/* Professional Footer */}
        <footer className="mt-20 pt-12 pb-8 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Jaara" className="w-8 h-8 rounded-lg shadow-sm" />
                <span className="text-xl font-bold tracking-tight">Jaara Academy</span>
              </div>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
                Empowering the next generation of Somali students with world-class digital learning materials, AI tutoring, and interactive assessment tools.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/exams" className="hover:text-blue-600 transition-colors">National Exams</Link></li>
                <li><Link to="/books" className="hover:text-blue-600 transition-colors">Curriculum Books</Link></li>
                <li><Link to="/questions" className="hover:text-blue-600 transition-colors">Daily Challenges</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              © 2024 Jaara Academy AI • All Rights Reserved
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Secure Educational Network
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden bg-white border-t border-slate-200 sticky bottom-0 z-50 flex items-center justify-around h-16 px-2 shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] uppercase font-bold tracking-wider">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
