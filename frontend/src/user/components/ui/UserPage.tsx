type Props = {
  title?: string;
  children: React.ReactNode;
};

export default function UserPage({ title, children }: Props) {
  return (
    <div className="page">

      {title && (
        <div className="text-center mb-4">
          <h2 className="section-title">{title}</h2>
        </div>
      )}

      <div className="container">
        {children}
      </div>

    </div>
  );
}