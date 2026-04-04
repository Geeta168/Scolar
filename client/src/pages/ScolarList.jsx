import React, { useEffect, useState } from "react";
import { getPosts, createPost, upvotePost, analyzeText } from "../api";

const ScolarList = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [votedPosts, setVotedPosts] = useState([]);

  // MODAL STATES
  const [showModal, setShowModal] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

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
  };

  // CLOSE MODAL
  const closeModal = () => {
    setShowModal(false);
    setText("");
    setAiResult(null);
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

    // 🚨 SCAM RULE
    if (aiResult.label === "SCAM" || aiResult.score < 30) {
      alert("🚨 Scam detected! Please provide proof before posting.");
      return;
    }

    setLoading(true);

    const res = await createPost(text);

    if (res.success) {
      closeModal();
      fetchPosts();
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold">📋 Scolar Feed</h1>

        <button
          onClick={openModal}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          ➕ Post
        </button>
      </div>

      {/* POSTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="cursor-pointer bg-white border rounded-xl p-4 shadow-sm hover:shadow-lg"
          >
            <p className="text-sm text-gray-600">👤 {post.username}</p>

            <p className="mt-2 line-clamp-3">{post.content}</p>

            {/* AI TAG */}
            <div className="mt-3 flex justify-between text-sm">
              <span
                className={`px-2 py-1 text-white rounded text-xs
                  ${
                    post.ai_label === "SAFE"
                      ? "bg-green-500"
                      : post.ai_label === "SUSPICIOUS"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }
                `}
              >
                {post.ai_label}
              </span>

              <span>⭐ {post.ai_score}</span>
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
              className="mt-3 text-sm text-gray-600"
            >
              👍 {post.votes || 0}
            </button>
          </div>
        ))}
      </div>

      {/* POST MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

          <div className="bg-white w-[420px] p-5 rounded-xl">

            <h2 className="text-lg font-bold mb-2">
              Create Post
            </h2>

            <textarea
              className="w-full border p-2 rounded"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write scholarship post..."
            />

            {/* ANALYZE BUTTON */}
            <button
              onClick={handleAnalyze}
              className="mt-3 bg-blue-500 text-white px-3 py-1 rounded"
            >
              Analyze AI
            </button>

            {/* AI RESULT */}
            {aiResult && (
              <div className="mt-3 p-2 border rounded text-sm">
                <p><b>Label:</b> {aiResult.label}</p>
                <p><b>Score:</b> {aiResult.score}</p>

                {aiResult.reasons?.map((r, i) => (
                  <p key={i}>• {r}</p>
                ))}
              </div>
            )}

            {/* WARNING */}
            {aiResult?.label === "SCAM" && (
              <p className="text-red-500 text-sm mt-2">
                🚨 Scam detected — proof required before posting
              </p>
            )}

            {/* BUTTONS */}
            <div className="flex justify-end gap-2 mt-4">

              <button
                onClick={closeModal}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handlePost}
                disabled={loading}
                className="px-3 py-1 bg-black text-white rounded"
              >
                {loading ? "Posting..." : "Post"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* POST DETAILS POPUP */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center  ">

         <div className="bg-white p-6 rounded-xl w-[900px] h-[800px] overflow-y-auto relative border border-gray-300">

            <button
              onClick={() => setSelectedPost(null)}
              className="text-red-500 float-right"
            >
              ✖
            </button>

            <p className="font-bold">👤 {selectedPost.username}</p>

            <p className="mt-3">{selectedPost.content}</p>

            <p className="mt-3">
              <b>Score:</b> {selectedPost.ai_score}
            </p>

            <p>
              <b>Label:</b> {selectedPost.ai_label}
            </p>

          </div>
        </div>
      )}

    </div>
  );
};

export default ScolarList;