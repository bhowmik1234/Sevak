import { useState } from 'react';
import { Menu, X, Home, Info, ChevronDown, MessageCircle, User, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  const navigate = useNavigate();
  const sessionData = sessionStorage.getItem('userId');

  useEffect(() => {
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        setUserInfo(parsed);
      } catch (err) {
        console.error('Failed to parse session userId', err);
      }
    }
  }, [sessionData]);

  const handleChatClick = () => {
    navigate('/chat');
  };

  const handleReportClick =()=>{
    navigate('/report');
  };

  const handleContactClick =()=>{
    navigate('/emergency-contact');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  const menuItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'About', icon: Info, href: '#about' }
  ];

  const legalCategories = [
    'Criminal Law',
    'Civil Law', 
    'Family Law',
    'Property Law',
    'Labor Law',
    'Consumer Rights',
    'Tax Law',
    'Corporate Law'
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md shadow-2xl border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand - Left */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-300 hover:to-indigo-300 transition-all duration-300 tracking-wide">
              <a href="/">SEVAK</a>
            </h1>
          </div>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-slate-800/50 group"
                >
                  <IconComponent size={18} className="group-hover:scale-110 transition-transform duration-300" />
                  <span>{item.name}</span>
                </a>
              );
            })}
            
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={toggleCategories}
                className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-slate-800/50 group"
              >
                <span>Practice Areas</span>
                <ChevronDown size={16} className={`transition-all duration-300 group-hover:scale-110 ${isCategoriesOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              
              <div className={`absolute top-full left-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/50 z-50 transition-all duration-300 origin-top ${
                isCategoriesOpen 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}>
                <div className="py-2">
                  {legalCategories.map((category, index) => (
                    <a
                      key={category}
                      href={`#${category.toLowerCase().replace(' ', '-')}`}
                      className="block px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 border-l-2 border-transparent hover:border-blue-400"
                      onClick={() => setIsCategoriesOpen(false)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {category}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={handleContactClick}
              className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20 group"
            >
              <FileText size={18} className="group-hover:scale-110 transition-transform duration-300" />
              <span>Emergency Contact</span>
            </button>

            <button 
              onClick={handleReportClick}
              className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20 group"
            >
              <FileText size={18} className="group-hover:scale-110 transition-transform duration-300" />
              <span>Report</span>
            </button>
            <button 
              onClick={handleChatClick}
              className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20 group"
            >
              <MessageCircle size={18} className="group-hover:scale-110 transition-transform duration-300" />
              <span>Chat</span>
            </button>

            {
                (userInfo)? (
                  <a
                    href="#profile"
                    className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-slate-800/50 group"
                  >
                    <User size={18} className="group-hover:scale-110 transition-transform duration-300" />
                    <span>Profile</span>
                  </a>
                ): 
                (
                  <a href="/login" className="text-blue-900 bg-blue-500 px-4 py-2 rounded-lg hover:underline">
                    Login
                  </a>
                )
              }      
            

          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden bg-slate-900/98 backdrop-blur-md border-t border-slate-700/50 transition-all duration-300 ease-in-out ${
        isMenuOpen 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-4 pt-2 pb-3 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-800/50 px-3 py-3 rounded-lg font-medium transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <IconComponent size={20} />
                <span>{item.name}</span>
              </a>
            );
          })}
          
          {/* Mobile Categories */}
          <div className="px-3 py-2">
            <button
              onClick={toggleCategories}
              className="flex items-center space-x-2 w-full text-left text-slate-300 hover:text-white py-2 font-medium transition-all duration-300"
            >
              <span>Practice Areas</span>
              <ChevronDown size={16} className={`transition-all duration-300 ${isCategoriesOpen ? 'rotate-180 text-blue-400' : ''}`} />
            </button>
            
            <div className={`mt-2 pl-4 space-y-1 transition-all duration-300 ease-in-out ${
              isCategoriesOpen 
                ? 'max-h-64 opacity-100' 
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
              {legalCategories.map((category) => (
                <a
                  key={category}
                  href={`#${category.toLowerCase().replace(' ', '-')}`}
                  className="block py-2 text-slate-400 hover:text-blue-400 transition-colors duration-200 border-l-2 border-transparent hover:border-blue-400 pl-3"
                  onClick={() => {
                    setIsCategoriesOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  {category}
                </a>
              ))}
            </div>
          </div>
          
          {/* Mobile Actions */}
          <button 
            onClick={handleChatClick}
            className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20 w-full px-3 py-3 rounded-lg font-medium transition-all duration-300"
          >
            <MessageCircle size={20} />
            <span>Chat</span>
          </button>
          
          <a
            href="#profile"
            className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-800/50 px-3 py-3 rounded-lg font-medium transition-all duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            <User size={20} />
            <span>Profile</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;