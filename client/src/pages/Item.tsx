import { useState } from 'react';
import Silhouette from '../components/Silhouette';
import { mockClothingItems } from '../data/mockClothing';

const Item = () => {
  const [height, setHeight] = useState(165);
  const item = mockClothingItems[0];
  const size = item.sizes[0];

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>{item.name}</h1>
      <p>{item.brand}</p>
      <p>Length: {size.totalLengthCm}cm</p>

      <div style={{ margin: '24px 0' }}>
        <label>
          Your height: {height}cm
          <input
            type="range"
            min={150}
            max={200}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            style={{ display: 'block', width: '200px', marginTop: '8px' }}
          />
        </label>
      </div>

      <Silhouette userHeight={height} itemLengthCm={size.totalLengthCm} />
    </div>
  );
};

export default Item;