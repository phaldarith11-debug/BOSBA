"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle, RefreshCw, Clock } from "lucide-react";

interface Props {
  qrData: string;
  tranId: string;
  amount: number;
  expiresAt?: string;
  onPaid: () => void;
  onExpired: () => void;
}

const POLL_INTERVAL_MS = 3000;

export function ABAQRDisplay({ qrData, tranId, amount, expiresAt, onPaid, onExpired }: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (!expiresAt) return 600;
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });
  const [polling, setPolling] = useState(true);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setPolling(false);
          onExpired();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [onExpired]);

  // ── Status polling ───────────────────────────────────────────────────────
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/payment/aba/status?tranId=${encodeURIComponent(tranId)}`);
      const data = await res.json();
      setLastCheck(new Date().toLocaleTimeString());

      if (data.status === "PAID") {
        clearInterval(pollRef.current!);
        clearInterval(timerRef.current!);
        setPolling(false);
        onPaid();
        return;
      }
      if (data.status === "FAILED") {
        clearInterval(pollRef.current!);
        setPolling(false);
        return;
      }
      if (data.status === "EXPIRED") {
        clearInterval(pollRef.current!);
        clearInterval(timerRef.current!);
        setPolling(false);
        onExpired();
      }
    } catch {
      // Network error — keep polling
    }
  }, [tranId, onPaid, onExpired]);

  useEffect(() => {
    if (!polling) return;
    pollRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current!);
  }, [polling, checkStatus]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const urgentColor = secondsLeft < 60 ? "text-red-600" : "text-gray-700";

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Method header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">🏦</span>
          <span className="font-bold text-lg">ABA PayWay / KHQR</span>
        </div>
        <p className="text-red-100 text-sm">Scan with ABA Mobile, Wing, or any KHQR-supported app</p>
      </div>

      <div className="p-6">
        {/* Amount */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 mb-1">Amount to pay</p>
          <p className="text-3xl font-bold text-gray-900">${amount.toFixed(2)}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-5">
          <div className="relative p-3 border-2 border-gray-100 rounded-2xl bg-white shadow-inner">
            <QRCodeSVG
              value={qrData}
              size={220}
              level="M"
              includeMargin={false}
              imageSettings={{
                src: "/aba-logo.png",
                x: undefined,
                y: undefined,
                height: 36,
                width: 36,
                excavate: true,
              }}
            />
            {/* Corner decorations */}
            <div className="absolute top-1 left-1 w-5 h-5 border-t-2 border-l-2 border-red-600 rounded-tl-md" />
            <div className="absolute top-1 right-1 w-5 h-5 border-t-2 border-r-2 border-red-600 rounded-tr-md" />
            <div className="absolute bottom-1 left-1 w-5 h-5 border-b-2 border-l-2 border-red-600 rounded-bl-md" />
            <div className="absolute bottom-1 right-1 w-5 h-5 border-b-2 border-r-2 border-red-600 rounded-br-md" />
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className={`h-4 w-4 ${urgentColor}`} />
          <span className={`font-mono text-lg font-bold ${urgentColor}`}>{mins}:{secs}</span>
          <span className="text-sm text-gray-400">remaining</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
          <div
            className={`h-1.5 rounded-full transition-all duration-1000 ${secondsLeft < 60 ? "bg-red-500" : "bg-red-400"}`}
            style={{ width: `${Math.min(100, (secondsLeft / 600) * 100)}%` }}
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <RefreshCw className={`h-3.5 w-3.5 ${polling ? "animate-spin text-red-500" : "text-gray-300"}`} />
          <span>
            {polling ? "Waiting for payment…" : "Checking stopped"}
            {lastCheck && <span className="ml-1 text-xs text-gray-400">Last checked {lastCheck}</span>}
          </span>
        </div>

        {/* Steps */}
        <ol className="mt-5 space-y-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
          <li className="flex items-start gap-2">
            <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">1</span>
            Open <strong className="mx-1">ABA Mobile</strong> or any KHQR app
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">2</span>
            Tap <strong className="mx-1">Scan QR</strong> and point your camera here
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">3</span>
            Confirm the amount <strong className="mx-1">${amount.toFixed(2)}</strong> and pay
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">
              <CheckCircle className="h-3 w-3" />
            </span>
            This page updates automatically once payment is received
          </li>
        </ol>
      </div>
    </div>
  );
}
