import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function WishlistForm() {
  const [name, setName] = useState('');
  const [wishlist, setWishlist] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if the form has already been submitted using localStorage
  useEffect(() => {
    const hasSubmitted = localStorage.getItem('wishlistSubmitted');
    if (hasSubmitted === 'true') {
      setIsSubmitting(true); // Disable submission if already submitted
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable the button before submitting

    const response = await fetch('https://pick-4.onrender.com/wishlist/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, wishlist }),
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data.message,
      });

      // Store flag in localStorage to indicate the form has been submitted
      localStorage.setItem('wishlistSubmitted', 'true');

      setName('');
      setWishlist('');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message,
      });
    }

    setIsSubmitting(false); // Enable the button again after the request is processed
  };

  // Create the snowflake effect
  const createSnowflakes = () => {
    const container = document.querySelector('.snowflakes');
    for (let i = 0; i < 50; i++) {
      const snowflake = document.createElement('div');
      snowflake.classList.add('snowflake');
      snowflake.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
      snowflake.style.left = Math.random() * 100 + 'vw';
      snowflake.style.animationDuration = Math.random() * 5 + 5 + 's';
      snowflake.style.animationDelay = Math.random() * 5 + 's';
      snowflake.style.fontSize = Math.random() * 1.5 + 1 + 'rem';
      container.appendChild(snowflake);
    }
  };

  // Run the snowflakes animation on component mount
  useEffect(() => {
    createSnowflakes();
  }, []);

  return (
    <div className="relative bg-cover bg-center h-screen flex flex-col items-center justify-center" style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?christmas,snow')" }}>
      {/* Snowflakes Effect */}
      <div className="snowflakes absolute top-0 left-0 w-full h-full pointer-events-none"></div>

      {/* Form Container */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative z-10">
        <h2 className="text-3xl font-bold text-center text-red-600 mb-6">🎄 Christmas Wishlist 🎄</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">🎅 Your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="wishlist" className="block text-sm font-medium text-gray-700">🎁 Your Wishlist</label>
            <textarea
              id="wishlist"
              value={wishlist}
              onChange={(e) => setWishlist(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              rows="4"
              required
            ></textarea>
          </div>
          <button 
            type="submit" 
            className={`w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-bold transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}  // Disable the button during submission
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}  {/* Change button text */}
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="text-black text-center text-sm absolute bottom-4 w-full z-10">
        <p>Made with ❤️ by DavtevhStudio & Aderonke</p>
      </footer>
    </div>
  );
}

export default WishlistForm;
