export default function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <h1 className="mb-6 text-4xl font-bold">flowmaster</h1>
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
    </div>
  );
}
