import { useState } from "react";
import "./App.css";
import { AllRoutes } from "./Components/AllRoutes";

console.log("API:", import.meta.env.VITE_API_BASE_URL);
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <AllRoutes />
    </>
  );
}


export default App;
