export default function DashboardCard({ title, icon, children, className = '', style = {} }) {
  return (
    <div className={`glass-card fade-in ${className}`} style={style}>
      {(title || icon) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          {icon && <span style={{ fontSize: '1.3rem' }}>{icon}</span>}
          {title && <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
}
