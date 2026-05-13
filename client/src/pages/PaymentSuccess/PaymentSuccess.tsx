import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import EmptyState from '../../shared/components/EmptyState/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import OrderSuccessIllustration from '../../assets/illustrations/order-success.png';
import styles from './PaymentPage.module.scss';

const PaymentSuccess = () => {
  const { user } = useAuth();
  return (
    <>
      <Header />
      <main className={styles.main}>
        <p className={styles['page-title']}>My Bag</p>
        <EmptyState
          title="Thanks for your order!"
          subtitle="A confirmation email has been sent to your inbox"
          buttonText="Track Order →"
          buttonPath={user ? '/profile' : '/login'}
          secondaryButtonText="Keep Shopping"
          secondaryButtonPath="/catalog"
          illustration={OrderSuccessIllustration}
          showRecommendations={true}
        />
      </main>
      <Footer />
    </>
  );
};

export default PaymentSuccess;