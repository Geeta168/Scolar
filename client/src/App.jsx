import { useState } from 'react'
import Login from './Login'

import './App.css'

function App() {
  

  return (
    <>
     <div>
         <Login/> 
     </div>
    </>
  )
}

export default App


// import { useState, useRef } from "react";

// function App() {
//   const [count, setCount] = useState(0);
//   const refCount = useRef(0);

//   const increaseState = () => {
//     setCount(count + 1);
//   };

//   const increaseRef = () => {
//     refCount.current += 1;
//     console.log("Ref count:", refCount.current);
//   };

//   return (
//     <div>
//       <h1>State Count: {count}</h1>

//       <button onClick={increaseState}>Increase State</button>
//       <button onClick={increaseRef}>Increase Ref</button>
//       <h1>Ref Count: {refCount.current}</h1>
//     </div>
//   );
// }

// export default App;
