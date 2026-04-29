interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  isActive: boolean;
  categoryId: number;
  createdAt: string; // Gunakan string karena formatnya ISO Date dari JSON
  updatedAt: string;
  category: Category;
}

export default async function Home() {
  const response = await fetch("http://localhost:5000/api/products");
  const result = await response.json();

  return (
    <section>
      <h1>All Product ({result.data.products.length})</h1>
      {result.data.products.map((product: Product) => (
        <div key={product.id}>
          <h2 className="font-bold">{product.name}</h2>
          <p>{product.description}</p>
        </div>
      ))}
    </section>
  );
}
