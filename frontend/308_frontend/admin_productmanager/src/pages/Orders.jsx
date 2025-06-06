import React, { useEffect, useState } from "react";
import axios from "axios";

const backendUrl = "/backend";

const DeliveryTracking = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const fetchDeliveryList = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");

        const response = await axios.get(`${backendUrl}/api/orders/delivery-list`, {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        if (Array.isArray(response.data)) {
          setOrders(response.data);
          setFilteredOrders(response.data);
        } else {
          throw new Error("API did not return an array.");
        }
      } catch (error) {
        console.error("Error fetching delivery list:", error.message);
        setError("Failed to fetch delivery list.");
      }
    };
    fetchDeliveryList();
  }, []);


  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    if (status === "all") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) => order.status === status);
      setFilteredOrders(filtered);
    }
  };

  return (
    <div style={{ padding: "0 40px", marginBottom: "40px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>
        Delivery Tracking
      </h1>
      {error && <p className="error">{error}</p>}

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", marginRight: "10px" }}>
          Filter by Status:
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => handleStatusFilter(e.target.value)}
          style={{
            padding: "5px 10px",
            borderRadius: "5px",
            border: "1px solid #ddd",
            backgroundColor: "#f8f9fa",
          }}
        >
          <option value="all">All</option>
          <option value="processing">Processing</option>
          <option value="in-transit">In-Transit</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Delivery ID</th>
            <th style={tableHeaderStyle}>Customer ID</th>
            <th style={tableHeaderStyle}>Product ID</th>
            <th style={tableHeaderStyle}>Quantity</th>
            <th style={tableHeaderStyle}>Total Price</th>
            <th style={tableHeaderStyle}>Delivery Address</th>
            <th style={tableHeaderStyle}>Status</th>
            <th style={tableHeaderStyle}>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.deliveryId}>
              <td style={tableCellStyle}>{order.deliveryId}</td>
              <td style={tableCellStyle}>{order.customerId}</td>
              <td style={tableCellStyle}>
                {order.products.map((product) => (
                  <div key={product.productId}>{product.productId}</div>
                ))}
              </td>
              <td style={tableCellStyle}>
                {order.products.map((product) => (
                  <div key={product.productId}>{product.quantity}</div>
                ))}
              </td>
              <td style={tableCellStyle}>${order.totalPrice}</td>
              <td style={tableCellStyle}>
                {order.deliveryAddress || "No Address"}
              </td>
              <td style={tableCellStyle}>{order.status}</td>
              <td style={tableCellStyle}>
                <StatusUpdateDropdown
                  orderId={order.deliveryId}
                  currentStatus={order.status}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const StatusUpdateDropdown = ({ orderId, currentStatus }) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setLoading(true);

    const accessToken = localStorage.getItem("accessToken");

    axios
      .put(
        `${backendUrl}/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      )
      .then((response) => {
        setStatus(response.data.order.orderStatus);
        setError("");
      })
      .catch((error) => {
        console.error("Error updating status:", error.message);
        setError("Failed to update status");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={loading}
        style={{
          padding: "5px 8px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          cursor: loading ? "not-allowed" : "pointer",
          backgroundColor: "#f8f9fa",
        }}
      >
        <option value="processing">Processing</option>
        <option value="in-transit">In-Transit</option>
        <option value="delivered">Delivered</option>
      </select>
    </div>
  );
};

const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  backgroundColor: "#f2f2f2",
  textAlign: "center",
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center",
};

export default DeliveryTracking;