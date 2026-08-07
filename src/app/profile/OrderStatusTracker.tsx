"use client";

import { formatOrderStatusLabel } from "@/lib/order-display";
import {
  buildOrderTracker,
  paymentBadgeMeta,
  type StatusHistoryEntry,
} from "@/lib/order-tracker";
import { Check, Package, Truck, X } from "lucide-react";

type Props = {
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: "cod" | "online";
  createdAt: string;
  statusHistory?: StatusHistoryEntry[];
};

export default function OrderStatusTracker({
  orderStatus,
  paymentStatus,
  paymentMethod,
  createdAt,
  statusHistory = [],
}: Props) {
  const tracker = buildOrderTracker({
    orderStatus,
    createdAt,
    statusHistory,
  });
  const pay = paymentBadgeMeta(paymentStatus);

  return (
    <div className="ost">
      <div className="ost-badges">
        <span className={`ost-chip status-${orderStatus}`}>
          {formatOrderStatusLabel(orderStatus)}
        </span>
        <span className={`ost-chip pay-${pay.tone}`}>{pay.label}</span>
        <span className="ost-chip method">
          {paymentMethod === "cod" ? "Cash on delivery" : "Online payment"}
        </span>
      </div>

      <p className={`ost-headline ost-headline-${tracker.variant}`}>
        {tracker.headline}
      </p>

      {tracker.variant === "progress" ? (
        <ol className="ost-rail" aria-label="Order progress">
          {tracker.steps.map((step, i) => (
            <li key={step.id} className={`ost-step ost-${step.state}`}>
              {i > 0 ? (
                <span
                  className={`ost-connector ${
                    step.state === "upcoming" ? "dim" : "lit"
                  }`}
                  aria-hidden
                />
              ) : null}
              <div className="ost-node" aria-hidden>
                {step.state === "complete" ? (
                  <Check className="ost-icon" strokeWidth={2.5} />
                ) : step.state === "current" ? (
                  step.id === "shipped" || step.id === "out_for_delivery" ? (
                    <Truck className="ost-icon" strokeWidth={2} />
                  ) : (
                    <Package className="ost-icon" strokeWidth={2} />
                  )
                ) : (
                  <span className="ost-dot" />
                )}
              </div>
              <div className="ost-copy">
                <p className="ost-label">{step.label}</p>
                <p className="ost-time">{step.atLabel}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className={`ost-terminal ost-terminal-${tracker.variant}`}>
          <X className="ost-terminal-icon" strokeWidth={2} />
          <p>
            {tracker.variant === "cancel_requested"
              ? "We will email you once your cancellation is reviewed."
              : tracker.variant === "failed"
                ? "Payment or fulfilment could not be completed."
                : "This order was cancelled."}
          </p>
        </div>
      )}

      <style jsx>{`
        .ost {
          margin: 14px 0 4px;
          padding: 14px 14px 12px;
          border: 1px solid #e2e8f0;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
        }
        .ost-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 10px;
        }
        .ost-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
        }
        .ost-chip.pay-paid {
          border-color: rgba(22, 163, 74, 0.35);
          background: rgba(22, 163, 74, 0.1);
          color: #15803d;
        }
        .ost-chip.pay-pending {
          border-color: rgba(202, 138, 4, 0.35);
          background: rgba(250, 204, 21, 0.12);
          color: #a16207;
        }
        .ost-chip.pay-failed {
          border-color: rgba(220, 38, 38, 0.35);
          background: rgba(254, 226, 226, 0.8);
          color: #b91c1c;
        }
        .ost-chip.pay-refunded {
          border-color: rgba(99, 102, 241, 0.35);
          background: rgba(99, 102, 241, 0.1);
          color: #4338ca;
        }
        .ost-chip.method {
          color: #0f172a;
        }
        .ost-chip.status-delivered,
        .ost-chip.status-confirmed {
          border-color: rgba(22, 163, 74, 0.35);
          background: rgba(22, 163, 74, 0.1);
          color: #15803d;
        }
        .ost-chip.status-shipped,
        .ost-chip.status-out_for_delivery,
        .ost-chip.status-processing {
          border-color: rgba(37, 99, 235, 0.35);
          background: rgba(37, 99, 235, 0.08);
          color: #1d4ed8;
        }
        .ost-chip.status-cancelled,
        .ost-chip.status-failed {
          border-color: rgba(220, 38, 38, 0.35);
          background: rgba(254, 226, 226, 0.85);
          color: #b91c1c;
        }
        .ost-chip.status-cancellation_requested {
          border-color: rgba(249, 115, 22, 0.4);
          background: rgba(249, 115, 22, 0.1);
          color: #c2410c;
        }
        .ost-chip.status-pending,
        .ost-chip.status-pending_payment {
          border-color: rgba(202, 138, 4, 0.35);
          background: rgba(250, 204, 21, 0.12);
          color: #a16207;
        }
        .ost-headline {
          margin: 0 0 14px;
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.45;
        }
        .ost-headline-cancelled,
        .ost-headline-failed {
          color: #b91c1c;
        }
        .ost-headline-cancel_requested {
          color: #c2410c;
        }
        .ost-rail {
          list-style: none;
          margin: 0;
          padding: 8px 0 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .ost-step {
          position: relative;
          flex: 1 1 0;
          min-width: 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .ost-connector {
          position: absolute;
          top: 14px;
          right: calc(50% + 16px);
          left: calc(-50% + 16px);
          height: 3px;
          border-radius: 2px;
        }
        .ost-connector.lit {
          background: linear-gradient(90deg, #16a34a, #7da8c7);
        }
        .ost-connector.dim {
          background: #e2e8f0;
        }
        .ost-node {
          position: relative;
          z-index: 1;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #cbd5e1;
          background: #fff;
          color: #94a3b8;
        }
        .ost-complete .ost-node {
          border-color: #16a34a;
          background: #16a34a;
          color: #fff;
        }
        .ost-current .ost-node {
          border-color: #0f172a;
          background: #0f172a;
          color: #fff;
          box-shadow: 0 0 0 4px rgba(125, 168, 199, 0.25);
        }
        .ost-icon {
          width: 14px;
          height: 14px;
        }
        .ost-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #cbd5e1;
        }
        .ost-copy {
          margin-top: 8px;
          padding: 0 2px;
        }
        .ost-label {
          margin: 0;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .ost-complete .ost-label,
        .ost-current .ost-label {
          color: #0f172a;
        }
        .ost-time {
          margin: 4px 0 0;
          font-size: 10px;
          color: #94a3b8;
          line-height: 1.35;
        }
        .ost-current .ost-time {
          color: #64748b;
          font-weight: 600;
        }
        .ost-terminal {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #991b1b;
          font-size: 13px;
          line-height: 1.5;
        }
        .ost-terminal p {
          margin: 0;
        }
        .ost-terminal-cancel_requested {
          border-color: #fed7aa;
          background: #fff7ed;
          color: #9a3412;
        }
        .ost-terminal-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        @media (max-width: 640px) {
          .ost-rail {
            padding-bottom: 4px;
          }
          .ost-step {
            min-width: 88px;
          }
        }
      `}</style>
    </div>
  );
}
