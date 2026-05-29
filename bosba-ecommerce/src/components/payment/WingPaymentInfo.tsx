"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Clock, Copy, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  qrData: string | null;     // KHQR string (Wing can scan it)
  tranId: string;
  amount: number;
  amountKhr: number;
  wingAccount: string | null;
  wingAccountName: string | null;
  expiresAt?: string;
  onPaid: () => void;
  onExpired: () => void;
}

const POLL_INTERVAL_MS = 4000;

export function WingPaymentInfo({
  qrData, tranId, amount, amountKhr,
  wingAccount, wingAccountName,
  expiresAt, onPaid, onExpired,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    expiresAt ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)) : 600
  );
  const [polling, setPolling] = useState(true);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); setPolling(false); onExpired(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [onExpired]);

  // Poll status
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/payment/aba/status?tranId=${encodeURIComponent(tranId)}`);
      const data = await res.json();
      if (data.status === "PAID") {
        clearInterval(pollRef.current!); clearInterval(timerRef.current!);
        setPolling(false); onPaid();
      } else if (data.status === "EXPIRED" || data.status === "FAILED") {
        clearInterval(pollRef.current!); clearInterval(timerRef.current!);
        setPolling(false);
        if (data.status === "EXPIRED") onExpired();
      }
    } catch { /* keep polling */ }
  }, [tranId, onPaid, onExpired]);

  useEffect(() => {
    if (!polling) return;
    pollRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current!);
  }, [polling, checkStatus]);

  function copyAccount() {
    if (!wingAccount) return;
    navigator.clipboard.writeText(wingAccount);
    setCopied(true);
    toast.success("Account number copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">💸</span>
          <span className="font-bold text-lg">Wing Money</span>
        </div>
        <p className="text-blue-100 text-sm">Transfer to our Wing account or scan KHQR</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Amount */}
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-600 font-medium mb-1">Transfer exactly</p>
          <p className="text-3xl font-bold text-gray-900">${amount.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-0.5">≈ ៛{amountKhr.toLocaleString()}</p>
          <p className="text-xs text-red-500 mt-1 font-medium">Wrong amount = delayed processing</p>
        </div>

        {/* Wing account number */}
        {wingAccount && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Wing Account Number</p>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border">
              <div className="flex-1">
                {wingAccountName && (
                  <p className="text-xs text-gray-500">{wingAccountName}</p>
                )}
                <p className="font-mono font-bold text-gray-900 text-lg tracking-wider">{wingAccount}</p>
              </div>
              <button
                onClick={copyAccount}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
              </button>
            </div>
          </div>
        )}

        {/* KHQR — Wing app can scan it */}
        {qrData && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Or Scan KHQR with Wing App</p>
            <div className="flex justify-center">
              <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-inner">
                <QRCodeSVG value={qrData} size={180} level="M" />
              </div>
            </div>
          </div>
        )}

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <Clock className={`h-4 w-4 ${secondsLeft < 60 ? "text-red-600" : "text-gray-400"}`} />
          <span className={`font-mono font-bold ${secondsLeft < 60 ? "text-red-600" : "text-gray-700"}`}>
            {mins}:{secs}
          </span>
          <span className="text-gray-400">to complete transfer</span>
        </div>

        {/* Steps */}
        <ol className="space-y-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
          <li className="flex items-start gap-2">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">1</span>
            Open <strong className="mx-1">Wing Money</strong> app
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">2</span>
            {qrData
              ? <>Tap <strong className="mx-1">Scan QR</strong> or go to <strong className="mx-1">Send Money</strong></>
              : <>Go to <strong className="mx-1">Send Money → Wing Account</strong></>
            }
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">3</span>
            Enter <strong className="mx-1">${amount.toFixed(2)}</strong> — reference: <strong className="mx-1">{tranId}</strong>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5">
              <CheckCircle className="h-3 w-3" />
            </span>
            This page updates automatically after confirmation
          </li>
        </ol>

        {/* Polling indicator */}
        <div className="text-center text-xs text-gray-400">
          {polling ? (
            <span className="flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Checking for payment every few seconds…
            </span>
          ) : (
            "Payment check stopped"
          )}
        </div>
      </div>
    </div>
  );
}
