interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard = ({ title, value, icon, trend }: MetricCardProps) => {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      border: '1px solid #e5e5e5',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#64748b', 
            marginBottom: '4px',
            margin: 0
          }}>
            {title}
          </p>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            {value.toLocaleString()}
          </div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: trend.isPositive ? '#22c55e' : '#ef4444'
              }}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span style={{
                fontSize: '12px',
                color: '#64748b',
                marginLeft: '4px'
              }}>
                vs période précédente
              </span>
            </div>
          )}
        </div>
        <div style={{
          marginLeft: '16px',
          padding: '12px',
          backgroundColor: '#fef2f2',
          borderRadius: '50%',
          fontSize: '24px'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
