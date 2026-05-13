import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { FavoritesProvider } from './providers/FavoritesProvider';
import { CartProvider } from './providers/CartProvider';
import { UserProfileProvider } from './providers/UserProfileProvider';
import Home from './pages/Home/Home';
import Catalog from './pages/Catalog/Catalog';
import Item from './pages/Item/Item';
import Saved from './pages/Saved/Saved';
import MyBag from './pages/MyBag/MyBag';
import Login from './pages/Auth/Login';
import Profile from './pages/Profile/Profile';
import BrandEmpty from './pages/BrandEmpty/BrandEmpty';
import PaymentSuccess from './pages/PaymentSuccess/PaymentSuccess';
import PaymentCanceled from './pages/PaymentCanceled/PaymentCanceled';

const App = () => (
  <AuthProvider>
    <UserProfileProvider>
      <FavoritesProvider>
        <CartProvider>
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
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-canceled" element={<PaymentCanceled />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </FavoritesProvider>
    </UserProfileProvider>
  </AuthProvider>
);

export default App;
