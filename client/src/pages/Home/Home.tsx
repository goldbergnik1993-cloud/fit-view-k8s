import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import { HeroSection } from './components/HeroSection/HeroSection';
import { ItemsSection } from './components/ItemsSection/ItemsSection';
import { PartnersSection } from './components/PartnersSection/PartnersSection';

const Home = () => (
  <>
    <Header />
    <main>
      <HeroSection />
      <ItemsSection />
      <PartnersSection />
    </main>
    <Footer />
  </>
);

export default Home;