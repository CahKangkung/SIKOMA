export default function Header({ title, rightContent }) {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 relative">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-3">
        {rightContent ? (
          rightContent
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#23358B] text-white flex items-center justify-center font-bold">
            P
          </div>
        )}
      </div>
    </header>
  );
}
