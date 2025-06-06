import React, { useState, useEffect } from "react";
import axios from "axios";
import { useProductManager } from "../contexts/ProductManager";

const backendUrl = "/backend";

const Products = () => {
  const { products, loading, deleteProduct, fetchProducts } = useProductManager();
  // If createProduct is available and can handle normal JSON, feel free to use it:
  // const { createProduct } = useProductManager(); 

  const [newProductData, setNewProductData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
    distributor: "",
    serialNumber: "",
    expirationDate: "",
    imageURL: "", // We'll store the URL here
  });

  const [categories, setCategories] = useState([]); // Fetched categories
  const [adjustedStocks, setAdjustedStocks] = useState({});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Fetch categories from your backend
    const fetchCategories = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await axios.get(`${backendUrl}/api/products/categories`, {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        setCategories(response.data); 
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Populate adjustedStocks for each product
    setAdjustedStocks(
      products.reduce((acc, product) => {
        acc[product._id] = product.stock ?? 0;
        return acc;
      }, {})
    );
  }, [products]);

  // Basic validation: each required field must not be empty
  const handleValidation = () => {
    const errors = {};
    Object.keys(newProductData).forEach((key) => {
      if (!newProductData[key]) {
        errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create product using JSON (no FormData, just imageURL)
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!handleValidation()) return;

    // Convert price & stock to correct numeric types
    const parsedPrice = parseFloat(newProductData.price) || 0.0;
    const parsedStock = parseInt(newProductData.stock, 10) || 0;

    try {
      const productData = {
        ...newProductData,
        price: parsedPrice,
        stock: parsedStock,
      };
      
      // POST as JSON
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(`${backendUrl}/api/products`, productData, {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      // Reset form
      setNewProductData({
        name: "",
        description: "",
        price: "",
        category: "",
        brand: "",
        stock: "",
        distributor: "",
        serialNumber: "",
        expirationDate: "",
        imageURL: "",
      });
      setFormErrors({});

      // Refresh products
      fetchProducts();
    } catch (error) {
      console.error("Create product failed:", error);
      alert("Failed to create product. Check the console for details.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    const userConfirmed = window.confirm("Bu ürünü silmek istediğinize emin misiniz?");
    if (userConfirmed) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const handleStockUpdate = async (productId) => {
    const newStock = adjustedStocks[productId];
    if (newStock === undefined || newStock < 0) {
      alert("Invalid stock value");
      return;
    }
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.put(
        `${backendUrl}/api/products/stock/${productId}`,
        { newStock },
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );
      fetchProducts();
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock.");
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {/* Form to create new product */}
      <form onSubmit={handleCreateProduct} className="mb-8 border p-4">
        <h2 className="text-xl font-bold mb-4">Add New Product</h2>

        {Object.keys(formErrors).length > 0 && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            Please fill in all required fields.
          </div>
        )}

        {/* Name */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            value={newProductData.name}
            onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
            className="w-full border rounded px-2 py-1"
          />
          {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={newProductData.description}
            onChange={(e) =>
              setNewProductData({ ...newProductData, description: e.target.value })
            }
            className="w-full border rounded px-2 py-1"
          />
          {formErrors.description && (
            <p className="text-red-500 text-sm">{formErrors.description}</p>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Price</label>
          <input
            type="number"
            value={newProductData.price}
            onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
            className="w-full border rounded px-2 py-1"
            min="0"
            step="0.01"
          />
          {formErrors.price && <p className="text-red-500 text-sm">{formErrors.price}</p>}
        </div>

        {/* Category Dropdown */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Category</label>
          <select
            value={newProductData.category}
            onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select a Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {formErrors.category && (
            <p className="text-red-500 text-sm">{formErrors.category}</p>
          )}
        </div>

        {/* Brand */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Brand</label>
          <input
            type="text"
            value={newProductData.brand}
            onChange={(e) => setNewProductData({ ...newProductData, brand: e.target.value })}
            className="w-full border rounded px-2 py-1"
          />
          {formErrors.brand && <p className="text-red-500 text-sm">{formErrors.brand}</p>}
        </div>

        {/* Stock */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Stock</label>
          <input
            type="number"
            value={newProductData.stock}
            onChange={(e) => setNewProductData({ ...newProductData, stock: e.target.value })}
            className="w-full border rounded px-2 py-1"
            min="0"
          />
          {formErrors.stock && <p className="text-red-500 text-sm">{formErrors.stock}</p>}
        </div>

        {/* Image URL (Required by your backend schema) */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Image URL</label>
          <input
            type="text"
            value={newProductData.imageURL}
            onChange={(e) => setNewProductData({ ...newProductData, imageURL: e.target.value })}
            className="w-full border rounded px-2 py-1"
          />
          {formErrors.imageURL && (
            <p className="text-red-500 text-sm">{formErrors.imageURL}</p>
          )}
        </div>

        {/* Distributor */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Distributor</label>
          <input
            type="text"
            value={newProductData.distributor}
            onChange={(e) =>
              setNewProductData({ ...newProductData, distributor: e.target.value })
            }
            className="w-full border rounded px-2 py-1"
          />
          {formErrors.distributor && (
            <p className="text-red-500 text-sm">{formErrors.distributor}</p>
          )}
        </div>

        {/* Serial Number */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Serial Number</label>
          <input
            type="text"
            value={newProductData.serialNumber}
            onChange={(e) =>
              setNewProductData({ ...newProductData, serialNumber: e.target.value })
            }
            className="w-full border rounded px-2 py-1"
          />
          {formErrors.serialNumber && (
            <p className="text-red-500 text-sm">{formErrors.serialNumber}</p>
          )}
        </div>

        {/* Expiration Date */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Expiration Date</label>
          <input
            type="date"
            value={newProductData.expirationDate}
            onChange={(e) =>
              setNewProductData({ ...newProductData, expirationDate: e.target.value })
            }
            className="w-full border rounded px-2 py-1"
          />
          {formErrors.expirationDate && (
            <p className="text-red-500 text-sm">{formErrors.expirationDate}</p>
          )}
        </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Add Product
        </button>
      </form>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-6 py-4 text-left w-1/6">ID</th>
              <th className="border border-gray-300 px-6 py-4 text-left w-1/4">Name</th>
              <th className="border border-gray-300 px-6 py-4 text-left w-1/6">Price</th>
              <th className="border border-gray-300 px-6 py-4 text-left w-1/12">Stock</th>
              <th className="border border-gray-300 px-6 py-4 text-left w-1/12"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="even:bg-gray-50">
                <td className="border border-gray-300 px-6 py-4 break-words">
                  {product._id}
                </td>
                <td className="border border-gray-300 px-6 py-4">
                  {product.name}
                </td>
                <td className="border border-gray-300 px-6 py-4">
                  ${product.price.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={adjustedStocks[product._id] ?? 0}
                      onChange={(e) => {
                        const intValue = parseInt(e.target.value) || 0;
                        setAdjustedStocks((prev) => ({
                          ...prev,
                          [product._id]: Math.max(0, intValue),
                        }));
                      }}
                      className="w-16 border rounded px-2 py-1"
                    />
                    <button
                      onClick={() => handleStockUpdate(product._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Update
                    </button>
                  </div>
                </td>
                <td className="border border-gray-300 px-6 py-4">
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
