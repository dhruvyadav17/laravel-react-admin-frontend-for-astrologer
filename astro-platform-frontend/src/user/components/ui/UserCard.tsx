export default function UserCard({ children, className = "" }: any) {
  return (
    <div className={`app-card ${className}`}>
      {children}
    </div>
  );
}