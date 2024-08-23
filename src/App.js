import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Board from "./components/Board";


function App() {
  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route exact path="/" element={<Board/>} />
      </Routes>
    </>
  );
}

export default App;
