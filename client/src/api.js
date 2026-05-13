
const URL="http://localhost:3000/api";

// just for my information
//  post is used because we are sending data to store ing db
// we are using json.stringify to convert the data into string because fetch api(node) only accepts string data(json text) in json format
//json.stringify()=js object to json text
//json.parse()=json text to js object
//header is used to specify the type of data we are sending to the server

/*
🔹 API FILE RULES:
- ONLY communication with backend
- NO business logic here
- NO AI logic here
*/

export const registerUser = async (data) => {
  const res = await fetch(`${URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const logoutUser = async () => {
  const res = await fetch(`${URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  return res.json();
};

export const getUserData = async () => {
  const res = await fetch(`${URL}/auth/user`, {
    credentials: "include",
  });
  return res.json();
};

export const getPosts = async () => {
  const res = await fetch(`${URL}/posts/all`, {
    credentials: "include",
  });

  return res.json();
};

export const createPost = async (text) => {
  const res = await fetch(`${URL}/posts/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ text }),
  });

  return res.json();
};

/*
🔥 FIXED UPVOTE (IMPORTANT)
Better than /votes/:id because it's scalable
*/
export const upvotePost = async (postId) => {
  const res = await fetch(`${URL}/votes/upvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ postId }),
  });

  return res.json();
};

// 👎 DOWNVOTE POST
export const downvotePost = async (postId) => {
  const res = await fetch(`${URL}/votes/downvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ postId }),
  });

  return res.json();
};

// 💬 COMMENTS API
export const getPostComments = async (postId) => {
  const res = await fetch(`${URL}/comments/${postId}`, {
    credentials: "include",
  });
  return res.json();
};

export const createComment = async (postId, content) => {
  const res = await fetch(`${URL}/comments/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  return res.json();
};

export const deleteComment = async (commentId) => {
  const res = await fetch(`${URL}/comments/${commentId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return res.json();
};

export const createCommentReply = async (commentId, content) => {
  const res = await fetch(`${URL}/comments/${commentId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  return res.json();
};

// 🤖 ANALYZE POST SCAM BASED ON ENGAGEMENT
export const analyzePostScam = async (postId) => {
  const res = await fetch(`${URL}/posts/analyze/${postId}`, {
    credentials: "include",
  });
  return res.json();
};

/*
Optional: AI analyze (only if backend supports it)
*/
export const analyzeText = async (text) => {
  const res = await fetch(`${URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ text }),
  });

  return res.json();
};

export const getGuidanceChat = async (postId) => {
  const res = await fetch(`${URL}/guidance/${postId}`, {
    credentials: "include",
  });
  return res.json();
};

export const sendGuidanceMessage = async (postId, message) => {
  const res = await fetch(`${URL}/guidance/${postId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message }),
  });
  return res.json();
};

// --- DISCUSSION FORUM API ---

export const fetchDiscussions = async () => {
  const res = await fetch(`${URL}/discussions/all`, {
    credentials: "include",
  });
  return res.json();
};

export const createDiscussion = async (content, isAnonymous) => {
  const res = await fetch(`${URL}/discussions/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content, isAnonymous }),
  });
  return res.json();
};

export const fetchDiscussionComments = async (discussionId) => {
  const res = await fetch(`${URL}/discussions/comments/${discussionId}`, {
    credentials: "include",
  });
  return res.json();
};

export const createDiscussionComment = async (discussionId, content, isAnonymous) => {
  const res = await fetch(`${URL}/discussions/comments/${discussionId}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content, isAnonymous }),
  });
  return res.json();
};
