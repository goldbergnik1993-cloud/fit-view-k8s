import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>FitView</h1>
      <p style={{ fontSize: '20px', color: '#534AB7', fontWeight: 'bold' }}>
        Know before you buy
      </p>
      <p style={{ color: '#666', lineHeight: '1.6', maxWidth: '500px' }}>
        Enter your height and see exactly where clothes will end on your body.
        No guessing, no returns.
      </p>

      <button
        onClick={() => navigate('/catalog')}
        style={{
          marginTop: '24px',
          padding: '12px 24px',
          background: '#534AB7',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Browse catalog →
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '48px' }}>
        {[
          { step: '1', title: 'Enter height', desc: 'Tell us how tall you are' },
          { step: '2', title: 'Browse catalog', desc: 'Find clothes you like' },
          { step: '3', title: 'See the fit', desc: 'See exactly where it ends' },
        ].map(({ step, title, desc }) => (
          <div key={step} style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#534AB7' }}>{step}</div>
            <p style={{ fontWeight: 'bold', margin: '8px 0 4px' }}>{title}</p>
            <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;