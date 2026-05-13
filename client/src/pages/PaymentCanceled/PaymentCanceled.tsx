import { Header } from '../../shared/components/Header/Header';
import { Footer } from '../../shared/components/Footer/Footer';
import EmptyState from '../../shared/components/EmptyState/EmptyState';
import EmptyBagIllustration from '../../assets/illustrations/empty-bag.png';
import styles from '../PaymentSuccess/PaymentPage.module.scss';

const PaymentCanceled = () => (
  <>
    <Header />
    <main className={styles.main}>
      <p className={styles['page-title']}>My Bag</p>
      <EmptyState
        title="Payment was canceled"
        subtitle="Your order was not completed. You can try again or continue shopping."
        buttonText="Back to Bag"
        buttonPath="/my-bag"
        secondaryButtonText="Keep Shopping"
        secondaryButtonPath="/catalog"
        illustration={EmptyBagIllustration}
        showRecommendations={true}
      />
    </main>
    <Footer />
  </>
);

export default PaymentCanceled;