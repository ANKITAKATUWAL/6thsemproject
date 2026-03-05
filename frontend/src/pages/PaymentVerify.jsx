import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/authService";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function PaymentVerify() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const verifiedRef = useRef(false);
  const [status, setStatus] = useState("Verifying your payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    const pidx = searchParams.get("pidx");

    if (verifiedRef.current) {
      return;
    }

    if (!pidx) {
      setError("Payment reference not found in URL.");
      return;
    }

    verifiedRef.current = true;

    let cancelled = false;

    const verifyWithRetry = async () => {
      try {
        // Khalti may report Pending right after redirect; retry a few times.
        for (let attempt = 1; attempt <= 6; attempt++) {
          if (cancelled) return;

          setStatus(
            attempt === 1
              ? "Verifying your payment..."
              : `Confirming payment with Khalti (attempt ${attempt}/6)...`
          );

          const response = await api.post("/payments/verify", { pidx });
          const data = response.data;

          if (data?.success) {
            setStatus("Payment verified successfully.");
            toast.success("Payment successful!");
            setTimeout(() => navigate("/my-dashboard"), 1200);
            return;
          }

          const remoteStatus = (data?.status || "").toString().toUpperCase();
          if (remoteStatus === "PENDING" || remoteStatus === "INITIATED") {
            await wait(1500);
            continue;
          }

          const message = data?.message || "Payment not completed.";
          setError(message);
          toast.error(message);
          return;
        }

        const message = "Payment is taking longer to confirm. Please refresh your dashboard in a moment.";
        setError(message);
        toast.info(message);
      } catch (err) {
        const message = err?.response?.data?.message || "Payment verification failed.";
        setError(message);
        toast.error(message);
      } finally {
        const params = new URLSearchParams(searchParams);
        params.delete("pidx");
        params.delete("payment_success");
        setSearchParams(params, { replace: true });
      }
    };

    verifyWithRetry();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams, setSearchParams]);

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Khalti Payment Verification</h2>

      {!error ? (
        <p className="text-gray-700">{status}</p>
      ) : (
        <div>
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/my-dashboard" className="text-blue-600 hover:underline">
            Go to My Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

export default PaymentVerify;
