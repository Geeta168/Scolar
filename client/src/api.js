const URL="http://Localhost:3000/api";

// just for my information
//  post is used because we are sending data to store ing db
// we are using json.stringify to convert the data into string because fetch api(node) only accepts string data(json text) in json format
//json.stringify()=js object to json text
//json.parse()=json text to js object
//header is used to specify the type of data we are sending to the server

export const regiserUser=async(data)=>{
    return await fetch(`${URL}/auth/register`,{
        method:"post",
        headers:{
            "content-type":'application/json'
        },
        body:JSON.stringify(data),
    });
}

export const loginUser=async(data)=>{
    return await fetch(`${URL}/auth/login`,{
        method:"post",
        headers:{
            "content-type":'application/json'
        },
        credentials:"include",
        body:JSON.stringify(data),
    });
}

export const logoutUser = async () => {
  return await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
};



