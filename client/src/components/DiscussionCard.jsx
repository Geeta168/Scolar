import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Send, ChevronDown, ChevronUp, UserCircle } from 'lucide-react';
import { fetchDiscussionComments, createDiscussionComment } from '../api';
import { useAuth } from '../context/AuthContext';

const DiscussionCard = ({ discussion }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isExpanded) {
            loadComments();
        }
    }, [isExpanded]);

    const loadComments = async () => {
        const res = await fetchDiscussionComments(discussion.discussion_id);
        if (res.success) {
            setComments(res.comments);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsLoading(true);

        const res = await createDiscussionComment(discussion.discussion_id, newComment, isAnonymous);
        if (res.success) {
            setNewComment("");
            loadComments();
        } else {
            alert("Error posting comment");
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl transition-all duration-300 hover:border-indigo-500/30">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-500/20 p-2 rounded-xl">
                        <UserCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-white">{discussion.username}</h3>
                        <p className="text-xs text-slate-500">{new Date(discussion.created_at).toLocaleString()}</p>
                    </div>
                </div>
                {discussion.is_anonymous && (
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-1 rounded-full uppercase font-black tracking-widest">Anonymous</span>
                )}
            </div>

            <p className="text-slate-300 text-lg leading-relaxed mb-6 font-medium">
                {discussion.content}
            </p>

            <div className="flex items-center space-x-6 border-t border-white/5 pt-6">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center space-x-2 text-slate-400 hover:text-indigo-400 transition-colors font-bold text-sm group"
                >
                    <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>{isExpanded ? "Hide Discussions" : `Show Discussions`}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-8 space-y-6 animate-fade-in-up">
                    <div className="space-y-6 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                        {comments.length === 0 ? (
                            <p className="text-slate-500 text-sm italic py-4">No discussions here yet. Be the first to reply!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.comment_id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="font-bold text-indigo-300 text-xs">{comment.username}</span>
                                        <span className="text-[10px] text-slate-600">• {new Date(comment.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handlePostComment} className="mt-6">
                        <div className="relative group">
                            <input 
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add to the discussion..."
                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-6 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                disabled={!user}
                            />
                            <button 
                                type="submit"
                                disabled={isLoading || !user}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-400 disabled:text-slate-700 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        {!user && <p className="text-[10px] text-amber-500/70 mt-2 ml-2 font-bold uppercase tracking-widest">Log in to join the discussion</p>}
                        
                        {user && (
                            <div className="mt-3 flex items-center ml-2">
                                <label className="flex items-center cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                        className="hidden"
                                    />
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isAnonymous ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                                        {isAnonymous && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <span className="ml-2 text-[10px] font-black text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-widest">Post Anonymously</span>
                                </label>
                            </div>
                        )}
                    </form>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}} />
        </div>
    );
};

export default DiscussionCard;
