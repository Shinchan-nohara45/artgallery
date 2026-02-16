// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth, AuthProvider } from "@/contexts/AuthStore";
import { toast } from "react-toastify";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = AuthContext();
  const [artworks, setArtworks] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });

  // Fetch artworks
  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/artworks/me", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setArtworks(res.data);

      // Stats
      const total = res.data.length;
      const published = res.data.filter((a) => a.status === "published").length;
      const drafts = res.data.filter((a) => a.status === "draft").length;
      setStats({ total, published, drafts });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch artworks");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/artworks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setArtworks((prev) => prev.filter((a) => a._id !== id));
      toast.success("Artwork deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete artwork");
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name || "Artist"}!
          </h1>
          <p className="text-gray-500">
            Here’s what’s happening with your artworks
          </p>
        </div>
        <Link
          to="/artist-upload"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          + Upload New Artwork
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white shadow">
          <h3 className="text-lg font-semibold">{stats.total}</h3>
          <p className="text-gray-500">Total Artworks</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow">
          <h3 className="text-lg font-semibold">{stats.published}</h3>
          <p className="text-gray-500">Published</p>
        </div>
        <div className="p-4 rounded-xl bg-white shadow">
          <h3 className="text-lg font-semibold">{stats.drafts}</h3>
          <p className="text-gray-500">Drafts</p>
        </div>
      </div>

      {/* Artworks Grid */}
      {artworks.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No artworks yet.</p>
          <Link
            to="/artist-upload"
            className="text-blue-600 hover:underline font-medium"
          >
            Upload your first one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((art) => (
            <div
              key={art._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <img
                src={art.images?.[0] || "/placeholder.png"}
                alt={art.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold">{art.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {art.description}
                </p>
                <p className="text-sm font-medium">
                  ₹{art.price?.toLocaleString() || "0"}
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded ${
                    art.status === "published"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {art.status}
                </span>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => navigate(`/artwork/${art._id}`)}
                    className="flex-1 px-3 py-1 text-sm rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/artwork/${art._id}/edit`)}
                    className="flex-1 px-3 py-1 text-sm rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(art._id)}
                    className="flex-1 px-3 py-1 text-sm rounded bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
