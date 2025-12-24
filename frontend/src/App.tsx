import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>Login</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/products" element={<div>Products</div>} />
          <Route path="/clients" element={<div>Clients</div>} />
          <Route path="/orders" element={<div>Orders</div>} />
          <Route path="/comments" element={<div>Comments</div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
