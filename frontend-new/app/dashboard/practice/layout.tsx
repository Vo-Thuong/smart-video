export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  // Cancel out the p-10 from dashboard layout to make practice page full-screen
  return (
    <div className="-mx-10 -my-10 h-screen overflow-hidden">
      {children}
    </div>
  );
}
