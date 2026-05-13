import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts, createPost, upvotePost, downvotePost, getPostComments, createComment, createCommentReply, analyzePostScam } from "../api";
import { useAuth } from "../context/AuthContext";
import PostAiGuidance from "../components/PostAiGuidance";

const ScolarList = () => {
  const navigate = useNavigate();
  const { logoutUser, user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  // MODAL STATES
  const [showModal, setShowModal] = useState(false);
  const [text, setText] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  // COMMENTS STATES
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // SCAM ANALYSIS STATE
  const [scamAnalysis, setScamAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // FETCH POSTS
  const fetchPosts = async () => {
    const res = await getPosts();
    if (res.success) setPosts(res.posts);
  };

  // FETCH COMMENTS FOR SELECTED POST
  const fetchComments = async (postId) => {
    const res = await getPostComments(postId);
    if (res.success) setComments(res.comments);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchPosts();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost.id);
      setScamAnalysis(null); // Reset analysis when switching posts
    } else {
      setComments([]);
      setReplyingTo(null);
      setReplyContent("");
      setScamAnalysis(null);
    }
  }, [selectedPost]);

  // SORT POSTS BY ENGAGEMENT
  const sortedPosts = [...posts].sort((a, b) => {
    const aScore = (a.upvotes || 0) - (a.downvotes || 0);
    const bScore = (b.upvotes || 0) - (b.downvotes || 0);
    return bScore - aScore;
  });

  // OPEN MODAL
  const openModal = () => {
    setShowModal(true);
    setText("");
  };

  // CLOSE MODAL
  const closeModal = () => {
    setShowModal(false);
    setText("");
  };

  // CREATE POST - SIMPLIFIED
  const handlePost = async () => {
    if (!text) return alert("Write something first");

    setPostLoading(true);

    const res = await createPost(text);

    if (res.success) {
      closeModal();
      fetchPosts();
    } else {
      alert(res.message || "Failed to create post");
    }

    setPostLoading(false);
  };

  // CREATE COMMENT
  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);

    const res = await createComment(selectedPost.id, newComment);
    if (res.success) {
      setNewComment("");
      fetchComments(selectedPost.id);
    } else {
      alert("Failed to post comment");
    }

    setCommentLoading(false);
  };

  // CREATE REPLY
  const handleCreateReply = async () => {
    if (!replyContent.trim()) return;
    setCommentLoading(true);

    const res = await createCommentReply(replyingTo, replyContent);
    if (res.success) {
      setReplyContent("");
      setReplyingTo(null);
      fetchComments(selectedPost.id);
    } else {
      alert("Failed to post reply");
    }

  // AI SCAM ANALYSIS
  const handleAnalyzeScam = async () => {
    if (!selectedPost) return;
    setAnalysisLoading(true);
    const res = await analyzePostScam(selectedPost.id);
    if (res.success) {
      setScamAnalysis(res);
      // Update the selected post locally to show new label/score if needed
      setSelectedPost(prev => ({ ...prev, ai_label: res.label, ai_score: res.score }));
      fetchPosts(); // Refresh list to update labels there too
    } else {
      alert("AI analysis failed: " + (res.message || "Unknown error"));
    }
    setAnalysisLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6 font-sans text-gray-100">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-2xl mb-10 border border-white/10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight">
            ✨ ScholarHub
          </h1>

          <div className="flex items-center gap-4">
            <a
              href="/forum"
              className="text-slate-400 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest border-b-2 border-transparent hover:border-indigo-500 pb-1"
            >
              Community Forum
            </a>
            <button
              onClick={openModal}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
            >
              ➕ Create Post
            </button>
            <button
              onClick={logoutUser}
              className="bg-slate-700 text-white font-bold px-6 py-3 rounded-xl border border-slate-600/50 hover:bg-slate-600 transition-all duration-300"
            >
              Log out
            </button>
          </div>
        </div>

      {/* POSTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sortedPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="cursor-pointer bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-700/50 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/30 relative overflow-hidden group flex flex-col justify-between"
          >
            {/* Adding a gentle 3D glow gradient aura on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div>
              <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl mb-4 border border-slate-700/30">
                <p className="text-md font-bold text-gray-200">👤 {post.username || "Anonymous"}</p>
                <p className="text-sm text-gray-400 font-medium">
                  {post.created_at ? new Date(post.created_at).toLocaleDateString() : "Just now"}
                </p>
              </div>

              <p className="mt-2 line-clamp-5 text-gray-300 tracking-wide font-medium text-lg leading-relaxed">{post.content}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/50">
              {/* ENGAGEMENT METRICS */}
              <div className="flex justify-between tracking-wide text-sm items-center mb-4">
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-300 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                    💬 {post.commentCount || 0} Comments
                  </span>

                  {/* SHOW FLAG VISIBLY */}
                  {post.is_flagged === 1 && (
                    <span className="text-red-400 text-xs font-bold flex items-center bg-red-950/50 px-3 py-1.5 rounded-full border border-red-800">
                      🚩 Flagged
                    </span>
                  )}
                </div>

                <span className="text-xs font-bold text-slate-300 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                  🔥 Engagement: {((post.upvotes || 0) - (post.downvotes || 0))}
                </span>
              </div>

              {/* UPVOTE & DOWNVOTE */}
              <div className="flex gap-2">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const res = await upvotePost(post.id);
                    if (!res.success) {
                      alert(res.message || "Unable to update vote");
                      return;
                    }
                    fetchPosts();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-700/50 hover:bg-green-600/50 border border-slate-600/50 text-md font-bold text-gray-200 rounded-xl transition duration-200 shadow-sm"
                >
                  👍 {post.upvotes || 0}
                </button>
                
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const res = await downvotePost(post.id);
                    if (!res.success) {
                      alert(res.message || "Unable to update vote");
                      return;
                    }
                    fetchPosts();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-700/50 hover:bg-red-600/50 border border-slate-600/50 text-md font-bold text-gray-200 rounded-xl transition duration-200 shadow-sm"
                >
                  👎 {post.downvotes || 0}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* POST MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">

          <div className="bg-slate-900 border border-slate-700 shadow-2xl w-[500px] p-8 rounded-3xl animate-fade-in-up">

            <h2 className="text-2xl font-extrabold mb-4 text-white">
              Create New Post
            </h2>

            <textarea
              className="w-full bg-slate-800 border border-slate-600 p-4 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your scholarship opportunity or experience..."
            />

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={closeModal}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition"
              >
                Cancel
              </button>

              <button
                onClick={handlePost}
                disabled={postLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                {postLoading ? "Posting..." : "Post Now"}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* POST DETAILS POPUP */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-40 transition-opacity p-4">

         <div className="bg-slate-900 shadow-2xl p-8 rounded-[2rem] w-full max-w-4xl h-[85vh] overflow-y-auto relative border border-slate-700">

            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white hover:bg-red-500/80 p-3 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm"
            >
              ✖
            </button>

            <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
               <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-lg ring-4 ring-indigo-500/20">
                 {selectedPost.username ? selectedPost.username.charAt(0).toUpperCase() : "A"}
               </div>
               <div>
                  <p className="font-extrabold text-white text-2xl tracking-tight">
                    {selectedPost.username || "Anonymous"}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">{selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleDateString() : "Just now"}</p>
               </div>
            </div>

            <p className="mt-4 text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>

            <div className="mt-8 flex gap-4 items-center flex-wrap">
              <span className="font-bold text-blue-300 bg-blue-950/50 px-4 py-2 rounded-xl border border-blue-900/50">
                👍 Upvotes: {selectedPost.upvotes || 0}
              </span>

              <span className="font-bold text-red-300 bg-red-950/50 px-4 py-2 rounded-xl border border-red-900/50">
                👎 Downvotes: {selectedPost.downvotes || 0}
              </span>

              <span className="font-bold text-slate-300 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
                💬 Comments: {selectedPost.commentCount || 0}
              </span>
            </div>

            {selectedPost.is_flagged === 1 && (
              <div className="mt-6 text-red-300 font-bold bg-red-950/50 p-4 border border-red-800/50 rounded-xl flex items-center gap-3">
                <span className="text-2xl">🚩</span>
                <p>This post has been flagged by the system.</p>
              </div>
            )}

            {/* AI SCAM ANALYSIS BUTTON & DISPLAY */}
            <div className="mt-8 p-6 bg-slate-800/40 border border-slate-700/50 rounded-3xl backdrop-blur-md shadow-inner">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span className="p-2 bg-indigo-500/20 rounded-lg">🛡️</span>
                    AI Integrity Guard
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">Deep analysis of content, engagement and community sentiment</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnalyzeScam();
                  }}
                  disabled={analysisLoading}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 text-sm"
                >
                  {analysisLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : "Verify with AI"}
                </button>
              </div>

              {(scamAnalysis || (selectedPost.ai_label && selectedPost.ai_label !== "PENDING")) && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* LABEL CARD */}
                    <div className={`p-4 rounded-2xl border ${
                      (scamAnalysis?.label || selectedPost.ai_label) === 'SCAM' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                      (scamAnalysis?.label || selectedPost.ai_label) === 'SUSPICIOUS' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                      'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">Safety Rating</p>
                      <p className="text-2xl font-black tracking-tighter">
                        {scamAnalysis?.label || selectedPost.ai_label}
                      </p>
                    </div>

                    {/* SCORE CARD */}
                    <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-700/50">
                      <div className="flex justify-between items-end mb-2">
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Risk Factor</p>
                        <p className="text-xl font-black text-white">{scamAnalysis?.score || selectedPost.ai_score}%</p>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            (scamAnalysis?.score || selectedPost.ai_score) > 70 ? 'bg-red-500' :
                            (scamAnalysis?.score || selectedPost.ai_score) > 40 ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${scamAnalysis?.score || selectedPost.ai_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* REASONING SECTION */}
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/30" />
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      Analysis Reasoning
                    </p>
                    <p className="text-slate-300 leading-relaxed text-sm font-medium">
                      {scamAnalysis?.reasoning || "Historical data confirms this post's current rating based on content patterns and community flags."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* AI GUIDANCE PER POST */}
            <PostAiGuidance postId={selectedPost.id} />

            {/* COMMENTS SECTION */}
            <div className="mt-8 border-t border-slate-700 pt-6">
              <h3 className="text-xl font-bold text-white mb-4">Comments</h3>

              {/* ADD COMMENT FORM */}
              <div className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-slate-800 border border-slate-600 p-4 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                  rows={3}
                />
                <button
                  onClick={handleCreateComment}
                  disabled={commentLoading || !newComment.trim()}
                  className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition disabled:bg-slate-600"
                >
                  {commentLoading ? "Posting..." : "Post Comment"}
                </button>
              </div>

              {/* COMMENTS LIST */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-blue-300">{comment.username}</span>
                      <span className="text-sm text-slate-400">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-200 mb-3">{comment.content}</p>

                    {/* REPLY BUTTON */}
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Reply
                    </button>

                    {/* REPLY FORM */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 pl-4 border-l-2 border-slate-600">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full bg-slate-700 border border-slate-600 p-3 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleCreateReply}
                            disabled={commentLoading || !replyContent.trim()}
                            className="px-4 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition disabled:bg-slate-600"
                          >
                            {commentLoading ? "Posting..." : "Reply"}
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                            className="px-4 py-1 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* REPLIES */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-slate-600 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="bg-slate-700/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-green-300 text-sm">{reply.username}</span>
                              <span className="text-xs text-slate-500">{new Date(reply.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default ScolarList;