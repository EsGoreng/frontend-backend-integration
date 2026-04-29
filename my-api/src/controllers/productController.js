import prisma from "../../lib/prisma.js";
import { sendSuccess, sendError } from "../helper/response.js";

export async function getAllProducts(req, res) {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });

    return sendSuccess(res, products, "Products retrieved successfully");
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getProductById(req, res) {
  try {
    const productId = Number(req.params.id);
    if (!productId || Number.isNaN(productId)) {
      return sendError(res, "Invalid product ID", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return sendError(res, "Product not found", 404);
    }

    return sendSuccess(res, product, "Product retrieved successfully");
  } catch (error) {
    return sendError(res, error);
  }
}

export async function createProduct(req, res) {
  try {
    const {
      name,
      slug,
      description,
      price,
      sku,
      stock = 0,
      isActive = true,
      categoryId,
    } = req.body;

    if (!name || !slug || price == null || !sku) {
      return sendError(res, "name, slug, price, and sku are required", 400);
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        sku,
        stock: Number(stock),
        isActive: Boolean(isActive),
        categoryId: categoryId ? Number(categoryId) : null,
      },
    });

    return sendSuccess(res, product, "Product created successfully", 201);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function updateProduct(req, res) {
  try {
    const productId = Number(req.params.id);
    if (!productId || Number.isNaN(productId)) {
      return sendError(res, "Invalid product ID", 400);
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return sendError(res, "Product not found", 404);
    }

    const { name, slug, description, price, sku, stock, isActive, categoryId } =
      req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = Number(price);
    if (sku !== undefined) data.sku = sku;
    if (stock !== undefined) data.stock = Number(stock);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (categoryId !== undefined)
      data.categoryId = categoryId ? Number(categoryId) : null;

    const product = await prisma.product.update({
      where: { id: productId },
      data,
    });

    return sendSuccess(res, product, "Product updated successfully");
  } catch (error) {
    return sendError(res, error);
  }
}

export async function deleteProduct(req, res) {
  try {
    const productId = Number(req.params.id);
    if (!productId || Number.isNaN(productId)) {
      return sendError(res, "Invalid product ID", 400);
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return sendError(res, "Product not found", 404);
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return sendSuccess(res, null, "Product deleted successfully");
  } catch (error) {
    return sendError(res, error);
  }
}
