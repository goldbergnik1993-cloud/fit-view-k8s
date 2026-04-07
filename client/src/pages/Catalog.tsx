import { mockClothingItems } from '../data/mockClothing';
import { useNavigate } from 'react-router-dom';

const Catalog = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Catalog</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['All', 'dress', 'pants', 't_shirt', 'skirt'].map(filter => (
          <button
            key={filter}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid #534AB7',
              background: filter === 'All' ? '#534AB7' : 'white',
              color: filter === 'All' ? 'white' : '#534AB7',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {mockClothingItems.map(item => (
          <div
            key={item.id}
            onClick={() => navigate(`/item/${item.id}`)}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '12px' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 4px' }}>{item.name}</p>
              <p style={{ color: '#666', fontSize: '13px', margin: '0 0 4px' }}>{item.brand}</p>
              <p style={{ color: '#534AB7', fontWeight: 'bold', margin: 0 }}>${item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;