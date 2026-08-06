import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import Navbar from './Navbar';

import { BACKEND_URL } from "../utils/utils.js";

export default function Buy() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [course, setCourse] = useState({});
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");


  const user = JSON.parse(localStorage.getItem("user"));
  const token = user.token;

  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState("");

  useEffect(() => {
    const fetchBuyCourseData = async () => {
      if (!token) {
        setError("Please login to purchase the course!");
        return;
      }

      try {
        const response = await axios.post(`${BACKEND_URL}/course/buy/${courseId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
        });
        console.log(response.data);
        setLoading(false);
        setCourse(response.data.course);
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        setLoading(false);
        if (error?.response?.status === 400) {
          setError("You have already purchased this course!");
          navigate("/purchases");
        }
        else {
          setError(error?.response?.data?.errors);
        }
      }
    }
    fetchBuyCourseData();
  }, [courseId]);

  const handlePurchase = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.log("Stripe or Element not found");
      return;
    }

    setLoading(true);
    const card = elements.getElement(CardElement);

    if (card == null) {
      console.log("Cardelement not found");
      setLoading(false);
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      console.log("Stripe PaymentMethod Error: ", error);
      setLoading(false);
      setCardError(error.message);
    } else {
      console.log("[PaymentMethod Created]", paymentMethod);
    }
    if (!clientSecret) {
      console.log("No client secret found");
      setLoading(false);
      return;
    }
    const { paymentIntent, error: confirmError } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: user?.user?.firstName,
            email: user?.user?.email,
          },
        },
      });
    if (confirmError) {
      setCardError(confirmError.message);
    } else if (paymentIntent.status === "succeeded") {
      console.log("Payment succeeded: ", paymentIntent);
      setCardError("Your payment id: ", paymentIntent.id);
      const paymentInfo = {
        email: user?.user?.email,
        userId: user.user._id,
        courseId: courseId,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
      };
      console.log("Payment info: ", paymentInfo);
      await axios
        .post(`${BACKEND_URL}/order`, paymentInfo, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
          toast.error("Error in making payment");
        });
      toast.success("Payment Successful");
      navigate("/purchases");
    }
    setLoading(false);
  };

  return (
    <div className="bg-linear-to-r from-black to-blue-950 min-h-screen text-white">
      <Navbar />
      {error ? (
        <div className="flex justify-center items-center h-[80vh]">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-8 py-6 rounded-2xl text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-lg font-semibold mb-4">{error}</p>
            <Link className="bg-sky-500 hover:bg-sky-400 text-white py-2 px-6 rounded-full font-semibold transition-colors duration-200" to="/purchases">Go to Purchases</Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-8 container mx-auto px-4 py-16">
          <div className="w-full md:w-1/2 bg-white/5 border border-white/10 rounded-2xl p-8">
            <h1 className="text-2xl font-bold mb-6 text-white">Order Summary</h1>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Course</span>
                <span className="text-white font-semibold">{course.title}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Price</span>
                <span className="text-sky-400 font-bold text-xl">₹{course.price}</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Payment Details</h2>
              <label className="block text-gray-600 text-sm mb-2">Credit / Debit Card</label>
              <form onSubmit={handlePurchase}>
                <div className="border border-gray-300 rounded-lg p-3 mb-6">
                  <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } }, invalid: { color: '#9e2146' } } }} />
                </div>
                {cardError && <p className="text-red-500 text-xs mb-4">{cardError}</p>}
                <button type="submit" disabled={!stripe || loading} className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white py-3 rounded-full font-bold transition-colors duration-200 cursor-pointer">
                  {loading ? 'Processing...' : `Pay ₹${course.price}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
