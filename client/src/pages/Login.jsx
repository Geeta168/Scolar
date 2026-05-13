import { useState, useMemo } from 'react'
import { Bot, User, Mail, Lock, GraduationCap, ArrowLeft, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser } from '../api';

const Login = () => {
    const { setAuthUser } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Generate random stars for the background
    const stars = useMemo(() => {
        return [...Array(40)].map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2 + 1,
            delay: Math.random() * 5,
            duration: Math.random() * 3 + 2,
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let res;
            if (isLogin) {
                res = await loginUser({ email, password });
            } else {
                res = await registerUser({ username, email, password });
            }

            if (res.success) {
                setAuthUser(res.user);
                navigate("/scolarlist");
            } else {
                alert(res.message);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden relative">
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
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-900/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Branding & Back to Home */}
                <div className="flex flex-col items-center mb-8">
                    <Link to="/" className="flex items-center space-x-2 group mb-6 transition-all hover:-translate-y-0.5">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20 group-hover:bg-indigo-700 transition-colors">
                            <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <span className="font-black text-3xl tracking-tight text-white uppercase italic">Scolar</span>
                    </Link>
                    
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        {isLogin ? "Welcome back" : "Create an account"}
                    </h2>
                    <p className="text-slate-400 mt-2 text-center max-w-sm font-medium">
                        {isLogin 
                            ? "Log in to manage your scholarships and track applications." 
                            : "Join Scolar today and find the perfect funding for your education."}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl shadow-indigo-500/5 p-8 sm:p-10 transition-all duration-500">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-400 text-slate-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-white text-base font-medium placeholder:text-slate-600"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-400 text-slate-500">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input 
                                    type="email" 
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-white text-base font-medium placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-bold text-slate-300">Password</label>
                                {isLogin && (
                                    <a href="#" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-400 text-slate-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-white text-base font-medium placeholder:text-slate-600"
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white py-4 rounded-2xl font-black text-xl transition-all shadow-xl shadow-indigo-600/10 overflow-hidden relative group active:scale-95"
                        >
                            <span className={`inline-flex items-center space-x-2 transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                <span>{isLogin ? "Sign In" : "Create Account"}</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </span>
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                </div>
                            )}
                        </button>

                        <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-900/50 backdrop-blur-sm px-4 text-slate-500 font-bold tracking-widest">Or continue with</span>
                            </div>
                        </div>

                        <p className="text-center text-slate-400 font-bold text-lg">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                type="button"
                                className="text-indigo-400 hover:text-indigo-300 font-black hover:underline underline-offset-4 transition-all"
                                onClick={() => setLogin(!isLogin)}
                            >
                                {isLogin ? "Sign up" : "Log in"}
                            </button>
                        </p>
                    </form>
                </div>
                
                {/* Back to Home Link */}
                <div className="mt-8 text-center animate-fade-in-up">
                    <Link to="/" className="inline-flex items-center text-slate-500 hover:text-white font-bold transition-colors text-base group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to homepage
                    </Link>
                </div>
            </div>
            
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
            `}} />
        </div>
    )
}

export default Login
