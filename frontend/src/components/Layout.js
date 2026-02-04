import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, MessageCircle, User, PawPrint } from 'lucide-react';

export const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/copilot', icon: MessageCircle, label: 'Copilot' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-28">
      <div className="organic-blob w-96 h-96 bg-primary/20 top-[-100px] left-[-100px]" />
      <div className="organic-blob w-96 h-96 bg-secondary/20 bottom-[-100px] right-[-100px]" />
      <div className="organic-blob w-64 h-64 bg-accent/20 top-1/2 right-1/4" />

      {/* Logo at top */}
      <div className="pt-8 px-4 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <PawPrint className="w-8 h-8 text-primary" />
          <span className="font-heading font-bold text-2xl text-primary">Tailzyai</span>
        </div>
      </div>

      <main className="px-4 max-w-7xl mx-auto relative z-10">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-white/80 backdrop-blur-md rounded-full px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-orange-100/50">
          <div className="flex items-center justify-around gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} data-testid={`nav-${item.label.toLowerCase()}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center gap-1 px-6 py-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)]'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-medium text-xs">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;