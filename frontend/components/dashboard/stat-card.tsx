interface StatCardProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export const StatCard = ({ title, subtitle, children }: StatCardProps) => {
  return (
    <div className="bg-white/90 rounded-2xl p-6 h-full flex flex-col">
      <h3 className="text-black font-bold text-xl mb-1">{title}</h3>
      <p className="text-gray-500 text-sm mb-6">{subtitle}</p>
      <div className="flex-1">{children}</div>
    </div>
  );
};
