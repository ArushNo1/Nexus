export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`#root-navbar { display: none !important; }`}</style>
      {children}
    </>
  );
}
