import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Sparkles, BookOpen, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user, logoutUser } = useAuth();
  
  // Generate random stars for the background
  const stars = useMemo(() => {
    return [...Array(60)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative">
      {/* Starry Night Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white/40 rounded-full animate-twinkle"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
        {/* Deep radial glows for depth */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 transition-transform hover:scale-105">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">Scolar</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/forum" className="text-slate-400 hover:text-white font-medium transition-colors">
                Community
              </Link>
              {user ? (
                <>
                  <Link to="/scolarlist" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:scale-95">
                    Scholar Feed
                  </Link>
                  <button
                    onClick={logoutUser}
                    className="text-slate-200 bg-slate-800/80 hover:bg-slate-700 px-4 py-2 rounded-full font-semibold transition-all border border-white/10"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-slate-400 hover:text-white font-medium transition-colors px-3 py-2">
                    Log in
                  </Link>
                  <Link 
                    to="/login" 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:scale-95"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-balance">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 shadow-sm backdrop-blur-sm animate-fade-in-up">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span className="text-sm font-semibold text-indigo-200">AI-Powered Scholarship Discovery</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tight text-white mb-8 max-w-5xl mx-auto leading-[1.1] animate-fade-in-up delay-100">
            Fund your future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Scolar</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Discover, track, and apply to thousands of verified scholarships tailored perfectly to your academic profile.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up delay-300">
            {user ? (
              <Link 
                to="/scolarlist" 
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-2xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1 active:scale-95"
              >
                <span>Go to Scholar Feed</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-2xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1 active:scale-95"
                >
                  <span>Explore Opportunities</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto flex items-center justify-center bg-slate-900 border border-white/10 hover:border-white/20 text-slate-200 px-10 py-5 rounded-full font-bold text-lg transition-all hover:bg-slate-800"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 relative bg-slate-900/40 backdrop-blur-sm border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Why choose Scolar?</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">We streamline the entire scholarship process so you can focus on what matters most: your education.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-slate-900/50 p-10 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-2">
              <div className="group-hover:bg-indigo-600 bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-all duration-500">
                <Search className="h-8 w-8 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">community discussion</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                share tips, and get advice on applications in our vibrant community forum.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-slate-900/50 p-10 rounded-[2.5rem] border border-white/5 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-500 hover:-translate-y-2">
              <div className="group-hover:bg-purple-600 bg-purple-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-all duration-500">
                <Sparkles className="h-8 w-8 text-purple-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Guidance</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                Get personalized help with your essays and application strategy directly on the platform with our AI assistant.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-slate-900/50 p-10 rounded-[2.5rem] border border-white/5 hover:border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/5 transition-all duration-500 hover:-translate-y-2">
              <div className="group-hover:bg-pink-600 bg-pink-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-all duration-500">
                <ShieldCheck className="h-8 w-8 text-pink-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Verified Listings</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                Every scholarship undergoes a rigorous moderation process to ensure it's legitimate and scam-free.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 text-center relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-slate-950" />
        {/* Extra Stars in CTA background */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/20 rounded-full animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to secure your future?</h2>
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium opacity-90">
            Join thousands of students who have already found funding for their education through Scolar.
          </p>
          <Link 
            to={user ? "/scolarlist" : "/login"} 
            className="inline-flex items-center justify-center bg-white text-slate-950 hover:bg-slate-100 px-12 py-5 rounded-full font-black text-xl transition-all shadow-2xl hover:scale-105 active:scale-95 shadow-white/10"
          >
            {user ? "Go to Scholar Feed" : "Create Your Free Account"}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-8 md:mb-0 group cursor-pointer">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="font-black text-2xl text-white tracking-tighter">Scolar</span>
          </div>
          <p className="text-slate-500 font-medium">
            © {new Date().getFullYear()} Scolar. All rights reserved.
          </p>
          <div className="flex space-x-8 mt-8 md:mt-0">
            <a href="#" className="text-slate-500 hover:text-indigo-400 font-bold transition-colors">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-indigo-400 font-bold transition-colors">Terms</a>
            <a href="#" className="text-slate-500 hover:text-indigo-400 font-bold transition-colors">Contact</a>
          </div>
        </div>
      </footer>
      
      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-twinkle {
          animation: twinkle linear infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}} />
    </div>
  );
};

export default LandingPage;
