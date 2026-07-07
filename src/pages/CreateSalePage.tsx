/* ============================================================
 * Screen — Create Sale (§5.9) + Sale Success (§5.10)
 * ============================================================ */

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Loader2,
  Package,
  ShoppingCart,
} from "lucide-react";
import { MOCK_PRODUCTS } from "@/mock/products";
import type { Product } from "@/types/product";
import type { SaleLineItem } from "@/types/sale";
import { APP_CONFIG } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { generateId, generateDisplayId, simulateDelay } from "@/mock/helpers";
import { MOCK_SALES } from "@/mock/sales";

interface CartItem extends SaleLineItem {
  maxStock: number;
}

export default function CreateSalePage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    saleId: string;
    displayId: string;
    items: CartItem[];
    total: number;
    date: string;
  } | null>(null);

  const formatCurrency = (v: number) => `${APP_CONFIG.currency}${v.toFixed(2)}`;

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  // Cart helpers
  const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const addToCart = (product: Product) => {
    if (product.stock === 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.sellingPrice,
          quantity: 1,
          subtotal: product.sellingPrice,
          maxStock: product.stock,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.maxStock) return item;
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.unitPrice,
          };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const isInCart = (productId: string) =>
    cart.some((item) => item.productId === productId);

  const getCartQty = (productId: string) =>
    cart.find((item) => item.productId === productId)?.quantity || 0;

  // Complete sale
  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    await simulateDelay(600);

    const saleId = generateId();
    const displayId = generateDisplayId("S", MOCK_SALES.length + 1);
    const now = new Date().toISOString();

    setSuccessModal({
      saleId,
      displayId,
      items: [...cart],
      total: grandTotal,
      date: now,
    });

    addToast("success", "Sale recorded.");
    setLoading(false);
  };

  const handleNewSale = () => {
    setCart([]);
    setSuccessModal(null);
    setSearch("");
  };

  return (
    <>
      {/* Page Header */}
      <div className="erp-page-header">
        <div className="erp-page-header__left">
          <h1 className="text-display">Create Sale</h1>
        </div>
      </div>

      <div className="erp-sale-layout">
        {/* Left: Product Picker */}
        <div className="erp-card">
          <div className="erp-card__header">
            <h2 className="erp-card__title">Products</h2>
          </div>
          <div className="erp-input-wrapper erp-mb-16">
            <Search className="erp-input-wrapper__icon-left" />
            <input
              className="erp-input"
              type="text"
              placeholder="Search products to add…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
          </div>
          <div className="erp-product-picker">
            {filteredProducts.map((product) => {
              const outOfStock = product.stock === 0;
              const inCart = isInCart(product.id);
              return (
                <div key={product.id} className="erp-product-picker__item">
                  <div className="erp-table__thumbnail-fallback">
                    <Package className="erp-table__thumbnail-fallback-icon" />
                  </div>
                  <div className="erp-product-picker__item-info">
                    <span className="erp-product-picker__item-name">
                      {product.name}
                    </span>
                    <span className="erp-product-picker__item-sku">
                      {product.sku}
                    </span>
                  </div>
                  <span className="erp-product-picker__item-price">
                    {formatCurrency(product.sellingPrice)}
                  </span>
                  <span
                    className={`erp-product-picker__item-stock${
                      outOfStock ? " erp-product-picker__item-stock--out" : ""
                    }`}
                  >
                    {outOfStock
                      ? "Out of stock"
                      : `${product.stock} in stock`}
                  </span>
                  <button
                    className="erp-btn erp-btn--sm erp-btn--ghost"
                    onClick={() => addToCart(product)}
                    disabled={outOfStock}
                    aria-label={
                      outOfStock
                        ? "Out of stock"
                        : `Add ${product.name} to cart`
                    }
                  >
                    {outOfStock ? (
                      "Out of stock"
                    ) : inCart ? (
                      "Added"
                    ) : (
                      <>
                        <Plus className="erp-btn__icon" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sale Summary */}
        <div className="erp-sale-summary">
          <div className="erp-card">
            <div className="erp-card__header">
              <h2 className="erp-card__title">Sale Summary</h2>
            </div>

            {cart.length === 0 ? (
              <div className="erp-empty-state erp-empty-state--inline">
                <div className="erp-empty-state__icon-container">
                  <ShoppingCart className="erp-empty-state__icon" />
                </div>
                <p className="erp-empty-state__headline">No items added yet.</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.productId} className="erp-sale-line">
                    <div className="erp-sale-line__info">
                      <span className="erp-sale-line__name">
                        {item.productName}
                      </span>
                      <span className="erp-sale-line__price">
                        {formatCurrency(item.unitPrice)}
                      </span>
                      {item.quantity >= item.maxStock && (
                        <span className="erp-field__helper erp-field__helper--warning erp-mt-4">
                          Only {item.maxStock} in stock.
                        </span>
                      )}
                    </div>
                    <div className="erp-qty-stepper">
                      <button
                        className="erp-qty-stepper__btn"
                        onClick={() => updateQuantity(item.productId, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="erp-table__action-btn-icon" />
                      </button>
                      <span className="erp-qty-stepper__value">
                        {item.quantity}
                      </span>
                      <button
                        className="erp-qty-stepper__btn"
                        onClick={() => updateQuantity(item.productId, 1)}
                        disabled={item.quantity >= item.maxStock}
                        aria-label="Increase quantity"
                      >
                        <Plus className="erp-table__action-btn-icon" />
                      </button>
                    </div>
                    <span className="erp-sale-line__subtotal">
                      {formatCurrency(item.subtotal)}
                    </span>
                    <button
                      className="erp-sale-line__remove"
                      onClick={() => removeFromCart(item.productId)}
                      aria-label={`Remove ${item.productName}`}
                    >
                      <X className="erp-table__action-btn-icon" />
                    </button>
                  </div>
                ))}

                <div className="erp-divider" />

                <div className="erp-sale-total">
                  <span className="erp-sale-total__label">Grand Total</span>
                  <span className="erp-sale-total__value">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </>
            )}

            <button
              className="erp-btn erp-btn--md erp-btn--primary erp-btn--full erp-mt-16"
              disabled={cart.length === 0 || loading}
              onClick={handleCompleteSale}
            >
              {loading && <Loader2 className="erp-btn__spinner" />}
              {loading ? "Recording sale…" : "Complete Sale"}
            </button>
            {cart.length === 0 && (
              <p className="erp-field__helper erp-mt-8 erp-text-center">
                Add at least one product to continue.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sale Success Modal */}
      {successModal && (
        <Modal
          isOpen={!!successModal}
          onClose={handleNewSale}
          title=""
          centered
          footer={
            <>
              <button
                className="erp-btn erp-btn--md erp-btn--outline"
                onClick={handleNewSale}
              >
                New Sale
              </button>
            </>
          }
        >
          <div className="erp-sale-success">
            <div className="erp-sale-success__icon">
              <CheckCircle2 />
            </div>
            <h2 className="erp-sale-success__title">Sale recorded</h2>
            <p className="erp-sale-success__meta">
              {successModal.displayId} · {successModal.items.length} items ·{" "}
              {new Date(successModal.date).toLocaleString()}
            </p>
            <div className="erp-sale-success__items">
              {successModal.items.map((item) => (
                <div key={item.productId} className="erp-sale-success__item">
                  <span className="erp-sale-success__item-name">
                    {item.productName}
                  </span>
                  <span className="erp-sale-success__item-qty">
                    ×{item.quantity}
                  </span>
                  <span className="erp-sale-success__item-price">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="erp-divider erp-w-full" />
            <div className="erp-sale-total erp-w-full">
              <span className="erp-sale-total__label">Grand Total</span>
              <span className="erp-sale-total__value">
                {formatCurrency(successModal.total)}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
