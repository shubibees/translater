export default function TextEditor({ value, isHandle }) {
  return (
    <div className="text-area-container | w-full h-full">
      <textarea
        value={value}
        onChange={(e) => isHandle(e.target.value)}
        className="w-full h-full text-amber-50"
      ></textarea>
    </div>
  );
}
