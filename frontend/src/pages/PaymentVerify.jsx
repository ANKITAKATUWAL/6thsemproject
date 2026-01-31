import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../services/authService";
import { toast } from 'react-toastify';

function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, failed
  const [message, setMessage] = useState("Verifying your payment...");
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const pidx = searchParams.get('pidx');
      const transactionId = searchParams.get('transaction_id');
      const status = searchParams.get('status');
      const purchaseOrderId = searchParams.get('purchase_order_id');

      if (!pidx) {
        setStatus("failed");
        setMessage("Invalid payment response. Missing payment index.");
        return;
      }

      // Check if payment was cancelled or failed at Khalti's end
      if (status === 'Canceled' || status === 'Failed') {
        setStatus("failed");
        setMessage(`Payment ${status.toLowerCase()}. Please try again.`);
        return;
      }

      try {
        const response = await api.post('/payments/verify', {
          pidx,
          transactionId
        });

        if (response.data.success) {
          setStatus("success");
          setMessage("Payment successful! Your appointment has been confirmed.");
          setPaymentDetails(response.data);
          toast.success('Payment verified successfully!');
        } else {
          setStatus("failed");
          setMessage(response.data.message || "Payment verification failed.");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatus("failed");
        setMessage(err.response?.data?.message || "Failed to verify payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <div className="text-center">
        {status === "verifying" && (
          <>
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            
            {paymentDetails && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                <h3 className="font-semibold text-gray-700 mb-2">Payment Details:</h3>
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> Rs. {paymentDetails.payment?.amount}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Transaction ID:</strong> {paymentDetails.payment?.transactionId || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> <span className="text-green-600 font-semibold">Completed</span>
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/my-dashboard"
                className="block w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition"
              >
                View My Appointments
              </Link>
              <Link
                to="/doctors"
                className="block w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Book Another Appointment
              </Link>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            
            <div className="space-y-3">
              <Link
                to="/doctors"
                className="block w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Try Again
              </Link>
              <Link
                to="/my-dashboard"
                className="block w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentVerify;
