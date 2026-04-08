import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Item from './pages/Item';
import Saved from './pages/Saved';
import Login from './pages/Login';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/item/:id" element={<Item />} />
          <Route path="/saved" element={<Saved />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;