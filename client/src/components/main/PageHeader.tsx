interface PageHeaderProps {
  title: string;
  subtitle?: string;
  bgImage?: string;
}

export default function PageHeader({ title, subtitle, bgImage = "/images/header_bg_01.jpg" }: PageHeaderProps) {
  return (
    <div
      className="relative bg-cover bg-center py-16 md:py-24 text-white text-center overflow-hidden"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">{title}</h1>
        {subtitle && <p className="mt-3 text-sm md:text-base text-gray-200 max-w-xl mx-auto drop-shadow-xs">{subtitle}</p>}
      </div>
    </div>
  );
}
