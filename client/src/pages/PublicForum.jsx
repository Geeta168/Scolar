import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDiscussions, createDiscussion } from '../api';
import DiscussionCard from '../components/DiscussionCard';
import { Send, GraduationCap, ArrowLeft, ArrowRight, UserCircle, Sparkles, MessageSquarePlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const PublicForum = () => {
    const { user } = useAuth();
    const [discussions, setDiscussions] = useState([]);
    const [newDiscussion, setNewDiscussion] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Starry background effect matched with the rest of the app
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

    useEffect(() => {
        loadDiscussions();
    }, []);

    const loadDiscussions = async () => {
        const res = await fetchDiscussions();
        if (res.success) {
            setDiscussions(res.discussions);
        }
    };

    const handleCreateDiscussion = async (e) => {
        e.preventDefault();
        if (!newDiscussion.trim()) return;
        setIsLoading(true);

        try {
            const res = await createDiscussion(newDiscussion, isAnonymous);
            if (res.success) {
                setNewDiscussion("");
                loadDiscussions();
            } else {
                const errMsg = res.error || res.message || res.details || "Failed to post";
                console.error("FORUM POST ERROR:", res);
                alert(`Error: ${errMsg}`);
            }
        } catch (err) {
            console.error("FORUM FETCH ERROR:", err);
            alert(`Network Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-300 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative p-4 sm:p-6 lg:p-12">
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
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20 group-hover:bg-indigo-700 transition-colors">
                            <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <span className="font-black text-3xl tracking-tight text-white uppercase italic">Scolar Forum</span>
                    </Link>
                    <nav className="flex space-x-4">
                        <Link to="/scolarlist" className="text-slate-400 hover:text-white transition-colors font-black text-sm uppercase tracking-widest border-b-2 border-transparent hover:border-indigo-500 pb-1">Scholarships</Link>
                        <Link to="/" className="text-slate-400 hover:text-white transition-colors font-black text-sm uppercase tracking-widest border-b-2 border-transparent hover:border-indigo-500 pb-1">Home</Link>
                    </nav>
                </div>

                {/* Hero Title */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">Discussion Hub</h1>
                    <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">Share your experiences, ask questions, and guide fellow seekers on their journey.</p>
                </div>

                {/* Discussion Form */}
                <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 mb-16 transition-all duration-500 hover:border-indigo-500/30">
                    <div className="flex items-center space-x-2 mb-6">
                        <div className="bg-indigo-500/20 p-2.5 rounded-xl">
                            <MessageSquarePlus className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white">Start a Discussion</h2>
                    </div>
                    
                    <form onSubmit={handleCreateDiscussion} className="space-y-6">
                        <textarea 
                            value={newDiscussion}
                            onChange={(e) => setNewDiscussion(e.target.value)}
                            placeholder={user ? "What's on your mind? Ask a question or share a tip..." : "Please log in to start a discussion"}
                            disabled={!user}
                            className="w-full h-40 bg-slate-950/50 border border-white/10 rounded-3xl p-6 text-white text-lg font-medium placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                        ></textarea>
                        
                        <div className="flex items-center justify-between">
                            {user ? (
                                <div className="flex items-center cursor-pointer group" onClick={() => setIsAnonymous(!isAnonymous)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isAnonymous ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                                        {isAnonymous && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                    </div>
                                    <span className="ml-3 text-xs font-black text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-widest">Post Anonymously</span>
                                </div>
                            ) : (
                                <Link to="/login" className="text-amber-500 font-black text-sm uppercase tracking-widest hover:underline">Log in to post</Link>
                            )}

                            <button 
                                type="submit"
                                disabled={isLoading || !user}
                                className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/20 disabled:bg-indigo-800 disabled:shadow-none hover:-translate-y-1 active:scale-95 group"
                            >
                                <span>{isLoading ? "Posting..." : "Post Discussion"}</span>
                                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* List Section */}
                <div className="space-y-10 mb-16">
                    <h2 className="text-3xl font-black text-white flex items-center space-x-3 mb-8">
                        <span>Latest Discusions</span>
                        <div className="h-1 flex-grow bg-gradient-to-r from-indigo-500/50 to-transparent rounded-full ml-4" />
                    </h2>
                    {discussions.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/20 rounded-[2.5rem] border border-white/5 border-dashed">
                            <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 text-xl font-bold italic">No discussions yet. Be the first to start a conversation!</p>
                        </div>
                    ) : (
                        discussions.map(discussion => (
                            <DiscussionCard key={discussion.discussion_id} discussion={discussion} />
                        ))
                    )}
                </div>

                <div className="mt-8 text-center">
                    <Link to="/" className="inline-flex items-center text-slate-500 hover:text-white font-bold transition-colors text-base group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to homepage
                    </Link>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes twinkle {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.3); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-twinkle { animation: twinkle linear infinite; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            `}} />
        </div>
    );
};

export default PublicForum;
