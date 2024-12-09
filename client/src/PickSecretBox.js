import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function PickSecretBox() {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('https://pick-4.onrender.com/wishlist/pick');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Fetch error:', error);
        setUsers([]);  // Fallback to an empty array on error
      }
    };

    fetchUsers();
  }, []);

  // Handle picking a wishlist
  const pickName = async (id) => {
    try {
      const response = await fetch('https://pick-4.onrender.com/wishlist/pick', {
        method: 'POST', // Change to POST request
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authtoken')}`, // Send auth token
        },
        body: JSON.stringify({ userId: id }), // Send the selected user ID
      });
      const data = await response.json();
      if (data && data.pickedUser) {
        setSelectedUser(data.pickedUser);
        setModalVisible(true);

        // Remove user from list once picked
        setUsers(users.filter(user => user._id !== id));
      } else {
        Swal.fire('Error', 'Something went wrong. Please try again!', 'error');
      }
    } catch (error) {
      console.error('Error picking name:', error);
      Swal.fire('Error', 'An error occurred while picking the wishlist.', 'error');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
    navigate('/');  // Redirect to home page after closing the modal
  };

  return (
    <div className="py-10">
      <div className="container mx-auto max-w-4xl text-white">
        <h2 className="text-3xl font-bold mb-8 text-center glow">🎅 Choose Your Secret Christmas Box 🎁</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user._id} className="bg-red-500 bg-opacity-80 p-6 rounded-lg shadow-lg border border-red-700">
              <h3 className="text-lg font-semibold">Name: <span className="text-yellow-300">********</span></h3>
              <p className="mt-2">Wishlist: <span className="text-yellow-300">********</span></p>
              <button
                onClick={() => pickName(user._id)}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition">
                🎄 Pick Name 🎄
              </button>
            </div>
          ))}
        </div>
      </div>

      {modalVisible && selectedUser && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 text-gray-800">
            <h3 className="text-lg font-bold mb-4">You Picked:</h3>
            <p className="text-lg font-semibold text-red-600">{selectedUser.name}</p>
            <p className="text-gray-600 mt-2">{selectedUser.wishlist}</p>
            <div className="mt-4 flex justify-end">
              <button onClick={closeModal} className="bg-gray-500 text-white py-2 px-4 rounded-lg mr-2">Close</button>
              <a
                href={`data:text/plain;charset=utf-8,Name: ${encodeURIComponent(selectedUser.name)}%0AWishlist: ${encodeURIComponent(selectedUser.wishlist)}`}
                download={`${selectedUser.name}-wishlist.txt`}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg">
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      <footer className="text-black text-center text-sm absolute bottom-0 w-full py-4">
        <p>Made with ❤️ by DavtevhStudio & Aderonke</p>
      </footer>
    </div>
  );
}

export default PickSecretBox;
