interface SilhouetteProps {
  linePositionPct: number;
  label: string;
}

const Silhouette = ({ linePositionPct, label }: SilhouetteProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: '80px', height: '200px', background: '#e0e0e0', borderRadius: '40px 40px 8px 8px' }}>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${linePositionPct}%`,
            background: '#6c63ff',
            borderRadius: '0 0 8px 8px',
            transition: 'height 0.3s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '90px',
            bottom: `${linePositionPct}%`,
            transform: 'translateY(50%)',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            color: '#333',
          }}
        >
          ← {label}
        </div>
      </div>
    </div>
  );
};

export default Silhouette;