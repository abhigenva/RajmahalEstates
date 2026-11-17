import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "Jaipur",
    address: "",
    type: "Residential",
    category: "Sale",
    bedrooms: "3",
    bathrooms: "2",
    area: "",
    imageUrl: "",
    amenities: "Parking, 24/7 Security, Power Backup",
    agentName: "",
    agentPhone: "",
    agentEmail: user?.email || "",
  });

  // Real-time listener for logged-in agent's properties
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "properties"), where("agentId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMyListings(items);
    });
    return () => unsubscribe();
  }, [user]);

  // Add this helper function inside Dashboard.jsx or at the top of the file
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file selection or drag and drop
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) { // 2MB limit recommended for Firestore doc size
        alert("Please choose an image under 2MB for optimal performance.");
        return;
      }
      try {
        const base64String = await convertFileToBase64(file);
        setImagePreview(base64String);
        setFormData((prev) => ({ ...prev, imageUrl: base64String }));
      } catch (err) {
        console.error("Error converting file:", err);
      }
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "properties"), {
        ...formData,
        price: Number(formData.price),
        area: Number(formData.area),
        bedrooms: formData.type === "Residential" ? Number(formData.bedrooms) : 0,
        bathrooms: formData.type === "Residential" ? Number(formData.bathrooms) : 0,
        amenities: formData.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        agentId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Reset property-specific fields while keeping agent info
      setFormData((prev) => ({
        ...prev,
        title: "",
        description: "",
        price: "",
        address: "",
        area: "",
        imageUrl: "",
      }));
    } catch (err) {
      alert("Error adding property: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    await deleteDoc(doc(db, "properties", id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Agent Dashboard</h1>
        <p className="text-sm text-slate-500">Logged in as {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Add Property Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleAddProperty}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
          >
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" /> List New Property
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Title *</label>
              <input
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Luxury 3BHK Villa in Vaishali Nagar"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="Jaipur">Jaipur</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹) *</label>
                <input
                  name="price"
                  type="number"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="8500000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="Residential">Residential</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="Sale">Sale</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Area (SqFt) *</label>
                <input
                  name="area"
                  type="number"
                  required
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="1800"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              {formData.type === "Residential" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Beds</label>
                    <input
                      name="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Baths</label>
                    <input
                      name="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Address / Locality</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Sector 4, Vaishali Nagar"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Image *</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition bg-slate-50 relative">
                {imagePreview ? (
                  <div className="relative h-40 w-full rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setFormData((prev) => ({ ...prev, imageUrl: "" }));
                      }}
                      className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded-md"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <span className="text-sm font-medium text-slate-700 block mb-1">
                      Drag & drop property image here, or <span className="text-blue-600 underline">browse</span>
                    </span>
                    <span className="text-xs text-slate-400">Supports PNG, JPG, WEBP (Max 2MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amenities (comma separated)
              </label>
              <input
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe key features, nearby landmarks, facing..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase">Agent Contact Details</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="agentName"
                  required
                  value={formData.agentName}
                  onChange={handleChange}
                  placeholder="Your Name *"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  name="agentPhone"
                  required
                  value={formData.agentPhone}
                  onChange={handleChange}
                  placeholder="Phone (+91...) *"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition"
            >
              {submitting ? "Publishing..." : "Publish Property Live"}
            </button>
          </form>
        </div>

        {/* Agent's Active Listings */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              My Active Listings ({myListings.length})
            </h2>

            {myListings.length === 0 ? (
              <p className="text-sm text-slate-500 py-10 text-center">
                You haven’t listed any properties yet. Use the form on the left to publish your first listing.
              </p>
            ) : (
              <div className="space-y-4">
                {myListings.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.imageUrl ||
                          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=60"
                        }
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-500">
                          {item.city} • {item.type} ({item.category}) • ₹
                          {Number(item.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        to={`/property/${item.id}`}
                        className="p-2 text-slate-600 hover:text-blue-600 bg-slate-100 rounded-lg"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 bg-slate-100 rounded-lg"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}