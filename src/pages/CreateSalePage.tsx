/* ============================================================
 * Screen - Create Sale
 * ============================================================ */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  UserPlus,
  X,
} from "lucide-react";
import { getAllProducts, type ApiProduct } from "@/api/products";
import { createCustomer, getAllUsers, type ApiUser } from "@/api/users";
import { createSale, type ApiSale } from "@/api/sales";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/ui/Toast";

interface CartItem {
  product: ApiProduct;
  quantity: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function isCustomer(user: ApiUser) {
  return user.roleId.name.toLowerCase() === "customer";
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

function getProductImageUrl(product: ApiProduct) {
  return normalizeImageUrl(product.productImg || product.img);
}

export default function CreateSalePage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<ApiUser | null>(null);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [successSale, setSuccessSale] = useState<ApiSale | null>(null);

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers(),
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  const createCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: async (customer) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedCustomer(customer);
      setCustomerSearch(customer.phone || customer.email);
      setCreateCustomerOpen(false);
      addToast("success", "Customer created and selected.");
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: async (sale) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product-analytics"] }),
        queryClient.invalidateQueries({ queryKey: ["salesman-analytics"] }),
      ]);
      setSuccessSale(sale);
      addToast("success", "Sale completed.");
    },
  });

  const customers = (usersQuery.data || []).filter(isCustomer);
  const products = (productsQuery.data || []).filter(
    (product) => !product.isDeleted
  );

  const customerMatches = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return [];

    return customers
      .filter(
        (customer) =>
          customer.email.toLowerCase().includes(query) ||
          customer.phone.toLowerCase().includes(query) ||
          customer.name.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [customerSearch, customers]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;

    return products.filter(
      (product) =>
        product.productName.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    );
  }, [productSearch, products]);

  const grandTotal = cart.reduce(
    (total, item) => total + item.product.sellingPrice * item.quantity,
    0
  );
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (product: ApiProduct) => {
    if (product.inStock <= 0) return;

    setCart((current) => {
      const existing = current.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.inStock) return current;
        return current.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, nextQuantity: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.product._id !== productId) return item;
          if (nextQuantity <= 0) return null;
          return {
            ...item,
            quantity: Math.min(nextQuantity, item.product.inStock),
          };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) =>
      current.filter((item) => item.product._id !== productId)
    );
  };

  const resetSale = () => {
    setCart([]);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setProductSearch("");
    setSuccessSale(null);
  };

  const handleCompleteSale = async () => {
    if (!selectedCustomer || cart.length === 0) return;

    await createSaleMutation.mutateAsync({
      customerId: selectedCustomer._id,
      items: cart.map((item) => ({
        itemId: item.product._id,
        quantity: item.quantity,
      })),
    });
  };

  return (
    <>
      <div className="erp-page-header">
        <div className="erp-page-header__left">
          <h1 className="text-display">Create Sale</h1>
          <p className="erp-page-header__subtitle">
            Select a customer, add products, manage quantities, and complete
            the sale.
          </p>
        </div>
      </div>

      <div className="erp-sale-layout">
        <div className="erp-sale-workspace">
          <section className="erp-card">
            <div className="erp-card__header">
              <div>
                <h2 className="erp-card__title">Customer</h2>
                <p className="erp-dashboard-section-subtitle">
                  Search by phone, email, or name. Create a customer only when
                  no match exists.
                </p>
              </div>
              {selectedCustomer && (
                <span className="erp-badge erp-badge--success">Selected</span>
              )}
            </div>

            <div className="erp-sale-customer-search">
              <div className="erp-input-wrapper">
                <Search className="erp-input-wrapper__icon-left" />
                <input
                  className="erp-input erp-role-search-input"
                  value={customerSearch}
                  onChange={(event) => {
                    setCustomerSearch(event.target.value);
                    setSelectedCustomer(null);
                  }}
                  placeholder="Search customer by phone or email..."
                />
              </div>

              {selectedCustomer ? (
                <div className="erp-sale-selected-customer">
                  <div>
                    <strong>{selectedCustomer.name}</strong>
                    <span>
                      {selectedCustomer.email} | {selectedCustomer.phone}
                    </span>
                  </div>
                  <button
                    className="erp-btn erp-btn--sm erp-btn--outline"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Change
                  </button>
                </div>
              ) : customerSearch.trim() ? (
                <div className="erp-sale-customer-results">
                  {customerMatches.length > 0 ? (
                    customerMatches.map((customer) => (
                      <button
                        key={customer._id}
                        className="erp-sale-customer-option"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerSearch(customer.phone || customer.email);
                        }}
                      >
                        <strong>{customer.name}</strong>
                        <span>
                          {customer.email} | {customer.phone}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="erp-sale-create-customer-prompt">
                      <span>No customer found.</span>
                      <button
                        className="erp-btn erp-btn--sm erp-btn--primary"
                        onClick={() => setCreateCustomerOpen(true)}
                      >
                        <UserPlus className="erp-btn__icon" />
                        Create Customer
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </section>

          <section className="erp-card">
            <div className="erp-card__header">
              <div>
                <h2 className="erp-card__title">Products</h2>
                <p className="erp-dashboard-section-subtitle">
                  Add products from inventory and adjust quantity in the sale
                  summary.
                </p>
              </div>
            </div>

            <div className="erp-input-wrapper erp-mb-16">
              <Search className="erp-input-wrapper__icon-left" />
              <input
                className="erp-input erp-role-search-input"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Search product name or SKU..."
              />
            </div>

            {productsQuery.isLoading ? (
              <div className="erp-skeleton erp-skeleton--row" />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                headline="No products found"
                body="Create products first or change the search term."
                variant="inline"
              />
            ) : (
              <div className="erp-table-container">
                <table className="erp-table">
                  <thead className="erp-table__head">
                    <tr className="erp-table__header-row">
                      <th className="erp-table__th">Product</th>
                      <th className="erp-table__th">SKU</th>
                      <th className="erp-table__th erp-table__th--right">
                        Price
                      </th>
                      <th className="erp-table__th erp-table__th--right">
                        Available
                      </th>
                      <th className="erp-table__th erp-table__th--right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="erp-table__body">
                    {filteredProducts.map((product) => {
                      const cartQty =
                        cart.find((item) => item.product._id === product._id)
                          ?.quantity || 0;
                      const outOfStock = product.inStock <= 0;

                      return (
                        <tr key={product._id} className="erp-table__row">
                          <td className="erp-table__td">
                            <div className="erp-product-cell">
                              <SaleProductImage product={product} />
                              <span className="erp-product-cell__name">
                                {product.productName}
                              </span>
                            </div>
                          </td>
                          <td className="erp-table__td">
                            <span className="numeral">{product.sku}</span>
                          </td>
                          <td className="erp-table__td erp-table__td--numeric">
                            {formatCurrency(product.sellingPrice)}
                          </td>
                          <td className="erp-table__td erp-table__td--numeric">
                            {product.inStock}
                          </td>
                          <td className="erp-table__td erp-table__td--actions">
                            <button
                              className="erp-btn erp-btn--sm erp-btn--outline"
                              disabled={outOfStock || cartQty >= product.inStock}
                              onClick={() => addToCart(product)}
                            >
                              <Plus className="erp-btn__icon" />
                              {cartQty > 0 ? `Added (${cartQty})` : "Add"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="erp-sale-summary">
          <div className="erp-card">
            <div className="erp-card__header">
              <h2 className="erp-card__title">Sale Summary</h2>
              <span className="erp-badge erp-badge--neutral">
                {totalItems} items
              </span>
            </div>

            {!selectedCustomer && (
              <div className="erp-sale-summary-alert">
                Select a customer before completing the sale.
              </div>
            )}

            {cart.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                headline="No items added"
                body="Add products from the table to build this sale."
                variant="inline"
              />
            ) : (
              <div className="erp-sale-cart">
                {cart.map((item) => (
                  <div key={item.product._id} className="erp-sale-line">
                    <div className="erp-sale-line__info">
                      <span className="erp-sale-line__name">
                        {item.product.productName}
                      </span>
                      <span className="erp-sale-line__price">
                        {formatCurrency(item.product.sellingPrice)} |{" "}
                        {item.product.inStock} available
                      </span>
                    </div>
                    <div className="erp-qty-stepper">
                      <button
                        className="erp-qty-stepper__btn"
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity - 1)
                        }
                      >
                        <Minus className="erp-table__action-btn-icon" />
                      </button>
                      <span className="erp-qty-stepper__value">
                        {item.quantity}
                      </span>
                      <button
                        className="erp-qty-stepper__btn"
                        disabled={item.quantity >= item.product.inStock}
                        onClick={() =>
                          updateQuantity(item.product._id, item.quantity + 1)
                        }
                      >
                        <Plus className="erp-table__action-btn-icon" />
                      </button>
                    </div>
                    <span className="erp-sale-line__subtotal">
                      {formatCurrency(item.product.sellingPrice * item.quantity)}
                    </span>
                    <button
                      className="erp-sale-line__remove"
                      onClick={() => removeFromCart(item.product._id)}
                    >
                      <X className="erp-table__action-btn-icon" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="erp-divider" />
            <div className="erp-sale-total">
              <span className="erp-sale-total__label">Grand Total</span>
              <span className="erp-sale-total__value">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            <button
              className="erp-btn erp-btn--md erp-btn--primary erp-btn--full erp-mt-16"
              disabled={
                !selectedCustomer ||
                cart.length === 0 ||
                createSaleMutation.isPending
              }
              onClick={handleCompleteSale}
            >
              {createSaleMutation.isPending && (
                <Loader2 className="erp-btn__spinner" />
              )}
              {createSaleMutation.isPending
                ? "Completing..."
                : "Complete Sale"}
            </button>
          </div>
        </aside>
      </div>

      <CreateCustomerModal
        isOpen={createCustomerOpen}
        initialSearch={customerSearch}
        loading={createCustomerMutation.isPending}
        onClose={() => setCreateCustomerOpen(false)}
        onSubmit={(payload) => createCustomerMutation.mutateAsync(payload)}
      />

      {successSale && (
        <Modal
          isOpen={!!successSale}
          onClose={resetSale}
          title=""
          centered
          footer={
            <button className="erp-btn erp-btn--md erp-btn--primary" onClick={resetSale}>
              New Sale
            </button>
          }
        >
          <div className="erp-sale-success">
            <div className="erp-sale-success__icon">
              <CheckCircle2 />
            </div>
            <h2 className="erp-sale-success__title">Sale completed</h2>
            <p className="erp-sale-success__meta">
              {successSale._id} | {successSale.items.length} line items
            </p>
            <div className="erp-sale-success__items">
              {successSale.items.map((item) => (
                <div key={item._id} className="erp-sale-success__item">
                  <span className="erp-sale-success__item-name">
                    {item.itemId.productName}
                  </span>
                  <span className="erp-sale-success__item-qty">
                    x{item.quantity}
                  </span>
                  <span className="erp-sale-success__item-price">
                    {formatCurrency(item.totalPriceForThisItem)}
                  </span>
                </div>
              ))}
            </div>
            <div className="erp-divider erp-w-full" />
            <div className="erp-sale-total erp-w-full">
              <span className="erp-sale-total__label">Grand Total</span>
              <span className="erp-sale-total__value">
                {formatCurrency(
                  successSale.items.reduce(
                    (total, item) => total + item.totalPriceForThisItem,
                    0
                  )
                )}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function SaleProductImage({ product }: { product: ApiProduct }) {
  const imageUrl = getProductImageUrl(product);
  const [failedUrl, setFailedUrl] = useState("");
  const canRender = imageUrl && imageUrl !== failedUrl;

  useEffect(() => {
    setFailedUrl("");
  }, [imageUrl]);

  return (
    <span className="erp-product-cell__image">
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

function CreateCustomerModal({
  isOpen,
  initialSearch,
  loading,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  initialSearch: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    email: string;
    phone: string;
  }) => Promise<ApiUser>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email, and phone are required.");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create customer.");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setEmail(initialSearch.includes("@") ? initialSearch : "");
    setPhone(initialSearch && !initialSearch.includes("@") ? initialSearch : "");
    setError("");
  }, [initialSearch, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Customer"
      footer={
        <>
          <button
            className="erp-btn erp-btn--md erp-btn--outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="erp-btn erp-btn--md erp-btn--primary"
            onClick={() => handleSubmit()}
            disabled={loading}
          >
            {loading && <Loader2 className="erp-btn__spinner" />}
            {loading ? "Creating..." : "Create Customer"}
          </button>
        </>
      }
    >
      <form className="erp-user-form" onSubmit={handleSubmit}>
        <div className="erp-field">
          <label className="erp-field__label" htmlFor="sale-customer-name">
            Name<span className="erp-field__required">*</span>
          </label>
          <input
            id="sale-customer-name"
            className="erp-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Customer name"
          />
        </div>
        <div className="erp-field">
          <label className="erp-field__label" htmlFor="sale-customer-email">
            Email<span className="erp-field__required">*</span>
          </label>
          <input
            id="sale-customer-email"
            className="erp-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="customer@example.com"
          />
        </div>
        <div className="erp-field">
          <label className="erp-field__label" htmlFor="sale-customer-phone">
            Phone<span className="erp-field__required">*</span>
          </label>
          <input
            id="sale-customer-phone"
            className="erp-input"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="01777777779"
          />
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
