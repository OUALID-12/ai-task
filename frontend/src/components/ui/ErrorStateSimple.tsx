interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ 
  message = "Une erreur est survenue", 
  onRetry 
}: ErrorStateProps) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px'
      }}>❌</div>
      <h3 style={{ 
        color: '#dc2626', 
        marginBottom: '16px',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        {message}
      </h3>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Réessayer
        </button>
      )}
    </div>
  );
};

export default ErrorState;
