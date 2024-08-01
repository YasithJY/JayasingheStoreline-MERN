import { BrowserRouter, Route, Routes } from "react-router-dom";
import DeliveryManagement from "./DeliveryManagement/delivery";
import InventoryManagement from "./InventoryManagement/inventory";
import PaymentManagement from "./PaymentManagement/Payment";
import ReactReviews from "./ReactReviews/reactReviews";
import SupplierManagement from "./SupplierManagement/supplier";
import OrderManagement from "./OrderManagement/order";
import Layout from "./Shared/Layout";
import Dashboard from "./Dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={Dashboard} />
          <Route path="reactreviews" element={ReactReviews} />
          <Route path="inventory" element={InventoryManagement} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;