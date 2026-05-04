import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { FavoritesProvider } from './providers/FavoritesProvider';
import { UserProfileProvider } from './providers/UserProfileProvider';
import Home from './pages/Home/Home';
import Catalog from './pages/Catalog/Catalog';
import Item from './pages/Item/Item';
import Saved from './pages/Saved/Saved';
import MyBag from './pages/MyBag/MyBag';
import Login from './pages/Auth/Login';
import Profile from './pages/Profile/Profile';
import BrandEmpty from './pages/BrandEmpty/BrandEmpty';

const App = () => (
  <AuthProvider>
    <UserProfileProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/item/:id" element={<Item />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/my-bag" element={<MyBag />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/brand/:slug" element={<BrandEmpty />} />
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </UserProfileProvider>
  </AuthProvider>
);

export default App;