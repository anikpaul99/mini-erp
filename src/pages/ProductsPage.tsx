/* ============================================================
 * Screen - Product Management
 * ============================================================ */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Eye,
  ImageUp,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import {
  createProduct,
  getAllProducts,
  toggleDeleteProduct,
  updateProduct,
  type ApiProduct,
  type ProductFormPayload,
} from "@/api/products";
import { APP_CONFIG } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";

const PAGE_SIZES = APP_CONFIG.pagination.limitOptions;

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";
type StatusFilter = "active" | "deleted" | "all";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getStockStatus(product: ApiProduct): Exclude<StockFilter, "all"> {
  if (product.inStock === 0) return "out_of_stock";
  if (product.inStock < 5) return "low_stock";
  return "in_stock";
}

function getStockLabel(status: Exclude<StockFilter, "all">) {
  if (status === "out_of_stock") return "Out of Stock";
  if (status === "low_stock") return "Low Stock";
  return "In Stock";
}

function getStockBadgeClass(status: Exclude<StockFilter, "all">) {
  if (status === "out_of_stock") return "erp-badge--danger";
  if (status === "low_stock") return "erp-badge--warning";
  return "erp-badge--success";
}

function normalizeImageUrl(url?: string) {
  const value = url?.trim();
  if (!value) return "";
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("http://")) return value.replace("http://", "https://");
  if (value.startsWith("https://") || value.startsWith("blob:")) return value;
  if (value.startsWith("res.cloudinary.com/")) return `https://${value}`;
  return value;
}

function getProductImageUrl(product?: Pick<ApiProduct, "productImg" | "img">) {
  return normalizeImageUrl(product?.productImg || product?.img);
}

export default function ProductsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const canEdit = user?.role === "Admin" || user?.role === "Manager";

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<keyof ApiProduct>("productName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ApiProduct | null>(null);
  const [detailProduct, setDetailProduct] = useState<ApiProduct | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product-analytics"] }),
      ]);
      addToast("success", "Product created successfully.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product-analytics"] }),
      ]);
      addToast("success", "Product updated successfully.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: toggleDeleteProduct,
    onSuccess: async (product) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product-analytics"] }),
      ]);
      addToast(
        "success",
        product.isDeleted ? "Product deleted." : "Product restored."
      );
    },
  });

  const products = productsQuery.data || [];
  const activeProducts = products.filter((product) => !product.isDeleted);
  const deletedProducts = products.filter((product) => product.isDeleted);
  const lowStockProducts = activeProducts.filter(
    (product) => getStockStatus(product) !== "in_stock"
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesSearch = query
        ? product.productName.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query)
        : true;
      const matchesStock =
        stockFilter === "all" || getStockStatus(product) === stockFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !product.isDeleted) ||
        (statusFilter === "deleted" && product.isDeleted);

      return matchesSearch && matchesStock && matchesStatus;
    });

    return result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      let comparison = 0;

      if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDir === "asc" ? comparison : -comparison;
    });
  }, [products, search, sortDir, sortField, statusFilter, stockFilter]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const loading = productsQuery.isLoading;
  const hasError = productsQuery.isError;
  const errorMessage =
    productsQuery.error?.message || "Unable to load product records.";

  const handleSort = (field: keyof ApiProduct) => {
    if (sortField === field) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleAddProduct = async (payload: ProductFormPayload) => {
    await createMutation.mutateAsync(payload);
    setAddModalOpen(false);
  };

  const handleEditProduct = async (payload: ProductFormPayload) => {
    if (!editProduct) return;
    await updateMutation.mutateAsync({ id: editProduct._id, payload });
    setEditProduct(null);
  };

  const handleToggleDelete = async () => {
    if (!deleteProduct) return;
    await deleteMutation.mutateAsync(deleteProduct._id);
    setDeleteProduct(null);
  };

  if (loading) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-skeleton erp-skeleton--heading" />
          <div className="erp-skeleton erp-skeleton--btn" />
        </div>
        <div className="erp-card">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="erp-skeleton erp-skeleton--row" />
          ))}
        </div>
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <div className="erp-page-header">
          <div className="erp-page-header__left">
            <h1 className="text-display">Products</h1>
            <p className="erp-page-header__subtitle">
              Manage inventory, pricing, stock, and product images.
            </p>
          </div>
        </div>
        <div className="erp-card">
          <EmptyState
            icon={AlertCircle}
            headline="Could not load products"
            body={errorMessage}
            action={
              <button
                className="erp-btn erp-btn--md erp-btn--outline"
                onClick={() => productsQuery.refetch()}
              >
                <RefreshCcw className="erp-btn__icon" />
                Try Again
              </button>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left">
          <h1 className="text-display">Products</h1>
          <p className="erp-page-header__subtitle">
            Manage product catalog records, images, pricing, and stock levels.
          </p>
        </div>
        {canEdit && (
          <button
            className="erp-btn erp-btn--md erp-btn--primary"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus className="erp-btn__icon" />
            Add Product
          </button>
        )}
      </div>

      <div className="erp-product-overview">
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Active Products</span>
          <span className="erp-role-stat__value">{activeProducts.length}</span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Low / Out Stock</span>
          <span className="erp-role-stat__value">{lowStockProducts.length}</span>
        </div>
        <div className="erp-role-stat">
          <span className="erp-role-stat__label">Deleted Products</span>
          <span className="erp-role-stat__value">{deletedProducts.length}</span>
        </div>
      </div>

      <section className="erp-product-panel">
        <div className="erp-role-toolbar">
          <div className="erp-input-wrapper erp-role-toolbar__search">
            <Search className="erp-input-wrapper__icon-left" />
            <input
              className="erp-input erp-role-search-input"
              type="text"
              placeholder="Search products or SKU..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="erp-select erp-product-filter"
            value={stockFilter}
            onChange={(event) => {
              setStockFilter(event.target.value as StockFilter);
              setPage(1);
            }}
          >
            <option value="all">All stock</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
          <select
            className="erp-select erp-product-filter"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter);
              setPage(1);
            }}
          >
            <option value="active">Active</option>
            <option value="deleted">Deleted</option>
            <option value="all">All status</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="erp-role-empty">
            <EmptyState
              icon={Package}
              headline="No products found"
              body="Adjust filters or create a product with image, SKU, price, and stock."
              action={
                canEdit ? (
                  <button
                    className="erp-btn erp-btn--md erp-btn--primary"
                    onClick={() => setAddModalOpen(true)}
                  >
                    <Plus className="erp-btn__icon" />
                    Add Product
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="erp-table-container erp-table-container--responsive">
            <table className="erp-table">
              <thead className="erp-table__head">
                <tr className="erp-table__header-row">
                  <th className="erp-table__th">Product</th>
                  <th
                    className="erp-table__th erp-table__th--sortable"
                    onClick={() => handleSort("sku")}
                  >
                    SKU
                  </th>
                  <th
                    className="erp-table__th erp-table__th--right erp-table__th--sortable"
                    onClick={() => handleSort("actualPrice")}
                  >
                    Actual
                  </th>
                  <th
                    className="erp-table__th erp-table__th--right erp-table__th--sortable"
                    onClick={() => handleSort("sellingPrice")}
                  >
                    Selling
                  </th>
                  <th
                    className="erp-table__th erp-table__th--right erp-table__th--sortable"
                    onClick={() => handleSort("inStock")}
                  >
                    Stock
                  </th>
                  <th className="erp-table__th">Status</th>
                  <th className="erp-table__th erp-table__th--right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="erp-table__body">
                {paginated.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const badgeClass = getStockBadgeClass(stockStatus);

                  return (
                    <tr
                      key={product._id}
                      className={`erp-table__row${
                        stockStatus !== "in_stock"
                          ? " erp-table__row--low-stock"
                          : ""
                      }`}
                    >
                      <td className="erp-table__td">
                        <div className="erp-product-cell">
                          <ProductImage
                            product={product}
                            className="erp-product-cell__image"
                          />
                          <div className="erp-product-cell__body">
                            <span className="erp-product-cell__name">
                              {product.productName}
                            </span>
                            <span className="erp-product-cell__meta">
                              Updated {formatDate(product.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="erp-table__td">
                        <span className="numeral">{product.sku}</span>
                      </td>
                      <td className="erp-table__td erp-table__td--numeric">
                        {formatCurrency(product.actualPrice)}
                      </td>
                      <td className="erp-table__td erp-table__td--numeric">
                        {formatCurrency(product.sellingPrice)}
                      </td>
                      <td className="erp-table__td erp-table__td--numeric">
                        {product.inStock}
                      </td>
                      <td className="erp-table__td">
                        <div className="erp-row erp-row--gap-8">
                          <span className={`erp-badge ${badgeClass}`}>
                            {stockStatus !== "in_stock" && (
                              <AlertTriangle className="erp-badge__icon" />
                            )}
                            {getStockLabel(stockStatus)}
                          </span>
                          {product.isDeleted && (
                            <span className="erp-badge erp-badge--danger">
                              Deleted
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="erp-table__td erp-table__td--actions">
                        <div className="erp-table__actions">
                          <button
                            className="erp-table__action-btn"
                            onClick={() => setDetailProduct(product)}
                            aria-label={`View ${product.productName}`}
                          >
                            <Eye className="erp-table__action-btn-icon" />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                className="erp-table__action-btn"
                                onClick={() => setEditProduct(product)}
                                aria-label={`Edit ${product.productName}`}
                              >
                                <Pencil className="erp-table__action-btn-icon" />
                              </button>
                              <button
                                className="erp-table__action-btn erp-table__action-btn--danger"
                                onClick={() => setDeleteProduct(product)}
                                aria-label={
                                  product.isDeleted
                                    ? `Restore ${product.productName}`
                                    : `Delete ${product.productName}`
                                }
                              >
                                <Trash2 className="erp-table__action-btn-icon" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="erp-mobile-cards">
              {paginated.map((product) => {
                const stockStatus = getStockStatus(product);
                const badgeClass = getStockBadgeClass(stockStatus);

                return (
                  <div
                    key={product._id}
                    className={`erp-mobile-card${
                      stockStatus !== "in_stock"
                        ? " erp-mobile-card--low-stock"
                        : ""
                    }`}
                  >
                    <div className="erp-mobile-card__header">
                      <span className="erp-mobile-card__title">
                        {product.productName}
                      </span>
                      <span className={`erp-badge ${badgeClass}`}>
                        {getStockLabel(stockStatus)}
                      </span>
                    </div>
                    <div className="erp-mobile-card__row">
                      <span className="erp-mobile-card__label">SKU</span>
                      <span className="erp-mobile-card__value">
                        {product.sku}
                      </span>
                    </div>
                    <div className="erp-mobile-card__row">
                      <span className="erp-mobile-card__label">Price</span>
                      <span className="erp-mobile-card__value">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                    </div>
                    <div className="erp-role-mobile-actions">
                      <button
                        className="erp-btn erp-btn--sm erp-btn--outline"
                        onClick={() => setDetailProduct(product)}
                      >
                        <Eye className="erp-btn__icon" />
                        View
                      </button>
                      {canEdit && (
                        <button
                          className="erp-btn erp-btn--sm erp-btn--outline"
                          onClick={() => setEditProduct(product)}
                        >
                          <Pencil className="erp-btn__icon" />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="erp-pagination">
              <div className="erp-pagination__info">
                <select
                  className="erp-select erp-select--sm"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
                <span className="erp-pagination__text">
                  {totalItems} products
                </span>
              </div>
              <div className="erp-pagination__controls">
                <button
                  className="erp-pagination__btn erp-pagination__btn--nav"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  &lt;
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map(
                  (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        className={`erp-pagination__btn${
                          pageNumber === page
                            ? " erp-pagination__btn--active"
                            : ""
                        }`}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                )}
                <button
                  className="erp-pagination__btn erp-pagination__btn--nav"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <ProductFormModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddProduct}
        title="Add Product"
        submitLabel="Create Product"
        loading={createMutation.isPending}
        requireImage
      />

      {editProduct && (
        <ProductFormModal
          isOpen={!!editProduct}
          onClose={() => setEditProduct(null)}
          onSubmit={handleEditProduct}
          title="Edit Product"
          submitLabel="Save Changes"
          loading={updateMutation.isPending}
          initialData={editProduct}
        />
      )}

      {deleteProduct && (
        <ConfirmDialog
          isOpen={!!deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onConfirm={handleToggleDelete}
          title={`${deleteProduct.isDeleted ? "Restore" : "Delete"} ${
            deleteProduct.productName
          }?`}
          body={
            deleteProduct.isDeleted
              ? "This product will return to active inventory lists."
              : "This toggles the product into a deleted state while preserving history."
          }
          confirmLabel={deleteProduct.isDeleted ? "Restore" : "Delete"}
          variant={deleteProduct.isDeleted ? "neutral" : "danger"}
        />
      )}

      {detailProduct && (
        <Drawer
          isOpen={!!detailProduct}
          onClose={() => setDetailProduct(null)}
          title="Product Detail"
          footer={
            canEdit ? (
              <>
                <button
                  className="erp-btn erp-btn--md erp-btn--outline"
                  onClick={() => {
                    setDetailProduct(null);
                    setEditProduct(detailProduct);
                  }}
                >
                  Edit
                </button>
                <button
                  className="erp-btn erp-btn--md erp-btn--ghost erp-text-danger"
                  onClick={() => {
                    setDetailProduct(null);
                    setDeleteProduct(detailProduct);
                  }}
                >
                  {detailProduct.isDeleted ? "Restore" : "Delete"}
                </button>
              </>
            ) : undefined
          }
        >
          <ProductDetail product={detailProduct} />
        </Drawer>
      )}
    </>
  );
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ProductFormPayload) => Promise<void>;
  title: string;
  submitLabel: string;
  loading: boolean;
  initialData?: ApiProduct;
  requireImage?: boolean;
}

function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  loading,
  initialData,
  requireImage = false,
}: ProductFormModalProps) {
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [actualPrice, setActualPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [inStock, setInStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imagePreviewIsLocal, setImagePreviewIsLocal] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setProductName(initialData?.productName || "");
    setSku(initialData?.sku || "");
    setActualPrice(initialData?.actualPrice?.toString() || "");
    setSellingPrice(initialData?.sellingPrice?.toString() || "");
    setInStock(initialData?.inStock?.toString() || "");
    setImageFile(null);
    setImagePreview(getProductImageUrl(initialData));
    setImagePreviewIsLocal(false);
    setImageFailed(false);
    setError("");
  }, [initialData, isOpen]);

  useEffect(() => {
    return () => {
      if (imagePreviewIsLocal && imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, imagePreviewIsLocal]);

  const handleFileChange = (file: File | null) => {
    if (imagePreviewIsLocal && imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setImagePreviewIsLocal(true);
      setImageFailed(false);
      setError("");
    } else {
      setImagePreview(getProductImageUrl(initialData));
      setImagePreviewIsLocal(false);
      setImageFailed(false);
    }
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!productName.trim() || !sku.trim()) {
      setError("Product name and SKU are required.");
      return;
    }

    if (requireImage && !imageFile) {
      setError("Product image is required for new products.");
      return;
    }

    if (
      !actualPrice ||
      Number(actualPrice) <= 0 ||
      !sellingPrice ||
      Number(sellingPrice) <= 0
    ) {
      setError("Actual price and selling price must be greater than 0.");
      return;
    }

    if (inStock === "" || Number(inStock) < 0) {
      setError("Stock must be 0 or more.");
      return;
    }

    try {
      await onSubmit({
        productName: productName.trim(),
        sku: sku.trim(),
        actualPrice: Number(actualPrice),
        sellingPrice: Number(sellingPrice),
        inStock: Number(inStock),
        img: imageFile,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product.");
    }
  };

  const margin =
    actualPrice && sellingPrice
      ? Number(sellingPrice) - Number(actualPrice)
      : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="wide"
      footer={
        <>
          <button
            className="erp-btn erp-btn--md erp-btn--outline"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            Cancel
          </button>
          <button
            className="erp-btn erp-btn--md erp-btn--primary"
            onClick={() => handleSubmit()}
            disabled={loading}
            type="button"
          >
            {loading && <Loader2 className="erp-btn__spinner" />}
            {loading ? "Saving..." : submitLabel}
          </button>
        </>
      }
    >
      <form className="erp-product-form" onSubmit={handleSubmit}>
        <div className="erp-field">
          <label className="erp-field__label" htmlFor="product-image">
            Product Image
            {requireImage && <span className="erp-field__required">*</span>}
          </label>
          <label
            className={`erp-product-upload${
              imagePreview && !imageFailed
                ? " erp-product-upload--has-preview"
                : ""
            }`}
            htmlFor="product-image"
          >
            {imagePreview && !imageFailed ? (
              <img
                src={imagePreview}
                alt="Product preview"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <>
                <ImageUp className="erp-upload__dropzone-icon" />
                <span className="erp-upload__dropzone-text">
                  Upload product image
                </span>
                <span className="erp-upload__dropzone-hint">
                  PNG or JPG, used in catalog and dashboard tables
                </span>
              </>
            )}
          </label>
          <input
            id="product-image"
            className="erp-upload__hidden-input"
            type="file"
            accept="image/*"
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] || null)
            }
          />
        </div>

        <div className="erp-user-form__grid">
          <ProductTextField
            id="product-name"
            label="Product Name"
            value={productName}
            onChange={setProductName}
            placeholder="Dell Inspiron 15"
            required
          />
          <ProductTextField
            id="product-sku"
            label="SKU"
            value={sku}
            onChange={setSku}
            placeholder="DELL-1004"
            required
          />
          <ProductTextField
            id="product-actual-price"
            label="Actual Price"
            type="number"
            value={actualPrice}
            onChange={setActualPrice}
            placeholder="65000"
            required
          />
          <ProductTextField
            id="product-selling-price"
            label="Selling Price"
            type="number"
            value={sellingPrice}
            onChange={setSellingPrice}
            placeholder="70000"
            required
          />
          <ProductTextField
            id="product-stock"
            label="Stock"
            type="number"
            value={inStock}
            onChange={setInStock}
            placeholder="15"
            required
          />
          <div className="erp-product-margin">
            <span>Expected Margin</span>
            <strong className={margin < 0 ? "erp-text-danger" : ""}>
              {formatCurrency(margin)}
            </strong>
          </div>
        </div>

        {error && (
          <span className="erp-field__helper erp-field__helper--error">
            {error}
          </span>
        )}
      </form>
    </Modal>
  );
}

function ProductTextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="erp-field">
      <label className="erp-field__label" htmlFor={id}>
        {label}
        {required && <span className="erp-field__required">*</span>}
      </label>
      <input
        id={id}
        className={`erp-input${type === "number" ? " erp-input--numeric" : ""}`}
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ProductDetail({ product }: { product: ApiProduct }) {
  const stockStatus = getStockStatus(product);

  return (
    <>
      <div className="erp-product-detail__header">
        <ProductImage
          product={product}
          className="erp-product-detail__image"
        />
        <div className="erp-product-detail__info">
          <h3 className="text-h2">{product.productName}</h3>
          <span className="text-caption">{product.sku}</span>
        </div>
      </div>
      <div className="erp-detail-list">
        <div className="erp-detail-list__item">
          <span className="erp-detail-list__label">Actual Price</span>
          <span className="erp-detail-list__value erp-detail-list__value--numeric">
            {formatCurrency(product.actualPrice)}
          </span>
        </div>
        <div className="erp-detail-list__item">
          <span className="erp-detail-list__label">Selling Price</span>
          <span className="erp-detail-list__value erp-detail-list__value--numeric">
            {formatCurrency(product.sellingPrice)}
          </span>
        </div>
        <div className="erp-detail-list__item">
          <span className="erp-detail-list__label">Stock</span>
          <span className={`erp-badge ${getStockBadgeClass(stockStatus)}`}>
            {getStockLabel(stockStatus)} ({product.inStock})
          </span>
        </div>
        <div className="erp-detail-list__item">
          <span className="erp-detail-list__label">Status</span>
          <span
            className={`erp-badge ${
              product.isDeleted ? "erp-badge--danger" : "erp-badge--success"
            }`}
          >
            {product.isDeleted ? "Deleted" : "Active"}
          </span>
        </div>
        <div className="erp-detail-list__item">
          <span className="erp-detail-list__label">Created</span>
          <span className="erp-detail-list__value">
            {formatDate(product.createdAt)}
          </span>
        </div>
        <div className="erp-detail-list__item">
          <span className="erp-detail-list__label">Updated</span>
          <span className="erp-detail-list__value">
            {formatDate(product.updatedAt)}
          </span>
        </div>
      </div>
    </>
  );
}

function ProductImage({
  product,
  className,
}: {
  product: ApiProduct;
  className: string;
}) {
  const imageUrl = getProductImageUrl(product);
  const [failedUrl, setFailedUrl] = useState("");
  const canRender = imageUrl && imageUrl !== failedUrl;

  useEffect(() => {
    setFailedUrl("");
  }, [imageUrl]);

  return (
    <span className={className}>
      {canRender ? (
        <img
          src={imageUrl}
          alt={product.productName}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <Package />
      )}
    </span>
  );
}
