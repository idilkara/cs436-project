import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <>
      {Array.from({ length: fullStars }, (_, index) => (
        <span key={`full-${index}`} className="text-yellow-500">★</span>
      ))}
      {halfStar && <span className="text-yellow-500">☆</span>}
      {Array.from({ length: emptyStars }, (_, index) => (
        <span key={`empty-${index}`} className="text-gray-300">★</span>
      ))}
    </>
  );
};

const Product = () => {
  const { productID } = useParams();
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addProductToCart, addToFavorites, user, isAuthenticated } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product details
        const productResponse = await axios.get(`/backend/api/products/${productID}`);
        setProduct(productResponse.data);

        // Set comments and ratings
        setComments(productResponse.data.comments.filter(comment => comment.isVisible));
        setRatings(productResponse.data.ratings);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching product or feedback:', err.message);
        setError('Failed to fetch product details or feedback');
        setLoading(false);
      }
    };

    fetchData();
  }, [productID]);

  const handleAddFeedback = async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to leave feedback.');
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication token is missing.");

      const ordersResponse = await axios.get(`/backend/api/orders/all`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const deliveredProducts = ordersResponse.data
        .filter(order => order.status === "delivered")
        .flatMap(order => order.products.map(product => product.productId));

      if (!deliveredProducts.includes(productID)) {
        alert('You should have purchased the product to leave a review.');
        return;
      }

      const response = await axios.post(`/backend/api/products/${productID}/feedback`, {
        userId: user.id,
        username: user.name,
        text: newComment || '',
        rating: newRating,
      });

      if (newComment) {
        alert('Your comment will be reviewed before publishing! Thank you for your feedback.');
        setComments([...comments, response.data.product.comments.pop()]);
      }

      if (newRating) {
        alert('Your rating is published. Thank you for your rating.');
        setRatings([...ratings, response.data.product.ratings.pop()]);
      }

      setNewComment('');
      setNewRating(0);

      navigate(0);
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.error);
      } else {
        console.error('Failed to add feedback:', err.message);
        alert('Failed to add feedback');
      }
    }
  };

  const handleAddRating = async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to leave a rating.');
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Authentication token is missing.");

      const ordersResponse = await axios.get(`/backend/api/orders/all`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const deliveredProducts = ordersResponse.data
        .filter(order => order.status === "delivered")
        .flatMap(order => order.products.map(product => product.productId));

      if (!deliveredProducts.includes(productID)) {
        alert('You should have purchased the product to leave a review.');
        return;
      }

      const response = await axios.post(`/backend/api/products/${productID}/feedback`, {
        userId: user.id,
        username: user.name,
        text: '',
        rating: newRating,
      });

      alert('Your rating is published. Thank you for your rating.');
      setRatings([...ratings, response.data.product.ratings.pop()]);
      setNewRating(0);

      navigate(0);
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.error);
      } else {
        console.error('Failed to add rating:', err.message);
        alert('Failed to add rating');
      }
    }
  };

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      alert('Sorry, this product is out of stock.');
      return;
    }

    const quantityToAdd = Math.min(quantity, product.stock);

    const productToAdd = {
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: quantityToAdd,
      stock: product.stock,
      image: product.imageURL,
    };

    addProductToCart(productToAdd);
    alert(`${product.name} added to cart!`);
  };

  const handleAddToFavorites = () => {
    if (!isAuthenticated) {
      alert('You must be logged in to add favorites.');
      return;
    }

    const productToAdd = {
      id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      image: product.imageURL,
    };

    addToFavorites(productToAdd);
    alert(`${product.name} added to favorites!`);
  };

  const averageRating = ratings.length > 0 ? (ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length).toFixed(1) : 0;
  const userRating = ratings.find(rating => rating.user === user?.id)?.rating || 'Not rated yet';

  if (loading) {
    return <div>Loading product details...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const similarProducts = product && Array.isArray(products) && products.length > 0
    ? products
        .filter(
          (p) =>
            p._id !== product._id &&
            p.category === product.category &&
            Math.abs(p.price - product.price) <= 20
        )
        .slice(0, 4)
    : [];
  const discountedPrice = product.originalPrice
    ? product.originalPrice - (product.originalPrice * product.discountPercentage) / 100
    : product.price;
  return (
    <div className="container mx-auto p-4">
      <div className="flex">
        <div className="w-1/2">
          <img src={product.imageURL} alt={product.name} className="w-full" />
        </div>
        <div className="w-1/2 pl-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.discountPercentage > 0 ? (
            <div>
              <p className="text-lg line-through text-gray-500">₺{product.originalPrice.toFixed(2)}</p>
              <p className="text-2xl text-green-600 font-bold">
                ₺{discountedPrice.toFixed(2)} ({product.discountPercentage}% OFF)
              </p>
            </div>
          ) : (
          <p className="text-xl text-green-700">₺{product.price.toFixed(2)}</p>
        )}
          <p className="mt-2">{product.description}</p>
          <div className="mt-4">
            <p className="mt-2 text-sm">
              <span className="font-semibold">Serial Number:</span> {product.serialNumber}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Distributor:</span> {product.distributor}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Expiration Date:</span> {product.expirationDate?.slice(0, 7) || "N/A"}
            </p>
          </div>
          <p className={`mt-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? 'In stock' : 'Out of stock'}
          </p>
          {product.stock >= 0 && (
            <p className="text-sm text-gray-500 mt-1 font-semibold">Available: {product.stock}</p>
          )}
          <div className="mt-4">
            <p className="text-lg font-bold">Average Rating: {averageRating} {renderStars(averageRating)}</p>
            <div className="flex items-center mt-2">
              <p className="text-lg font-bold">Your Rating: {userRating}</p>
              <div className="flex space-x-2 ml-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewRating(star)}
                    className={`p-2 rounded ${newRating === star ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                  >
                    {star}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddRating}
                className="bg-blue-500 text-white p-2 rounded ml-4"
              >
                Submit Rating
              </button>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <button
              onClick={decreaseQuantity}
              className="bg-gray-300 text-black px-2 py-1 rounded"
              disabled={product.stock <= 0}
            >
              -
            </button>
            <span className="mx-2 text-lg">{quantity}</span>
            <button
              onClick={increaseQuantity}
              className="bg-gray-300 text-black px-2 py-1 rounded"
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className={`mt-4 ${product.stock === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-500'} text-white px-4 py-2 rounded mr-2`}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button
            onClick={handleAddToFavorites}
            className="mt-4 bg-pink-500 text-white px-4 py-2 rounded"
          >
            Add to Favorites
          </button>
        </div>
      </div>

      {/* Similar Products */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-xl font-bold">Similar Products</h2>
        <div className="flex space-x-4">
          {similarProducts.length > 0 ? (
            similarProducts.map((similarProduct) => (
              <div key={similarProduct._id} className="border p-4 rounded-lg shadow-md">
                <img
                  src={similarProduct.imageURL}
                  alt={similarProduct.name}
                  className="w-full h-40 object-cover mb-4"
                />
                <h3 className="text-lg font-bold">{similarProduct.name}</h3>
                <p className="text-green-700">₺{similarProduct.price}</p>
                <Link
                  to={`/product/${similarProduct._id}`}
                  className="text-blue-500 mt-2 inline-block"
                >
                  View Product
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No similar products found.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Comments</h2>
        {comments.length > 0 ? (
          comments
            .filter((item) => item.isVisible) 
            .map((item) => (
              <div key={item._id} className="border p-4 rounded mb-2">
                <p>{item.username}</p>
                <p>{item.text}</p>
              </div>
            ))
        ) : (
          <p>No comments.</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Add Your Feedback</h2>
        <textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />
        <button
          onClick={handleAddFeedback}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Submit Comment
        </button>
      </div>
    </div>
  );
};

export default Product;
