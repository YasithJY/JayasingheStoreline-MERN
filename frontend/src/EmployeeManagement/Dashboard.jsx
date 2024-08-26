import React from 'react';

export default function () {
  return (
    <>
    <div className="overflow-auto bg-gray-100 p-5 rounded-lg">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, Deshan Abhishek</h1>
        <p className="text-gray-500">Empowering People, Elevating Performance</p>
      </header>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-green-100 p-4 rounded-lg text-center">
          <h2 className="text-4xl font-bold">132</h2>
          <p className="text-lg">Total Head-Count</p>
          <p className="text-green-600">No new head this week</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg text-center">
          <h2 className="text-4xl font-bold">124</h2>
          <p className="text-lg">Active Today</p>
          <p className="text-yellow-600">1% Higher Than Yesterday</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg text-center">
          <h2 className="text-4xl font-bold">567k</h2>
          <p className="text-lg">Total Earning</p>
          <p className="text-blue-600">+18% +7.8k this week</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg text-center">
          <h2 className="text-4xl font-bold">2</h2>
          <p className="text-lg">Up Coming Meetings</p>
          <p className="text-red-600">The Day Tommorow</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Performance Rating Distribution</h3>
          <div className="relative h-64">
            {/* Insert chart component or image here */}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Employee Attendance Overview</h3>
          <div className="relative h-64">
            {/* Insert chart component or image here */}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
