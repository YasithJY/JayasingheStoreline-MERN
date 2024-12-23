import React, { useState } from 'react';
import { FaTrash, FaDownload, FaSearch, FaMoon, FaSun } from 'react-icons/fa';
import { useDeleteDeliveryMutation, useGetDeliveriesQuery, useUpdateDeliveryMutation } from '../redux/api/deliveryApiSlice';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../asset/logo.png';

export default function DeliveryDetail({ onEditDelivery }) {
  const { data: deliveries, error: deliveriesError, isLoading } = useGetDeliveriesQuery();
  const [deleteDelivery] = useDeleteDeliveryMutation();
  const [updateDelivery] = useUpdateDeliveryMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Company Details
  const companyEmail = 'info@jayasinghestoreline.com';
  const companyTelephone = '+94 11 234 5678';
  const companyAddress = '123 Main Street, Colombo, Sri Lanka';

  // Get current date and time
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString();
  const timeString = currentDate.toLocaleTimeString();

  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
  });

  const handleDelete = async (id) => {
    try {
      await deleteDelivery(id).unwrap();
    } catch (error) {
      console.error('Error deleting delivery:', error);
    }
  };

  const handleStatusChange = async (id, status) => {
    const delivery = deliveries.find((delivery) => delivery._id === id);
    const updatedDelivery = { ...delivery, deliveryStatus: status };
    try {
      await updateDelivery({ deliveryId: id, formData: updatedDelivery }).unwrap();
      window.location.reload();
    } catch (error) {
      console.error('Error updating delivery or order:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getRowClass = (status) => {
    const baseClasses = isDarkMode ? 'border-opacity-50 ' : '';
    switch (status) {
      case 'Delayed':
        return `${baseClasses}${isDarkMode ? 'bg-blue-900 border-blue-700 text-blue-200' : 'bg-blue-50 border-blue-300 text-blue-700'}`;
      case 'Completed':
        return `${baseClasses}${isDarkMode ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-50 border-green-300 text-green-700'}`;
      default:
        return `${baseClasses}${isDarkMode ? 'bg-yellow-900 border-yellow-700 text-yellow-200' : 'bg-yellow-50 border-yellow-300 text-yellow-700'}`;
    }
  };

  const getButtonClass = (currentStatus, buttonStatus) => {
    const baseClasses = "p-2 rounded-lg transition-colors duration-300";
    if (currentStatus === buttonStatus) {
      return `${baseClasses} ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-800'} cursor-not-allowed`;
    }
    switch (buttonStatus) {
      case 'Pending':
        return `${baseClasses} ${isDarkMode ? 'text-yellow-400 hover:bg-yellow-900' : 'text-yellow-500 hover:bg-yellow-100'}`;
      case 'Delayed':
        return `${baseClasses} ${isDarkMode ? 'text-blue-400 hover:bg-blue-900' : 'text-blue-500 hover:bg-blue-100'}`;
      case 'Completed':
        return `${baseClasses} ${isDarkMode ? 'text-green-400 hover:bg-green-900' : 'text-green-500 hover:bg-green-100'}`;
      default:
        return baseClasses;
    }
  };

  const downloadPDF = async () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header
    const img = new Image();
    img.src = logo;
    await new Promise(resolve => {
      img.onload = resolve;
    });
    doc.addImage(img, 'PNG', 14, 10, 30, 30);

    doc.setFontSize(25);
    doc.setTextColor(40, 40, 40);
    doc.text('Delivery Details Report', pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Date: ${dateString}`, pageWidth - 15, 15, { align: 'right' });
    doc.text('CONFIDENTIAL - INTERNAL USE ONLY', 14, 50);
    doc.text(`Contact: ${companyEmail} | ${companyTelephone}`, pageWidth - 15, 22, { align: 'right' });

    // Add header separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 55, pageWidth - 10, 55);

    // Footer function
    const addFooter = () => {
      // Add footer separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);

      doc.setFontSize(10);
      doc.text(`Jayasinghe Storelines PVT (LTD) | ${companyAddress}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
      doc.text('Version 1.0', 14, pageHeight - 10);
      doc.text('This document is confidential and intended solely for internal use.', pageWidth / 2, pageHeight - 6, { align: 'center' });
    };

    // Prepare table data
    const tableData = deliveries.map(delivery => [
      delivery._id,
      delivery.orderId,
      JSON.parse(delivery.deliveryItem).map(item => `${item.name} x ${item.qty}`).join(', '),
      delivery.firstName,
      delivery.telephoneNo,
      `${delivery.address}, ${delivery.city}, ${delivery.province}, ${delivery.postalCode}`,
      delivery.createdAt ? new Date(delivery.createdAt).toLocaleDateString() : 'Date not available',
      priceFormatter.format(delivery.itemsPrice),
      priceFormatter.format(delivery.deliveryPrice),
      priceFormatter.format(delivery.totalPrice),
      delivery.deliveryStatus || 'Pending'
    ]);

    // Generate the table
    autoTable(doc, {
      head: [['Delivery No', 'Order No', 'Delivery Item', 'Name', 'Contact No', 'Delivery Address', 'CreatedAt', 'Items Price', 'Delivery Price', 'Total Price', 'Status']],
      body: tableData,
      startY: 60,
      didDrawPage: (data) => {
        addFooter();
      },
    });

    // Save the PDF
    doc.save('Delivery-Details.pdf');
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Filter deliveries based on search term
  const filteredDeliveries = deliveries.filter((delivery) =>
    delivery._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-6">Delivery Management</h1>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-yellow-400'}`}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <div className={`rounded-lg shadow-lg p-4 sm:p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="relative w-full sm:w-1/2 mb-4 sm:mb-0">
              <input
                type="text"
                placeholder="Search Deliveries by Delivery No"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-shadow duration-300 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className={`absolute left-3 top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            </div>
            <button
              className={`w-full sm:w-auto px-6 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              onClick={downloadPDF}
            >
              <FaDownload className="mr-2" />
              Download PDF
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className={`w-full rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <thead className={isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}>
                <tr>
                  <th className="py-3 px-4 text-left">Delivery No</th>
                  <th className="py-3 px-4 text-left">Order No</th>
                  <th className="py-3 px-4 text-left">Delivery Item</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Contact No</th>
                  <th className="py-3 px-4 text-left">Delivery Address</th>
                  <th className="py-3 px-4 text-left">Order Date</th>
                  <th className="py-3 px-4 text-left">Items Price</th>
                  <th className="py-3 px-4 text-left">Delivery Price</th>
                  <th className="py-3 px-4 text-left">Total Price</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery._id} className={`border-b ${getRowClass(delivery.deliveryStatus)} hover:bg-opacity-80 transition-colors duration-300`}>
                    <td className="py-3 px-4">{delivery._id}</td>
                    <td className="py-3 px-4">{delivery.orderId}</td>
                    <td className="py-3 px-4">
                      {JSON.parse(delivery.deliveryItem).map((item) => (
                        <div key={item._id} className="text-sm">
                          {item.name} x {item.qty}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4">{delivery.firstName}</td>
                    <td className="py-3 px-4">{delivery.telephoneNo}</td>
                    <td className="py-3 px-4 text-sm">{`${delivery.address}, ${delivery.city}, ${delivery.province}, ${delivery.postalCode}`}</td>
                    <td className="py-3 px-4">{delivery.createdAt ? new Date(delivery.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-3 px-4">{priceFormatter.format(delivery.itemsPrice)}</td>
                    <td className="py-3 px-4">{priceFormatter.format(delivery.deliveryPrice)}</td>
                    <td className="py-3 px-4">{priceFormatter.format(delivery.totalPrice)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        delivery.deliveryStatus === 'Completed' ? 'bg-green-200 text-green-800' :
                        delivery.deliveryStatus === 'Delayed' ? 'bg-blue-200 text-blue-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {delivery.deliveryStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        <button className={getButtonClass(delivery.deliveryStatus, 'Pending')} onClick={() => handleStatusChange(delivery._id, 'Pending')}>
                          Pending
                        </button>
                        <button className={getButtonClass(delivery.deliveryStatus, 'Delayed')} onClick={() => handleStatusChange(delivery._id, 'Delayed')}>
                          Delayed
                        </button>
                        <button className={getButtonClass(delivery.deliveryStatus, 'Completed')} onClick={() => handleStatusChange(delivery._id, 'Completed')}>
                          Completed
                        </button>
                        <button className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-300" onClick={() => handleDelete(delivery._id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
