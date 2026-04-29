"use client";

import { useEffect, useState } from "react";
import Loading from "./ui/loading";
import Errors from "./ui/error";

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
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:5000/api/products");

        if (!response.ok) {
          throw new Error(`HTTP Error : ${response.status}`);
        }

        const result = await response.json();
        setProducts(result.data.products);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return (
      <Errors
        error={{ message: error }}
        reset={() => window.location.reload()}
      />
    );
  }

  return (
    <section>
      <h1>All Product</h1>
      {products.map((product: Product) => (
        <div key={product.id}>
          <h2 className="font-bold">{product.name}</h2>
          <p>{product.description}</p>
        </div>
      ))}
    </section>
  );
}
