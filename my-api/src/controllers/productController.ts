import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { sendSuccess, sendError } from "../helper/response";

export async function getAllProducts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { search, categoryId, isActive, skip = 0, take = 10 } = req.query;

    // Build filter conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId as string);
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: parseInt(skip as string),
        take: parseInt(take as string),
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    sendSuccess(res, {
      products,
      pagination: {
        total,
        skip: parseInt(skip as string),
        take: parseInt(take as string),
        totalPages: Math.ceil(total / parseInt(take as string)),
      },
    });
  } catch (error: any) {
    sendError(res, error, 500);
  }
}

/**
 * Get product by ID
 */
export async function getProductById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || isNaN(Number(id))) {
      sendError(res, "Invalid product ID", 400);
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product) {
      sendError(res, "Product not found", 404);
      return;
    }

    sendSuccess(res, product);
  } catch (error: any) {
    sendError(res, error, 500);
  }
}

/**
 * Create new product
 * Required fields: name, price, sku
 * Optional fields: description, slug, stock, isActive, categoryId
 */
export async function createProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name, description, price, sku, stock, isActive, categoryId } =
      req.body;

    // Validation
    if (!name || !name.trim()) {
      sendError(res, "Product name is required", 400);
      return;
    }

    if (price === undefined || price === null) {
      sendError(res, "Product price is required", 400);
      return;
    }

    if (price < 0) {
      sendError(res, "Product price cannot be negative", 400);
      return;
    }

    if (!sku || !sku.trim()) {
      sendError(res, "Product SKU is required", 400);
      return;
    }

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: sku.trim() },
    });

    if (existingSku) {
      sendError(res, "Product SKU already exists", 409);
      return;
    }

    // Check if category exists (if provided)
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });

      if (!category) {
        sendError(res, "Category not found", 404);
        return;
      }
    }

    // Generate slug if not provided
    let slug = req.body.slug;
    if (!slug) {
      slug = name.toLowerCase().replace(/\s+/g, "-");
    }

    // Check if slug already exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      sendError(res, "Product slug already exists", 409);
      return;
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        sku: sku.trim(),
        slug,
        stock: stock || 0,
        isActive: isActive !== false,
        categoryId: categoryId ? parseInt(categoryId) : null,
      },
      include: { category: true },
    });

    sendSuccess(res, product, "Product created successfully", 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      sendError(
        res,
        `Product with this ${error.meta.target[0]} already exists`,
        409
      );
      return;
    }
    sendError(res, error, 500);
  }
}

/**
 * Update product
 * Can update: name, description, price, sku, stock, isActive, categoryId, slug
 */
export async function updateProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || isNaN(Number(id))) {
      sendError(res, "Invalid product ID", 400);
      return;
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      sendError(res, "Product not found", 404);
      return;
    }

    const { name, description, price, sku, stock, isActive, categoryId, slug } =
      req.body;

    const updateData: any = {};

    if (name !== undefined) {
      if (!name.trim()) {
        sendError(res, "Product name cannot be empty", 400);
        return;
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (price !== undefined) {
      if (price < 0) {
        sendError(res, "Product price cannot be negative", 400);
        return;
      }
      updateData.price = parseFloat(price);
    }

    if (sku !== undefined) {
      if (!sku.trim()) {
        sendError(res, "Product SKU cannot be empty", 400);
        return;
      }

      // Check if new SKU is not already used by another product
      if (sku !== existingProduct.sku) {
        const existingSku = await prisma.product.findUnique({
          where: { sku: sku.trim() },
        });

        if (existingSku) {
          sendError(res, "Product SKU already exists", 409);
          return;
        }
      }

      updateData.sku = sku.trim();
    }

    if (slug !== undefined) {
      if (!slug.trim()) {
        sendError(res, "Product slug cannot be empty", 400);
        return;
      }

      // Check if new slug is not already used by another product
      if (slug !== existingProduct.slug) {
        const existingSlug = await prisma.product.findUnique({
          where: { slug },
        });

        if (existingSlug) {
          sendError(res, "Product slug already exists", 409);
          return;
        }
      }

      updateData.slug = slug.trim();
    }

    if (stock !== undefined) {
      if (stock < 0) {
        sendError(res, "Product stock cannot be negative", 400);
        return;
      }
      updateData.stock = parseInt(stock);
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (categoryId !== undefined) {
      if (categoryId !== null) {
        const category = await prisma.category.findUnique({
          where: { id: parseInt(categoryId) },
        });

        if (!category) {
          sendError(res, "Category not found", 404);
          return;
        }
      }
      updateData.categoryId = categoryId ? parseInt(categoryId) : null;
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { category: true },
    });

    sendSuccess(res, product, "Product updated successfully");
  } catch (error: any) {
    if (error.code === "P2002") {
      sendError(
        res,
        `Product with this ${error.meta.target[0]} already exists`,
        409
      );
      return;
    }
    sendError(res, error, 500);
  }
}

/**
 * Delete product
 */
export async function deleteProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id || isNaN(Number(id))) {
      sendError(res, "Invalid product ID", 400);
      return;
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      sendError(res, "Product not found", 404);
      return;
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    sendSuccess(res, null, "Product deleted successfully");
  } catch (error: any) {
    sendError(res, error, 500);
  }
}
