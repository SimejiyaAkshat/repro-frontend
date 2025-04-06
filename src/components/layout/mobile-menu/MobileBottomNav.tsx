
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useMobileMenu } from './useMobileMenu';
import { 
  HomeIcon, 
  ClipboardIcon, 
  CalendarIcon, 
  MessageSquareIcon, 
  UserIcon, 
  BuildingIcon, 
  FileTextIcon, 
  SettingsIcon,
  BarChart3Icon,
  MoreHorizontal
} from 'lucide-react';

export const MobileBottomNav = () => {
  const { filteredItems, toggleMenu } = useMobileMenu();
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  // Only show the first 5 items in the bottom nav
  const navItems = filteredItems.slice(0, 5);

  // Function to render the correct icon based on the string name
  const renderIcon = (iconName: string, isActive: boolean) => {
    const iconClass = cn(
      "h-5 w-5 mb-1",
      isActive ? "text-primary" : isLightMode ? "text-gray-600" : "text-muted-foreground"
    );

    switch (iconName) {
      case 'Home':
        return <HomeIcon className={iconClass} />;
      case 'Clipboard':
        return <ClipboardIcon className={iconClass} />;
      case 'Calendar':
        return <CalendarIcon className={iconClass} />;
      case 'MessageSquare':
        return <MessageSquareIcon className={iconClass} />;
      case 'User':
        return <UserIcon className={iconClass} />;
      case 'Building':
        return <BuildingIcon className={iconClass} />;
      case 'FileText':
        return <BarChart3Icon className={iconClass} />;
      case 'Settings':
        return <SettingsIcon className={iconClass} />;
      default:
        return <HomeIcon className={iconClass} />;
    }
  };

  return (
    <motion.div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 px-1 py-2",
        isLightMode 
          ? "bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-sm"
          : "bg-background/50 backdrop-blur-xl border-t border-white/10 shadow-lg"
      )}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <nav className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors",
              "text-xs",
              item.isActive
                ? isLightMode
                  ? "text-primary bg-primary/5"
                  : "text-primary bg-primary/20"
                : isLightMode
                ? "text-gray-600 hover:text-primary hover:bg-primary/5"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            )}
          >
            {renderIcon(item.icon, item.isActive)}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        {/* More button to open full menu */}
        <button
          onClick={toggleMenu}
          className={cn(
            "flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors",
            "text-xs",
            isLightMode
              ? "text-gray-600 hover:text-primary hover:bg-primary/5"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          )}
        >
          <MoreHorizontal className={cn(
            "h-5 w-5 mb-1",
            isLightMode ? "text-gray-600" : "text-muted-foreground"
          )} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* Special shape at the top of the navbar */}
      <div className="absolute -top-[10px] left-0 right-0 h-[10px] overflow-hidden">
        <svg 
          className={cn(
            "w-full h-full",
            isLightMode ? "fill-white/80" : "fill-background/50"
          )}
          viewBox="0 0 375 10" 
          preserveAspectRatio="none"
        >
          <path d="M256 0H117L48.25 10H0V10H375V10H324.75L257 0.16V0H256Z" />
        </svg>
      </div>
    </motion.div>
  );
};
