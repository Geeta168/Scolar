import React, { useEffect, useState } from "react";
import { getPosts, createPost, upvotePost, analyzeText } from "../api";
import PostAiGuidance from "../components/PostAiGuidance";

const ScolarList = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [votedPosts, setVotedPosts] = useState([]);

  // MODAL STATES
  const [showModal, setShowModal] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // PROOF STATES
  const [proofRequired, setProofRequired] = useState(false);
  const [proofAttempts, setProofAttempts] = useState(0);
  const [proofText, setProofText] = useState("");

  // FETCH POSTS
  const fetchPosts = async () => {
    const res = await getPosts();
    if (res.success) setPosts(res.posts);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // SORT POSTS (SAFE > SUSPICIOUS > SCAM)
  const sortedPosts = [...posts].sort((a, b) => {
    const priority = {
      SAFE: 3,
      SUSPICIOUS: 2,
      SCAM: 1,
    };

    if (priority[a.ai_label] !== priority[b.ai_label]) {
      return priority[b.ai_label] - priority[a.ai_label];
    }

    return b.ai_score - a.ai_score;
  });

  // OPEN MODAL
  const openModal = () => {
    setShowModal(true);
    setText("");
    setAiResult(null);
    setProofRequired(false);
    setProofAttempts(0);
    setProofText("");
  };

  // CLOSE MODAL
  const closeModal = () => {
    setShowModal(false);
    setText("");
    setAiResult(null);
    setProofRequired(false);
    setProofAttempts(0);
    setProofText("");
  };

  // AI ANALYSIS (OPTIONAL PREVIEW)
  const handleAnalyze = async () => {
    if (!text) return alert("Write something first");

    const res = await analyzeText(text);

    console.log("AI RESPONSE 👉", res);

    if (res.success) {
      setAiResult(res.data);
    } else {
      alert("AI analysis failed");
    }
  };

  // CREATE POST
  const handlePost = async () => {
    if (!text) return alert("Write something first");

    if (!aiResult) {
      alert("Please run AI analysis first");
      return;
    }

    const isRisky = aiResult.label === "SCAM" || aiResult.label === "SUSPICIOUS" || aiResult.score < 30;

    if (isRisky && !proofRequired) {
      setProofRequired(true);
      return;
    }

    let finalContent = text;

    if (proofRequired) {
      if (!proofText) return alert("Please provide proof of authenticity.");
      
      setLoading(true);
      // Run AI again with the proof appended
      const proofRes = await analyzeText(text + "\\n\\nProof Provided: " + proofText);
      
      if (proofRes.success && proofRes.data.label === "SAFE") {
        finalContent = text + "\\n\\n[Verified Proof: " + proofText + "]";
      } else {
        setProofAttempts((prev) => prev + 1);
        if (proofAttempts < 2) {
          setLoading(false);
          alert(`Proof rejected. Attempts left: \${2 - proofAttempts}`);
          return;
        } else {
          alert("Proof verification failed 3 times. Your post will be flagged and submitted.");
          finalContent = text + "\\n\\n[Unverified/Flagged Proof: " + proofText + "]";
        }
      }
    }

    setLoading(true);

    const res = await createPost(finalContent);

    if (res.success) {
      closeModal();
      fetchPosts();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6 font-sans text-gray-100">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-2xl mb-10 border border-white/10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight">
            ✨ Scholar Feed
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
              {/* AI TAG & FLAG */}
              <div className="flex justify-between tracking-wide text-sm items-center mb-4">
                <div className="flex gap-3 items-center">
                  <span
                    className={`px-4 py-1.5 text-white rounded-full text-xs font-black shadow-md uppercase tracking-wider
                      \${
                        post.ai_label === "SAFE"
                          ? "bg-gradient-to-r from-emerald-500 to-green-600"
                          : post.ai_label === "SUSPICIOUS"
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                          : "bg-gradient-to-r from-red-600 to-rose-700"
                      }
                    `}
                  >
                    {post.ai_label}
                  </span>

                  {/* SHOW FLAG VISIBLY */}
                  {post.is_flagged === 1 && (
                    <span className="text-red-400 text-xs font-bold flex items-center bg-red-950/50 px-3 py-1.5 rounded-full border border-red-800">
                      🚩 Flagged
                    </span>
                  )}
                </div>

                <span className="font-bold text-blue-300 bg-blue-950/50 px-3 py-1.5 rounded-lg border border-blue-900/50">
                  ⭐ Score: {post.ai_score}
                </span>
              </div>

              {/* UPVOTE */}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const res = await upvotePost(post.id);
                  if (!res.success) {
                    alert("Already voted");
                    return;
                  }
                  setVotedPosts((prev) => [...prev, post.id]);
                  fetchPosts();
                }}
                disabled={votedPosts.includes(post.id)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700/50 hover:bg-slate-600/80 border border-slate-600/50 text-md font-bold text-gray-200 rounded-xl transition duration-200 shadow-sm"
              >
                👍 Upvotes: {post.votes || 0}
              </button>
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
              placeholder="What unique opportunity are you sharing today?"
            />

            {/* ANALYZE BUTTON */}
            <button
              onClick={handleAnalyze}
              className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-blue-300 font-bold px-4 py-2 rounded-xl transition-colors border border-slate-600"
            >
              Analyze with AI ✨
            </button>

            {/* AI RESULT */}
            {aiResult && (
              <div className="mt-4 p-4 bg-slate-800 border border-slate-600 rounded-xl text-sm text-gray-300 shadow-inner">
                <p className="mb-1"><b className="text-white">Label:</b> {aiResult.label}</p>
                <p className="mb-3"><b className="text-white">Trust Score:</b> {aiResult.score}</p>

                {aiResult.reasons?.map((r, i) => (
                  <p key={i} className="text-gray-400">• {r}</p>
                ))}
              </div>
            )}

            {/* WARNING */}
            {(aiResult?.label === "SCAM" || aiResult?.label === "SUSPICIOUS") && (
              <div className="mt-4 p-4 bg-red-950/30 border border-red-800 rounded-xl">
                <p className="text-red-400 text-sm font-bold flex items-center gap-2">
                  🚨 This post seems risky. Proof is required.
                </p>
                {proofRequired && (
                  <div className="mt-3">
                    <textarea
                      className="w-full bg-slate-900 border-2 border-red-800 p-3 rounded-xl focus:ring-red-500 text-sm text-gray-200 outline-none"
                      rows={2}
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      placeholder="Paste official URL links or verification evidence..."
                    />
                    <p className="text-xs text-red-500 mt-2 font-bold tracking-widest uppercase">Attempts left: {2 - proofAttempts}</p>
                  </div>
                )}
              </div>
            )}

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
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                {loading ? "Posting..." : "Post Now"}
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

            <div className="mt-8 flex gap-4 items-center">
              <span className="font-bold text-blue-300 bg-blue-950/50 px-4 py-2 rounded-xl border border-blue-900/50">
                ⭐ AI Trust Score: {selectedPost.ai_score}
              </span>

              <span className={`px-4 py-2 text-white rounded-xl font-bold shadow-md uppercase tracking-wider
                      \${
                        selectedPost.ai_label === "SAFE"
                          ? "bg-gradient-to-r from-emerald-500 to-green-600"
                          : selectedPost.ai_label === "SUSPICIOUS"
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                          : "bg-gradient-to-r from-red-600 to-rose-700"
                      }
                    `}>
                Shield Status: {selectedPost.ai_label}
              </span>
            </div>

            {selectedPost.is_flagged === 1 && (
              <div className="mt-6 text-red-300 font-bold bg-red-950/50 p-4 border border-red-800/50 rounded-xl flex items-center gap-3">
                <span className="text-2xl">🚩</span>
                <p>This post has been flagged by the system due to failed proof or suspicious content.</p>
              </div>
            )}

            {/* AI GUIDANCE PER POST */}
            <PostAiGuidance postId={selectedPost.post_id || selectedPost.id} />

          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default ScolarList;