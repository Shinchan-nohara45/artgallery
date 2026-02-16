import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Heart, Package, Upload } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Simple Alert Component (or use Shadcn's if available, using native alert for speed)
const confirmDelete = (onConfirm) => {
  if (window.confirm("Are you sure you want to delete this artwork?")) {
    onConfirm();
  }
};

const Profile = () => {
  const { currentUser } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', price: '', category: '', description: '' });

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const [artRes, ordRes, favRes] = await Promise.all([
            axios.get(`/api/artworks/user/${currentUser._id}`),
            axios.get(`/api/orders/myorders`),
            axios.get(`/api/users/favorites`)
          ]);
          setArtworks(artRes.data);
          setOrders(ordRes.data);
          setFavorites(favRes.data);
        } catch (error) {
          console.error("Error fetching profile data:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [currentUser]);

  const handleDeleteArtwork = async (id) => {
    confirmDelete(async () => {
      try {
        await axios.delete(`/api/artworks/${id}`);
        setArtworks(artworks.filter(art => art._id !== id));
      } catch (error) {
        console.error("Failed to delete artwork:", error);
        alert("Failed to delete artwork");
      }
    });
  };

  const removeFromFavorites = async (id) => {
      try {
          await axios.delete(`/api/users/favorites/${id}`);
          setFavorites(favorites.filter(fav => fav._id !== id));
      } catch (error) {
          console.error("Error removing favorite:", error);
      }
  };

  const handleEditClick = (art) => {
      setEditingArtwork(art);
      setEditForm({
          title: art.title,
          price: art.price,
          category: art.category,
          description: art.description || ''
      });
  };

  const handleUpdateArtwork = async () => {
      if (!editingArtwork) return;
      
      try {
          await axios.put(`/api/artworks/${editingArtwork._id}`, {
              ...editForm,
              category: editForm.category.toLowerCase()
          });
          
          setArtworks(artworks.map(art => 
              art._id === editingArtwork._id ? { ...art, ...editForm } : art
          ));
          setEditingArtwork(null);
          alert("Artwork updated successfully");
      } catch (error) {
          console.error("Update error:", error);
          alert("Failed to update artwork");
      }
  };

  if (!currentUser) return <div className="p-8 text-center">Loading user data...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 mb-12 bg-white p-8 rounded-2xl shadow-sm border border-orange-100">
        <img
          src={currentUser.photoURL || currentUser.profilePicture || "https://github.com/shadcn.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
        />
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-playfair font-bold text-gray-900">{currentUser.displayName || currentUser.name}</h1>
          <p className="text-gray-500 font-medium">{currentUser.email}</p>
          <p className="mt-4 text-gray-600 max-w-lg leading-relaxed">{currentUser.bio || "Entymologist. Artist. Collector."}</p>
          {currentUser.isAdmin && (
            <span className="inline-block mt-3 px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider rounded-full">
              Admin
            </span>
          )}
        </div>
      </div>

      <Tabs defaultValue="uploads" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100/50 p-1 rounded-xl">
          <TabsTrigger value="uploads" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 font-medium">
             <Upload className="w-4 h-4 mr-2" /> Manage Uploads
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 font-medium">
             <Package className="w-4 h-4 mr-2" /> My Orders
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-2 font-medium">
             <Heart className="w-4 h-4 mr-2" /> Favorites
          </TabsTrigger>
        </TabsList>

        {/* MANAGE UPLOADS CONTENT */}
        <TabsContent value="uploads">
          {artworks.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">You haven't uploaded any artworks yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((art) => (
                <div key={art._id} className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img 
                      src={art.imageUrl} 
                      alt={art.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                             <h3 className="font-playfair font-bold text-lg text-gray-900 truncate pr-4">{art.title}</h3>
                             <p className="text-sm text-gray-500 capitalize">{art.category}</p>
                        </div>
                        <p className="font-bold text-orange-500">${art.price}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600">Stock: {art.stock}</span>
                        <div className="flex space-x-2">
                             <Dialog>
                                <DialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={() => handleEditClick(art)}
                                    >
                                        Edit
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Artwork</DialogTitle>
                                        <DialogDescription>
                                            Make changes to your artwork here. Click save when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="title" className="text-right">Title</Label>
                                            <Input id="title" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="price" className="text-right">Price</Label>
                                            <Input id="price" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="category" className="text-right">Category</Label>
                                            <Input id="category" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="col-span-3" />
                                        </div>
                                         <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="description" className="text-right">Description</Label>
                                            <Textarea id="description" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="col-span-3" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={handleUpdateArtwork}>Save changes</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteArtwork(art._id)}
                            >
                                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                            </Button>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* MY ORDERS CONTENT */}
        <TabsContent value="orders">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">No orders found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-6 text-sm">
                        <div>
                            <p className="text-gray-500 mb-1">Order Placed</p>
                            <p className="font-medium text-gray-900">{order.createdAt ? format(new Date(order.createdAt), 'PPP p') : 'N/A'}</p>
                        </div>
                         <div>
                            <p className="text-gray-500 mb-1">Total</p>
                            <p className="font-medium text-gray-900 ml-1">${order.totalPrice}</p>
                        </div>
                         <div>
                            <p className="text-gray-500 mb-1">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.isDelivered ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {order.isDelivered ? "Delivered" : "Processing"}
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">#{order._id}</p>
                  </div>
                  
                  <div className="p-4 sm:p-6 space-y-4">
                    {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4"> 
                            <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-gray-100" />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                                <p className="text-sm text-gray-500">Qty: {item.qty} × ${item.price}</p>
                            </div>
                        </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

         {/* FAVORITES CONTENT */}
         <TabsContent value="favorites">
          {favorites.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">No favorites yet. Go explore!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((art) => (
                <div key={art._id} className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img 
                      src={art.imageUrl} 
                      alt={art.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <button 
                        onClick={() => removeFromFavorites(art._id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 transition-colors"
                        title="Remove from favorites"
                    >
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-playfair font-bold text-lg text-gray-900 truncate">{art.title}</h3>
                     <p className="text-sm text-gray-500 capitalize mb-2">{art.category}</p>
                    <p className="font-bold text-orange-500">${art.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
