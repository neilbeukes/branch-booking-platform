import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import NewBooking from "./features/newBooking";
import { BookingsPage } from "./pages/BookingsPage";
import { ManageBookingPage } from "./pages/ManageBookingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <NewBooking />
            </Layout>
          }
        />
        <Route
          path="/manage"
          element={
            <Layout>
              <ManageBookingPage />
            </Layout>
          }
        />
        <Route
          path="/bookings"
          element={
            <Layout wide>
              <BookingsPage />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
