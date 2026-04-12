import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../hooks/useItems';

const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'All' },
  { label: 'Dress', value: 'dress' },
  { label: 'Pants', value: 'pants' },
  { label: 'T-Shirt', value: 't_shirt' },
  { label: 'Skirt', value: 'skirt' },
  { label: 'Blouse', value: 'blouse' },
  { label: 'Shirt', value: 'shirt' },
];

const Catalog = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);

  const { items, loading, error, totalPages } = useItems({
    category: activeFilter,
    page,
  });

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    setPage(1); // Reset to page 1 on filter change
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Catalog</h1>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleFilterChange(value)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid #534AB7',
              background: activeFilter === value ? '#534AB7' : 'white',
              color: activeFilter === value ? 'white' : '#534AB7',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Clear all */}
      {activeFilter !== 'All' && (
        <button
          onClick={() => handleFilterChange('All')}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid #cc0000',
            background: 'white',
            color: '#cc0000',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Clear all
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
          Loading...
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '16px',
            background: '#fff0f0',
            border: '1px solid #ffcccc',
            borderRadius: '8px',
            color: '#cc0000',
            marginBottom: '16px',
          }}
        >
          Error: {error}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <div
              style={{ textAlign: 'center', padding: '48px', color: '#999' }}
            >
              No items found
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/item/${item.id}`)}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      '0 4px 16px rgba(0,0,0,0.1)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = 'none')
                  }
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/400x500?text=No+Image';
                    }}
                  />
                  <div style={{ padding: '12px' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 4px' }}>
                      {item.name}
                    </p>
                    <p
                      style={{
                        color: '#666',
                        fontSize: '13px',
                        margin: '0 0 4px',
                      }}
                    >
                      {item.brand}
                    </p>
                    <p
                      style={{
                        color: '#534AB7',
                        fontWeight: 'bold',
                        margin: 0,
                      }}
                    >
                      ${item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '32px',
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #534AB7',
                  background: 'white',
                  color: '#534AB7',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.4 : 1,
                }}
              >
                ← Prev
              </button>
              <span style={{ padding: '8px 16px', color: '#666' }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #534AB7',
                  background: 'white',
                  color: '#534AB7',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.4 : 1,
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Catalog;
