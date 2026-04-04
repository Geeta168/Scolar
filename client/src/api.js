
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
