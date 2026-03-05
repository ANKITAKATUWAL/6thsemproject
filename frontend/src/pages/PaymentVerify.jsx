import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/authService";

function PaymentVerify() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const verifiedRef = useRef(false);
  const [status, setStatus] = useState("Verifying your payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    const pidx = searchParams.get("pidx");

    if (!pidx || verifiedRef.current) {
      if (!pidx) {
        setError("Payment reference not found in URL.");
      }
      return;
    }

    verifiedRef.current = true;

    api
      .post("/payments/verify", { pidx })
      .then((response) => {
        const data = response.data;
        if (data?.success) {
          setStatus("Payment verified successfully.");
          toast.success("Payment successful!");
          setTimeout(() => navigate("/my-dashboard"), 1200);
          return;
        }

        setError(data?.message || "Payment not completed.");
        toast.error(data?.message || "Payment verification failed.");
      })
      .catch((err) => {
        const message = err?.response?.data?.message || "Payment verification failed.";
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("pidx");
        params.delete("payment_success");
        setSearchParams(params, { replace: true });
      });
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
