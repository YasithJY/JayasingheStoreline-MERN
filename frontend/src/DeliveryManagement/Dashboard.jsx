import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, Title, Tooltip } from "chart.js";
import { FaBox, FaClock, FaCheck, FaExclamationCircle } from 'react-icons/fa';

ChartJS.register(LineElement, CategoryScale, LinearScale, Title, Tooltip);

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState(0);
  const [completedDeliveries, setCompletedDeliveries] = useState(0);
  const [delayedDeliveries, setDelayedDeliveries] = useState(0);

  const fetchDeliveries = async () => {
    try {
      const response = await fetch("/api/deliveries");
      const data = await response.json();
      setDeliveries(data);

      const pending = data.filter(d => d.status === 'Pending').length;
      const completed = data.filter(d => d.status === 'Completed').length;
      const delayed = data.filter(d => d.status === 'Delayed').length;

      setPendingDeliveries(pending);
      setCompletedDeliveries(completed);
      setDelayedDeliveries(delayed);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const deliveryTrendsData = {
    labels: ['Last Week', 'Current Week'],
    datasets: [
      {
        label: 'Deliveries',
        data: [10, 20],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const deliveryTrendsOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Delivery Trends',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 overflow-y-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, Yasith JY</h1>
        <p className="text-gray-500">Track and manage your deliveries efficiently</p>
      </header>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <FaBox className="text-4xl text-green-500 mr-4" />
          <div>
            <h2 className="text-3xl font-semibold text-green-600">{deliveries.length}</h2>
            <p className="text-gray-600">Total Deliveries</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <FaClock className="text-4xl text-yellow-500 mr-4" />
          <div>
            <h2 className="text-3xl font-semibold text-yellow-600">{pendingDeliveries}</h2>
            <p className="text-gray-600">Pending Deliveries</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <FaCheck className="text-4xl text-blue-500 mr-4" />
          <div>
            <h2 className="text-3xl font-semibold text-blue-600">{completedDeliveries}</h2>
            <p className="text-gray-600">Completed Deliveries</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <FaExclamationCircle className="text-4xl text-red-500 mr-4" />
          <div>
            <h2 className="text-3xl font-semibold text-red-600">{delayedDeliveries}</h2>
            <p className="text-gray-600">Delayed Deliveries</p>
          </div>
        </div>
      </div>

      {/* Delivery Trends Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Delivery Trends</h2>
        <div className="relative h-64">
          <Line data={deliveryTrendsData} options={deliveryTrendsOptions} />
        </div>
      </div>

      {/* Recent Deliveries Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Deliveries</h2>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Delivery Item</th>
              <th className="px-4 py-2">Items Price</th>
              <th className="px-4 py-2">Delivery Price</th>
              <th className="px-4 py-2">Total Price</th>
              <th className="px-4 py-2">Driver</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.slice(0, 5).map(delivery => (
              <tr key={delivery._id} className="text-center">
                <td className="border px-4 py-2">{delivery._id}</td>
                <td className="border px-4 py-2">{delivery.itemName}</td>
                <td className="border px-4 py-2">{delivery.itemsPrice.toFixed(2)}</td>
                <td className="border px-4 py-2">{delivery.deliveryPrice.toFixed(2)}</td>
                <td className="border px-4 py-2">{(delivery.itemsPrice + delivery.deliveryPrice).toFixed(2)}</td>
                <td className="border px-4 py-2">{delivery.driverName}</td>
                <td className="border px-4 py-2">{delivery.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delivery Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upcoming Deliveries</h2>
          <p className="text-gray-500">You have {pendingDeliveries} upcoming deliveries.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Delivery Performance</h2>
          <p className="text-gray-500">Keep track of how your delivery performance is improving over time.</p>
        </div>
      </div>
    </div>
  );
}
