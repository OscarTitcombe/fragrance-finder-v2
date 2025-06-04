export default function Article({ params }: { params: { slug: string } }) {
  return (
    <main className="p-10">
      <article className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Article: {params.slug}</h1>
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-4">
            This is a placeholder article about fragrances. The actual content will be loaded based on the article slug: {params.slug}
          </p>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </article>
    </main>
  );
} 