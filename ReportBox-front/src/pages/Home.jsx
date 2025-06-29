import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Scale, Shield, Users, Home as HomeIcon, FileText, Heart, Building, Calculator, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const heroRef = useRef(null);
  const categoriesRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const descriptionRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const floatingElementsRef = useRef([]);
  const categoryWheelRef = useRef(null);
  const sectionTitleRef = useRef(null);
  const audioContextRef = useRef(null);
  const soundEnabledRef = useRef(true);

  const categories = [
    { name: 'Criminal Law', icon: Shield, color: 'from-red-500 to-red-700', shadowColor: 'shadow-red-500/30', page: '/criminal-law' },
    { name: 'Civil Law', icon: Scale, color: 'from-blue-500 to-blue-700', shadowColor: 'shadow-blue-500/30', page: '/civil-law' },
    { name: 'Family Law', icon: Heart, color: 'from-pink-500 to-pink-700', shadowColor: 'shadow-pink-500/30', page: '/family-law' },
    { name: 'Property Law', icon: HomeIcon, color: 'from-green-500 to-green-700', shadowColor: 'shadow-green-500/30', page: '/property-law' },
    { name: 'Labor Law', icon: Users, color: 'from-purple-500 to-purple-700', shadowColor: 'shadow-purple-500/30', page: '/labor-law' },
    { name: 'Consumer Rights', icon: FileText, color: 'from-orange-500 to-orange-700', shadowColor: 'shadow-orange-500/30', page: '/consumer-rights' },
    { name: 'Tax Law', icon: Calculator, color: 'from-yellow-500 to-yellow-700', shadowColor: 'shadow-yellow-500/30', page: '/tax-law' },
    { name: 'Corporate Law', icon: Building, color: 'from-indigo-500 to-indigo-700', shadowColor: 'shadow-indigo-500/30', page: '/corporate-law' }
  ];

  useEffect(() => {
    // Initialize Audio Context
    const initAudio = () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.log('Audio not supported:', error);
        soundEnabledRef.current = false;
      }
    };

    initAudio();

    // Simulate scroll-triggered animations without GSAP
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const triggerPoint = window.innerHeight * 0.4;

      if (scrollY > triggerPoint && !isLoaded) {
        setIsLoaded(true);
      }

      // Parallax effect for hero section
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // Keyboard navigation
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveCategory((prev) => (prev + 1) % categories.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveCategory((prev) => (prev - 1 + categories.length) % categories.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCategoryClick(activeCategory);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [activeCategory, isLoaded, categories.length]);

  // Sound generation functions
  const createHoverSound = () => {
    if (!soundEnabledRef.current || !audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Create a pleasant hover sound (soft beep)
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (error) {
      console.log('Sound generation error:', error);
    }
  };

  const createClickSound = () => {
    if (!soundEnabledRef.current || !audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Create a pleasant click sound
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      oscillator.type = 'triangle';
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (error) {
      console.log('Sound generation error:', error);
    }
  };

  const playHoverSound = () => {
    // Resume audio context if it's suspended (required by some browsers)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        createHoverSound();
      });
    } else {
      createHoverSound();
    }
  };

  const playClickSound = () => {
    // Resume audio context if it's suspended
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        createClickSound();
      });
    } else {
      createClickSound();
    }
  };

  const getCategoryPosition = (index, total) => {
    const angle = (index * 360) / total - 90;
    const radius = 200;
    const radian = (angle * Math.PI) / 180;
    
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  const handleCategoryClick = (index) => {
    if (isTransitioning) return;
    
    // Play click sound
    playClickSound();
    
    setIsTransitioning(true);
    setActiveCategory(index);
    
    // Simulate click animation without GSAP
    const categoryElement = document.querySelector(`[data-category="${index}"]`);
    if (categoryElement) {
      categoryElement.style.transform = 'scale(1.4)';
      setTimeout(() => {
        categoryElement.style.transform = '';
        setIsTransitioning(false);
        console.log(`Selected ${categories[index].name} - ${categories[index].page}`);
        // Handle navigation here - you can emit an event or call a navigation function
        // Example: onCategorySelect?.(categories[index]);
      }, 300);
    } else {
      setTimeout(() => {
        setIsTransitioning(false);
        console.log(`Selected ${categories[index].name} - ${categories[index].page}`);
      }, 300);
    }
  };

const navigate = useNavigate();

const handleChatClick = () => {
  navigate('/chat');
};

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Hero Section - Full Page */}
      <section ref={heroRef} className="h-screen flex items-center justify-center relative">
        {/* Enhanced Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            ref={el => floatingElementsRef.current[0] = el}
            className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full backdrop-blur-sm animate-pulse"
          ></div>
          <div 
            ref={el => floatingElementsRef.current[1] = el}
            className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-full backdrop-blur-sm animate-bounce"
          ></div>
          <div 
            ref={el => floatingElementsRef.current[2] = el}
            className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full backdrop-blur-sm animate-pulse"
          ></div>
          <div 
            ref={el => floatingElementsRef.current[3] = el}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full backdrop-blur-sm animate-bounce"
          ></div>
        </div>

        {/* Main Content */}
        <div className="text-center relative z-10">
          {/* Enhanced SEVAK Title with Hollow A */}
          <div ref={titleRef} className="relative animate-fade-in">
            <h1 className="text-8xl md:text-[10rem] lg:text-[12rem] font-black leading-none tracking-wider relative sevak-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-indigo-300"
                    style={{
                      WebkitTextStroke: '2px rgba(255, 255, 255, 0.3)',
                      textShadow: '0 0 60px rgba(59, 130, 246, 0.4), 0 0 100px rgba(139, 92, 246, 0.2)'
                    }}>
                SEV
              </span>
              <span className="hollow-a">A</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-indigo-300"
                    style={{
                      WebkitTextStroke: '2px rgba(255, 255, 255, 0.3)',
                      textShadow: '0 0 60px rgba(59, 130, 246, 0.4), 0 0 100px rgba(139, 92, 246, 0.2)'
                    }}>
                K
              </span>
            </h1>
            {/* Sparkle effects */}
            <Sparkles className="absolute top-4 right-4 text-yellow-400 w-8 h-8 animate-pulse" />
            <Sparkles className="absolute bottom-8 left-8 text-blue-400 w-6 h-6 animate-bounce" />
          </div>
          
          {/* Enhanced Subtitle */}
          <div ref={subtitleRef} className="mt-8 relative animate-fade-in-delay-1">
            <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-full px-8 py-3 inline-block">
              <p className="text-2xl md:text-3xl text-blue-200 font-light tracking-wide">
                Professional Legal Services
              </p>
            </div>
          </div>

          {/* Enhanced Description */}
          <div ref={descriptionRef} className="mt-8 animate-fade-in-delay-2">
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Navigate complex legal matters with confidence and expertise.
              <br />
              <span className="text-blue-300 font-medium bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Choose your practice area and let justice be served.
              </span>
            </p>
          </div>

          {/* Enhanced Scroll Indicator */}
          <div ref={scrollIndicatorRef} className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-fade-in-delay-3">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center relative overflow-hidden">
                <div className="w-1.5 h-4 bg-gradient-to-b from-white/80 to-blue-400 rounded-full mt-2 animate-bounce"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
              </div>
              <p className="text-white/60 text-sm">Scroll to explore</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section ref={categoriesRef} className={`min-h-screen py-20 px-6 relative transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Section Title */}
          <div ref={sectionTitleRef} className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-transparent">
              Practice Areas
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-slate-400">Choose your legal expertise</p>
          </div>

          {/* Enhanced Category Wheel */}
          <div ref={categoryWheelRef} className="relative w-full h-[500px] flex items-center justify-center">
            {/* Enhanced Outer Rings */}
            <div className="absolute w-96 h-96 border-2 border-white/10 rounded-full animate-spin" style={{ animationDuration: '60s' }}></div>
            <div className="absolute w-[450px] h-[450px] border border-white/5 rounded-full animate-spin" style={{ animationDuration: '90s', animationDirection: 'reverse' }}></div>
            <div className="absolute w-[500px] h-[500px] border border-blue-500/10 rounded-full"></div>
            
            {/* Enhanced Center Circle */}
            <div className="absolute w-32 h-32 bg-gradient-to-r from-slate-800/80 to-indigo-800/80 backdrop-blur-md border-2 border-white/20 rounded-full z-20 flex items-center justify-center">
              <div className="text-white/80 font-bold text-lg">SEVAK</div>
            </div>

            {/* Enhanced Categories */}
            {categories.map((category, index) => {
              const position = getCategoryPosition(index, categories.length);
              const Icon = category.icon;
              const isActive = index === activeCategory;
              const isHovered = index === hoveredCategory;
              const isVisible = isActive || isHovered;
              
              return (
                <div
                  key={index}
                  className="absolute transition-all duration-500 ease-out"
                  style={{
                    transform: `translateX(${position.x}px) translateY(${position.y}px)`,
                    zIndex: isActive ? 15 : isHovered ? 12 : 10
                  }}
                >
                  <button
                    type="button"
                    data-category={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCategoryClick(index);
                    }}
                    onMouseEnter={() => {
                      setHoveredCategory(index);
                      playHoverSound();
                    }}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`group relative w-24 h-24 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-white transition-all duration-500 transform cursor-pointer select-none ${
                      isActive 
                        ? `scale-125 ${category.shadowColor} shadow-2xl opacity-100` 
                        : isHovered
                        ? `scale-110 ${category.shadowColor} shadow-xl opacity-90`
                        : 'scale-90 opacity-40 hover:opacity-80'
                    }`}
                  >
                    {/* Enhanced Icon */}
                    <Icon className={`w-10 h-10 transition-all duration-300 ${
                      isVisible ? 'group-hover:rotate-12 group-hover:scale-110' : ''
                    }`} />

                    {/* Enhanced Active Effects */}
                    {isActive && (
                      <>
                        <div className="absolute inset-0 border-3 border-white/60 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 border-2 border-yellow-400/80 rounded-full scale-110 animate-ping"></div>
                        <div className="absolute inset-0 bg-white/20 rounded-full scale-125 animate-pulse"></div>
                      </>
                    )}

                    {/* Enhanced Hover Ring */}
                    {isHovered && !isActive && (
                      <div className="absolute inset-0 border-2 border-white/50 rounded-full scale-105 animate-pulse"></div>
                    )}

                    {/* Enhanced Glow Effect */}
                    {isVisible && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-40 rounded-full scale-150 blur-lg`}></div>
                    )}
                  </button>

                  {/* Enhanced Category Label */}
                  <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-4 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    <div className="bg-black/80 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2 whitespace-nowrap">
                      <p className="text-white text-sm font-semibold">{category.name}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Enhanced Selection Lines */}
            {categories.map((_, index) => {
              const position = getCategoryPosition(index, categories.length);
              const isActive = index === activeCategory;
              const isHovered = index === hoveredCategory;
              const isVisible = isActive || isHovered;
              
              if (!isVisible) return null;
              
              return (
                <div
                  key={`line-${index}`}
                  className="absolute w-1 bg-gradient-to-r from-transparent via-white/60 to-transparent transition-all duration-500"
                  style={{
                    height: '120px',
                    transformOrigin: '50% 100%',
                    transform: `rotate(${(index * 360) / categories.length + 90}deg)`,
                    opacity: isActive ? 1 : 0.6
                  }}
                ></div>
              );
            })}
          </div>

          {/* Enhanced Active Category Info */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-black/60 to-slate-800/60 backdrop-blur-md border border-white/30 rounded-3xl px-12 py-6 inline-block">
              <h4 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {categories[activeCategory].name}
              </h4>
              <p className="text-slate-300 text-lg mb-2">
                Expert legal consultation and representation
              </p>
              <p className="text-slate-400 text-sm">
                Press Enter or Click to explore • Use arrow keys to navigate
              </p>
            </div>
          </div>

          {/* Enhanced Navigation Instructions */}
          <div className="text-center mt-8">
            <div className="flex justify-center space-x-8 text-slate-400">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg border border-white/20 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-sm">Navigate</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg border border-white/20 flex items-center justify-center text-xs font-bold">
                  ↵
                </div>
                <span className="text-sm">Select</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Chat Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            handleChatClick();
          }}
          onMouseEnter={playHoverSound}
          className="group relative w-24 h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-500 flex items-center justify-center overflow-hidden border-2 border-white/20 cursor-pointer select-none"
        >
          <MessageCircle className="w-12 h-12 group-hover:rotate-12 transition-transform duration-300 relative z-10" />
          
          {/* Enhanced overlay effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
          
          {/* Enhanced floating particles */}
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-pink-400 rounded-full animate-bounce"></div>
          <div className="absolute top-2 left-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          
          {/* Enhanced hover rings */}
          <div className="absolute inset-0 border-4 border-white/40 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute inset-0 border-2 border-blue-400/60 rounded-full scale-0 group-hover:scale-125 transition-transform duration-700 delay-100"></div>
        </button>
        
        {/* Sound Toggle Button */}
        <button
          type="button"
          onClick={() => {
            soundEnabledRef.current = !soundEnabledRef.current;
            if (soundEnabledRef.current) {
              playHoverSound(); // Test sound when enabling
            }
          }}
          className="absolute -top-16 left-0 w-12 h-12 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center border border-white/20 text-xs font-bold"
          title={soundEnabledRef.current ? "Sound On" : "Sound Off"}
        >
          {soundEnabledRef.current ? "🔊" : "🔇"}
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        
        .animate-fade-in-delay-1 {
          animation: fade-in 1s ease-out 0.3s forwards;
          opacity: 0;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 0.6s forwards;
          opacity: 0;
        }
        
        .animate-fade-in-delay-3 {
          animation: fade-in 1s ease-out 0.9s forwards;
          opacity: 0;
        }

        /* Hollow A styling */
        .hollow-a {
          color: transparent;
          -webkit-text-stroke: 3px rgba(255, 255, 255, 0.8);
          text-stroke: 3px rgba(255, 255, 255, 0.8);
          background: transparent;
          text-shadow: 
            0 0 20px rgba(59, 130, 246, 0.6),
            0 0 40px rgba(139, 92, 246, 0.4),
            0 0 60px rgba(59, 130, 246, 0.3);
          position: relative;
        }

        .hollow-a::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          -webkit-background-clip: text;
          background-clip: text;
          z-index: -1;
        }

        /* Additional glow effect for hollow A */
        .sevak-title .hollow-a {
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .hollow-a {
            -webkit-text-stroke: 2px rgba(255, 255, 255, 0.8);
            text-stroke: 2px rgba(255, 255, 255, 0.8);
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;