/* ============================================================
 * Screen — Products List (§5.4) + Add/Edit/Delete/Detail
 * ============================================================
 * Uses React Query mutations for CRUD, Redux for state.
 * ============================================================ */

import { useState, useMemo } from "react";
import {
  Plus, Search, Eye, Pencil, Trash2, Package,
  AlertTriangle, Loader2, ImageUp,
} from "lucide-react";
import { useAppSelector } from "@/redux/store";
import { selectProducts, selectProductsInitialized } from "@/redux/slices/productsSlice";
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/queries/useProductsQuery";
import { MOCK_CATEGORIES } from "@/mock/categories";
import { getStockStatus, getStockLabel } from "@/types/product";
import type { Product, Category } from "@/types/product";
import { APP_CONFIG } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";

const PAGE_SIZES = APP_CONFIG.pagination.limitOptions;

export default function ProductsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const canEdit = user?.role === "Admin" || user?.role === "Manager";

  // React Query for initialization + mutations
  const { isLoading: queryLoading } = useProducts();
  const addMutation = useAddProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  // Redux as source of truth
  const products = useAppSelector(selectProducts);
  const initialized = useAppSelector(selectProductsInitialized);
  const loading = queryLoading || !initialized;

  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (categoryFilter) result = result.filter((p) => p.category.id === categoryFilter);
    if (stockFilter) result = result.filter((p) => getStockStatus(p.stock) === stockFilter);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "sku": cmp = a.sku.localeCompare(b.sku); break;
        case "purchasePrice": cmp = a.purchasePrice - b.purchasePrice; break;
        case "sellingPrice": cmp = a.sellingPrice - b.sellingPrice; break;
        case "stock": cmp = a.stock - b.stock; break;
        default: cmp = a.name.localeCompare(b.name);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [products, search, categoryFilter, stockFilter, sortField, sortDir]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((p) => (p === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const formatCurrency = (v: number) => `${APP_CONFIG.currency}${v.toFixed(2)}`;
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const handleAddProduct = async (data: Partial<Product>) => {
    await addMutation.mutateAsync(data);
    setAddModalOpen(false);
    addToast("success", "Product added.");
  };

  const handleEditProduct = async (data: Partial<Product>) => {
    if (!editProduct) return;
    await updateMutation.mutateAsync({ ...editProduct, ...data, updatedAt: new Date().toISOString() });
    setEditProduct(null);
    addToast("success", "Changes saved.");
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    await deleteMutation.mutateAsync(deleteProduct.id);
    setDeleteProduct(null);
    addToast("success", "Product deleted.");
  };

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <>
        <div className="erp-page-header"><div className="erp-skeleton erp-skeleton--heading" /><div className="erp-skeleton erp-skeleton--btn" /></div>
        <div className="erp-card">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="erp-skeleton erp-skeleton--row" />))}</div>
      </>
    );
  }

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left"><h1 className="text-display">Products</h1></div>
        {canEdit && (<button className="erp-btn erp-btn--md erp-btn--primary" onClick={() => setAddModalOpen(true)}><Plus className="erp-btn__icon" />Add Product</button>)}
      </div>

      <div className="erp-filter-row">
        <div className="erp-input-wrapper"><Search className="erp-input-wrapper__icon-left" /><input className="erp-input" type="text" placeholder="Search by name or SKU…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} aria-label="Search products" /></div>
        <select className="erp-select erp-select--sm" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} aria-label="Filter by category"><option value="">All Categories</option>{categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select>
        <select className="erp-select erp-select--sm" value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }} aria-label="Filter by stock level"><option value="">All Stock Levels</option><option value="in_stock">In Stock</option><option value="low_stock">Low Stock</option><option value="out_of_stock">Out of Stock</option></select>
      </div>

      {filtered.length === 0 ? (
        <div className="erp-card">
          {search || categoryFilter || stockFilter ? (
            <EmptyState icon={Search} headline="No matches found" body="Try a different search term or clear your filters." action={<button className="erp-btn erp-btn--md erp-btn--outline" onClick={() => { setSearch(""); setCategoryFilter(""); setStockFilter(""); }}>Clear filters</button>} />
          ) : (
            <EmptyState icon={Package} headline="No products yet" body="Add your first product to start tracking inventory." action={canEdit ? (<button className="erp-btn erp-btn--md erp-btn--primary" onClick={() => setAddModalOpen(true)}><Plus className="erp-btn__icon" />Add Product</button>) : undefined} />
          )}
        </div>
      ) : (
        <div className="erp-table-container erp-table-container--responsive">
          <table className="erp-table">
            <thead className="erp-table__head">
              <tr className="erp-table__header-row">
                <th className="erp-table__th">Image</th>
                <th className="erp-table__th erp-table__th--sortable" onClick={() => handleSort("name")}><span className="erp-table__th-content">Name</span></th>
                <th className="erp-table__th erp-table__th--sortable" onClick={() => handleSort("sku")}><span className="erp-table__th-content">SKU</span></th>
                <th className="erp-table__th">Category</th>
                <th className="erp-table__th erp-table__th--right erp-table__th--sortable" onClick={() => handleSort("purchasePrice")}><span className="erp-table__th-content">Purchase</span></th>
                <th className="erp-table__th erp-table__th--right erp-table__th--sortable" onClick={() => handleSort("sellingPrice")}><span className="erp-table__th-content">Selling</span></th>
                <th className="erp-table__th erp-table__th--right erp-table__th--sortable" onClick={() => handleSort("stock")}><span className="erp-table__th-content">Stock</span></th>
                <th className="erp-table__th erp-table__th--right">Actions</th>
              </tr>
            </thead>
            <tbody className="erp-table__body">
              {paginated.map((product) => {
                const status = getStockStatus(product.stock);
                const stockLabel = getStockLabel(status);
                const badgeClass = status === "in_stock" ? "erp-badge--success" : status === "low_stock" ? "erp-badge--warning" : "erp-badge--danger";
                const rowClass = status === "low_stock" ? " erp-table__row--low-stock" : "";
                return (
                  <tr key={product.id} className={`erp-table__row${rowClass}`}>
                    <td className="erp-table__td"><div className="erp-table__thumbnail-fallback"><Package className="erp-table__thumbnail-fallback-icon" /></div></td>
                    <td className="erp-table__td">{product.name}</td>
                    <td className="erp-table__td erp-table__td--numeric">{product.sku}</td>
                    <td className="erp-table__td"><span className="erp-badge erp-badge--neutral">{product.category.name}</span></td>
                    <td className="erp-table__td erp-table__td--numeric">{formatCurrency(product.purchasePrice)}</td>
                    <td className="erp-table__td erp-table__td--numeric">{formatCurrency(product.sellingPrice)}</td>
                    <td className="erp-table__td erp-table__td--numeric">
                      <span className="erp-row erp-row--gap-8 erp-row--end">
                        <span>{product.stock}</span>
                        <span className={`erp-badge ${badgeClass}`}>{status === "low_stock" && <AlertTriangle className="erp-badge__icon" />}{stockLabel}</span>
                      </span>
                    </td>
                    <td className="erp-table__td erp-table__td--actions">
                      <div className="erp-table__actions">
                        <button className="erp-table__action-btn" onClick={() => setDetailProduct(product)} aria-label={`View ${product.name}`}><Eye className="erp-table__action-btn-icon" /></button>
                        {canEdit && (<><button className="erp-table__action-btn" onClick={() => setEditProduct(product)} aria-label={`Edit ${product.name}`}><Pencil className="erp-table__action-btn-icon" /></button><button className="erp-table__action-btn erp-table__action-btn--danger" onClick={() => setDeleteProduct(product)} aria-label={`Delete ${product.name}`}><Trash2 className="erp-table__action-btn-icon" /></button></>)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="erp-mobile-cards">
            {paginated.map((product) => {
              const status = getStockStatus(product.stock);
              const stockLabel = getStockLabel(status);
              const badgeClass = status === "in_stock" ? "erp-badge--success" : status === "low_stock" ? "erp-badge--warning" : "erp-badge--danger";
              return (
                <div key={product.id} className={`erp-mobile-card${status === "low_stock" ? " erp-mobile-card--low-stock" : ""}`}>
                  <div className="erp-mobile-card__header"><span className="erp-mobile-card__title">{product.name}</span><button className="erp-mobile-card__menu-btn" onClick={() => setDetailProduct(product)} aria-label={`View ${product.name}`}><Eye className="erp-table__action-btn-icon" /></button></div>
                  <div className="erp-mobile-card__row"><span className="erp-mobile-card__label">SKU</span><span className="erp-mobile-card__value erp-mobile-card__value--numeric">{product.sku}</span></div>
                  <div className="erp-mobile-card__row"><span className="erp-mobile-card__label">Price</span><span className="erp-mobile-card__value erp-mobile-card__value--numeric">{formatCurrency(product.sellingPrice)}</span></div>
                  <div className="erp-mobile-card__row"><span className="erp-mobile-card__label">Stock</span><span className={`erp-badge ${badgeClass}`}>{stockLabel} ({product.stock})</span></div>
                </div>
              );
            })}
          </div>

          <div className="erp-pagination">
            <div className="erp-pagination__info">
              <select className="erp-select erp-select--sm" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} aria-label="Rows per page">{PAGE_SIZES.map((size) => (<option key={size} value={size}>{size} / page</option>))}</select>
              <span className="erp-pagination__text">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}</span>
            </div>
            <div className="erp-pagination__controls">
              <button className="erp-pagination__btn erp-pagination__btn--nav" disabled={page === 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">‹</button>
              {getPageNumbers().map((p, i) => p === "..." ? (<span key={`e${i}`} className="erp-pagination__ellipsis">…</span>) : (<button key={p} className={`erp-pagination__btn${p === page ? " erp-pagination__btn--active" : ""}`} onClick={() => setPage(p as number)}>{p}</button>))}
              <button className="erp-pagination__btn erp-pagination__btn--nav" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">›</button>
            </div>
          </div>
        </div>
      )}

      <ProductFormModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={handleAddProduct} categories={categories} title="Add Product" submitLabel="Add Product" />
      {editProduct && (<ProductFormModal isOpen={!!editProduct} onClose={() => setEditProduct(null)} onSubmit={handleEditProduct} categories={categories} title="Edit Product" submitLabel="Save Changes" initialData={editProduct} />)}
      {deleteProduct && (<ConfirmDialog isOpen={!!deleteProduct} onClose={() => setDeleteProduct(null)} onConfirm={handleDeleteProduct} title={`Delete ${deleteProduct.name}?`} body="This can't be undone. The product's data will be permanently removed." confirmLabel="Delete" variant="danger" />)}
      {detailProduct && (
        <Drawer isOpen={!!detailProduct} onClose={() => setDetailProduct(null)} title="Product Detail" footer={canEdit ? (<><button className="erp-btn erp-btn--md erp-btn--outline" onClick={() => { setDetailProduct(null); setEditProduct(detailProduct); }}>Edit</button><button className="erp-btn erp-btn--md erp-btn--ghost erp-text-danger" onClick={() => { setDetailProduct(null); setDeleteProduct(detailProduct); }}>Delete</button></>) : undefined}>
          <div className="erp-product-detail__header"><div className="erp-table__thumbnail-fallback"><Package className="erp-table__thumbnail-fallback-icon" /></div><div className="erp-product-detail__info"><h3 className="text-h2">{detailProduct.name}</h3><span className="text-caption">{detailProduct.sku}</span></div></div>
          <div className="erp-detail-list">
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Category</span><span className="erp-badge erp-badge--neutral">{detailProduct.category.name}</span></div>
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Purchase Price</span><span className="erp-detail-list__value erp-detail-list__value--numeric">{formatCurrency(detailProduct.purchasePrice)}</span></div>
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Selling Price</span><span className="erp-detail-list__value erp-detail-list__value--numeric">{formatCurrency(detailProduct.sellingPrice)}</span></div>
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Stock</span><span className="erp-row erp-row--gap-8"><span className="erp-detail-list__value erp-detail-list__value--numeric">{detailProduct.stock}</span><span className={`erp-badge ${getStockStatus(detailProduct.stock) === "in_stock" ? "erp-badge--success" : getStockStatus(detailProduct.stock) === "low_stock" ? "erp-badge--warning" : "erp-badge--danger"}`}>{getStockLabel(getStockStatus(detailProduct.stock))}</span></span></div>
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Created</span><span className="erp-detail-list__value">{formatDate(detailProduct.createdAt)}</span></div>
            <div className="erp-detail-list__item"><span className="erp-detail-list__label">Last Updated</span><span className="erp-detail-list__value">{formatDate(detailProduct.updatedAt)}</span></div>
          </div>
        </Drawer>
      )}
    </>
  );
}

/* Product Form Modal */
interface ProductFormModalProps { isOpen: boolean; onClose: () => void; onSubmit: (data: Partial<Product>) => Promise<void>; categories: Category[]; title: string; submitLabel: string; initialData?: Product; }

function ProductFormModal({ isOpen, onClose, onSubmit, categories, title, submitLabel, initialData }: ProductFormModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [categoryId, setCategoryId] = useState(initialData?.category.id || categories[0]?.id || "");
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice?.toString() || "");
  const [sellingPrice, setSellingPrice] = useState(initialData?.sellingPrice?.toString() || "");
  const [stock, setStock] = useState(initialData?.stock?.toString() || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Product name is required.";
    if (!sku.trim()) e.sku = "SKU is required.";
    if (!purchasePrice || Number(purchasePrice) <= 0) e.purchasePrice = "Price must be greater than 0.";
    if (!sellingPrice || Number(sellingPrice) <= 0) e.sellingPrice = "Price must be greater than 0.";
    if (stock === "" || Number(stock) < 0) e.stock = "Stock must be 0 or more.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setFormLoading(true);
    try {
      await onSubmit({ name: name.trim(), sku: sku.trim(), category: categories.find((c) => c.id === categoryId) || categories[0], purchasePrice: Number(purchasePrice), sellingPrice: Number(sellingPrice), stock: Number(stock) });
    } finally { setFormLoading(false); }
  };

  const showPriceWarning = purchasePrice && sellingPrice && Number(sellingPrice) < Number(purchasePrice) && Number(sellingPrice) > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="wide" footer={<><button className="erp-btn erp-btn--md erp-btn--outline" onClick={onClose} disabled={formLoading}>Cancel</button><button className="erp-btn erp-btn--md erp-btn--primary" onClick={handleSubmit} disabled={formLoading}>{formLoading && <Loader2 className="erp-btn__spinner" />}{formLoading ? "Saving…" : submitLabel}</button></>}>
      <div className="erp-field"><label className="erp-field__label">Product Image</label><div className="erp-upload__dropzone"><ImageUp className="erp-upload__dropzone-icon" /><span className="erp-upload__dropzone-text">Drag an image here, or click to browse</span><span className="erp-upload__dropzone-hint">PNG or JPG, up to 5MB</span></div></div>
      <div className="erp-field"><label className="erp-field__label" htmlFor="product-name">Product Name<span className="erp-field__required">*</span></label><input id="product-name" className={`erp-input${errors.name ? " erp-input--error" : ""}`} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wireless Bluetooth Headphones" />{errors.name && <span className="erp-field__helper erp-field__helper--error">{errors.name}</span>}</div>
      <div className="erp-field"><label className="erp-field__label" htmlFor="product-sku">SKU<span className="erp-field__required">*</span></label><input id="product-sku" className={`erp-input erp-input--numeric${errors.sku ? " erp-input--error" : ""}`} type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. EL-WBH-001" /><span className="erp-field__helper">Must be unique.</span>{errors.sku && <span className="erp-field__helper erp-field__helper--error">{errors.sku}</span>}</div>
      <div className="erp-field"><label className="erp-field__label" htmlFor="product-category">Category</label><select id="product-category" className="erp-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>{categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></div>
      <div className="erp-row erp-row--gap-16">
        <div className="erp-field erp-flex-1"><label className="erp-field__label" htmlFor="product-purchase-price">Purchase Price<span className="erp-field__required">*</span></label><div className="erp-input-wrapper erp-input-wrapper--currency"><span className="erp-input-wrapper__currency">$</span><input id="product-purchase-price" className={`erp-input erp-input--numeric${errors.purchasePrice ? " erp-input--error" : ""}`} type="number" min="0" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="0.00" /></div>{errors.purchasePrice && <span className="erp-field__helper erp-field__helper--error">{errors.purchasePrice}</span>}</div>
        <div className="erp-field erp-flex-1"><label className="erp-field__label" htmlFor="product-selling-price">Selling Price<span className="erp-field__required">*</span></label><div className="erp-input-wrapper erp-input-wrapper--currency"><span className="erp-input-wrapper__currency">$</span><input id="product-selling-price" className={`erp-input erp-input--numeric${errors.sellingPrice ? " erp-input--error" : ""}`} type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.00" /></div>{errors.sellingPrice && <span className="erp-field__helper erp-field__helper--error">{errors.sellingPrice}</span>}{showPriceWarning && <span className="erp-field__helper erp-field__helper--warning">Selling price is lower than purchase price.</span>}</div>
      </div>
      <div className="erp-field"><label className="erp-field__label" htmlFor="product-stock">Stock Quantity<span className="erp-field__required">*</span></label><input id="product-stock" className={`erp-input erp-input--numeric${errors.stock ? " erp-input--error" : ""}`} type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />{errors.stock && <span className="erp-field__helper erp-field__helper--error">{errors.stock}</span>}</div>
    </Modal>
  );
}
