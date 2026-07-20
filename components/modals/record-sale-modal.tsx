"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import {
  Banknote,
  Check,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  createSale,
  searchSaleItems,
  searchSaleMembers,
} from "@/app/actions/inventory";
import { useGym } from "@/components/gym-provider";
import {
  INVENTORY_CATEGORY_AVATAR,
  itemInitials,
} from "@/lib/inventory/format";
import { formatCurrency, getInitials } from "@/lib/members/format";
import type {
  InventoryListRow,
  MemberSalePickerItem,
  SalePaymentMethod,
} from "@/lib/types";
import styles from "./record-sale-modal.module.css";

type LineItem = {
  item_id: string;
  name: string;
  category: InventoryListRow["category"];
  unit_price: number;
  quantity: number;
  max_qty: number;
};

type PaymentChoice = Extract<
  SalePaymentMethod,
  "cash" | "easypaisa" | "jazzcash" | "bank_transfer" | "member_tab"
>;

const METHODS: { value: PaymentChoice; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "easypaisa", label: "EasyPaisa" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "member_tab", label: "Add to Member Tab" },
];

type RecordSaleModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function RecordSaleModal({ opened, onClose }: RecordSaleModalProps) {
  const router = useRouter();
  const { currencySymbol } = useGym();
  const [pending, startTransition] = useTransition();

  const [isWalkin, setIsWalkin] = useState(false);
  const [member, setMember] = useState<MemberSalePickerItem | null>(null);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState<MemberSalePickerItem[]>(
    [],
  );
  const [showMemberSearch, setShowMemberSearch] = useState(false);

  const [itemQuery, setItemQuery] = useState("");
  const [itemResults, setItemResults] = useState<InventoryListRow[]>([]);
  const [showItemSearch, setShowItemSearch] = useState(false);

  const [lines, setLines] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentChoice>("cash");

  useEffect(() => {
    if (!opened) return;
    setIsWalkin(false);
    setMember(null);
    setMemberQuery("");
    setMemberResults([]);
    setShowMemberSearch(false);
    setItemQuery("");
    setItemResults([]);
    setShowItemSearch(false);
    setLines([]);
    setDiscount(0);
    setMethod("cash");
  }, [opened]);

  useEffect(() => {
    if (!showMemberSearch) return;
    const t = setTimeout(() => {
      void searchSaleMembers(memberQuery).then(({ data }) => {
        setMemberResults(data);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [memberQuery, showMemberSearch]);

  useEffect(() => {
    if (!showItemSearch && !itemQuery) return;
    const t = setTimeout(() => {
      void searchSaleItems(itemQuery).then(({ data }) => {
        setItemResults(data);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [itemQuery, showItemSearch]);

  if (!opened) return null;

  const subtotal = lines.reduce(
    (sum, line) => sum + line.unit_price * line.quantity,
    0,
  );
  const total = Math.max(0, subtotal - (discount || 0));
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  const addItem = (item: InventoryListRow) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.item_id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.item_id === item.id
            ? {
                ...l,
                quantity: Math.min(l.max_qty, l.quantity + 1),
              }
            : l,
        );
      }
      return [
        ...prev,
        {
          item_id: item.id,
          name: item.name,
          category: item.category,
          unit_price: item.selling_price,
          quantity: 1,
          max_qty: item.stock_qty,
        },
      ];
    });
    setItemQuery("");
    setShowItemSearch(false);
    setItemResults([]);
  };

  const setQty = (itemId: string, qty: number) => {
    setLines((prev) =>
      prev
        .map((l) =>
          l.item_id === itemId
            ? { ...l, quantity: Math.min(l.max_qty, Math.max(0, qty)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
  };

  const handleSubmit = () => {
    if (lines.length === 0) {
      notifications.show({ color: "red", message: "Add at least one item" });
      return;
    }
    if (method === "member_tab" && !member) {
      notifications.show({
        color: "red",
        message: "Select a member for tab payment",
      });
      return;
    }

    startTransition(async () => {
      const { error } = await createSale({
        member_id: isWalkin ? null : member?.id ?? null,
        is_walkin: isWalkin || !member,
        items: lines.map((l) => ({
          item_id: l.item_id,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
        discount: discount || 0,
        payment_method: method,
      });

      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }

      notifications.show({ color: "green", message: "Sale completed." });
      onClose();
      router.refresh();
    });
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Record Sale</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.sectionLabel}>Sale to</div>
          <div className={styles.memberCard}>
            <div className={styles.memberAvatar}>
              {member?.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photo_url} alt="" />
              ) : isWalkin ? (
                "?"
              ) : (
                getInitials(member?.name)
              )}
            </div>
            <div className={styles.memberInfo}>
              <div className={styles.memberName}>
                {isWalkin
                  ? "Walk-in customer"
                  : (member?.name ?? "Select member")}
              </div>
              <div className={styles.memberSub}>
                {isWalkin
                  ? "No member linked"
                  : member
                    ? `${member.package_name ?? "Member"} · ${member.member_code}`
                    : "Or continue as walk-in"}
              </div>
            </div>
            <button
              type="button"
              className={styles.chipBtn}
              onClick={() => {
                setIsWalkin(false);
                setShowMemberSearch(true);
                setMemberQuery("");
              }}
            >
              Change
            </button>
            <button
              type="button"
              className={`${styles.chipBtn} ${
                isWalkin ? styles.chipBtnActive : ""
              }`}
              onClick={() => {
                setIsWalkin(true);
                setMember(null);
                setShowMemberSearch(false);
                if (method === "member_tab") setMethod("cash");
              }}
            >
              Walk-in
            </button>

            {showMemberSearch ? (
              <div
                className={styles.dropdown}
                style={{ top: "calc(100% + 6px)" }}
              >
                <div className={styles.searchWrap} style={{ margin: 0, border: "none", borderRadius: 0 }}>
                  <Search size={16} color="#9A9A90" />
                  <input
                    className={styles.searchInput}
                    placeholder="Search members…"
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                {memberResults.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setMember(m);
                      setIsWalkin(false);
                      setShowMemberSearch(false);
                    }}
                  >
                    <div className={styles.memberAvatar}>
                      {m.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.photo_url} alt="" />
                      ) : (
                        getInitials(m.name)
                      )}
                    </div>
                    <div>
                      <div className={styles.memberName}>{m.name}</div>
                      <div className={styles.memberSub}>
                        {m.package_name ?? "Member"} · {m.member_code}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.searchWrap}>
            <Search size={17} color="#9A9A90" strokeWidth={2} />
            <input
              className={styles.searchInput}
              placeholder="Search items to add…"
              value={itemQuery}
              onChange={(e) => {
                setItemQuery(e.target.value);
                setShowItemSearch(true);
              }}
              onFocus={() => setShowItemSearch(true)}
            />
            {showItemSearch && itemResults.length > 0 ? (
              <div className={styles.dropdown}>
                {itemResults.map((item) => {
                  const avatar = INVENTORY_CATEGORY_AVATAR[item.category];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => addItem(item)}
                    >
                      <div
                        className={styles.lineAvatar}
                        style={{
                          background: avatar.background,
                          color: avatar.color,
                        }}
                      >
                        {itemInitials(item.name)}
                      </div>
                      <div className={styles.lineInfo}>
                        <div className={styles.lineName}>{item.name}</div>
                        <div className={styles.linePrice}>
                          {formatCurrency(item.selling_price, currencySymbol)}{" "}
                          · {item.stock_qty} in stock
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className={styles.lineList}>
            {lines.length === 0 ? (
              <div className={styles.emptyLines}>
                Search and add items to this sale
              </div>
            ) : (
              lines.map((line) => {
                const avatar = INVENTORY_CATEGORY_AVATAR[line.category];
                return (
                  <div key={line.item_id} className={styles.lineRow}>
                    <div
                      className={styles.lineAvatar}
                      style={{
                        background: avatar.background,
                        color: avatar.color,
                      }}
                    >
                      {itemInitials(line.name)}
                    </div>
                    <div className={styles.lineInfo}>
                      <div className={styles.lineName}>{line.name}</div>
                      <div className={styles.linePrice}>
                        {formatCurrency(line.unit_price, currencySymbol)} each
                      </div>
                    </div>
                    <div className={styles.qtyControl}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => setQty(line.item_id, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span className={styles.qtyValue}>{line.quantity}</span>
                      <button
                        type="button"
                        className={`${styles.qtyBtn} ${styles.qtyBtnPlus}`}
                        onClick={() => setQty(line.item_id, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className={styles.lineTotal}>
                      {formatCurrency(
                        line.unit_price * line.quantity,
                        currencySymbol,
                      )}
                    </span>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => setQty(line.item_id, 0)}
                      aria-label="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.totalsBox}>
            <div className={styles.totalsRow}>
              <span className={styles.totalsLabel}>
                Subtotal · {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
              <span className={styles.totalsValue}>
                {formatCurrency(subtotal, currencySymbol)}
              </span>
            </div>
            <div className={styles.totalsRow}>
              <span className={styles.totalsLabel}>Discount</span>
              <input
                className={styles.discountInput}
                type="number"
                min={0}
                value={discount || ""}
                placeholder="0"
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              />
            </div>
            <div className={styles.totalsDivider} />
            <div className={styles.totalsRow} style={{ marginBottom: 0 }}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalValue}>
                {formatCurrency(total, currencySymbol)}
              </span>
            </div>
          </div>

          <div className={styles.sectionLabel}>Payment Method</div>
          <div className={styles.paymentPills}>
            {METHODS.map((m) => {
              const isTab = m.value === "member_tab";
              const disabled = isTab && (!member || isWalkin);
              const selected = method === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  disabled={disabled}
                  className={`${styles.paymentPill} ${
                    selected && isTab
                      ? styles.paymentPillTab
                      : selected
                        ? styles.paymentPillSelected
                        : ""
                  } ${disabled ? styles.paymentPillDisabled : ""}`}
                  onClick={() => setMethod(m.value)}
                >
                  {m.value === "cash" ? (
                    <Banknote size={15} strokeWidth={2} />
                  ) : null}
                  {isTab ? <Star size={14} strokeWidth={2.2} /> : null}
                  {m.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={pending || lines.length === 0}
          >
            <Check size={18} strokeWidth={2.2} />
            Complete Sale · {formatCurrency(total, currencySymbol)}
          </button>
        </div>
      </div>
    </div>
  );
}
