import { useNavigate } from 'react-router-dom';
import { mockClothingItems } from '../data/mockClothing';

const Saved = () => {
  const navigate = useNavigate();
  const savedItems = mockClothingItems.slice(0, 2);

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Saved items ({savedItems.length})</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {savedItems.map(item => (
          <div
            key={item.id}
            onClick={() => navigate(`/item/${item.id}`)}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 4px' }}>{item.name}</p>
              <p style={{ color: '#666', fontSize: '13px', margin: '0 0 4px' }}>{item.brand}</p>
              <p style={{ color: '#534AB7', fontWeight: 'bold', margin: 0 }}>${item.price}</p>
            </div>
            <span style={{ color: '#D4537E', fontSize: '20px' }}>♥</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Saved;