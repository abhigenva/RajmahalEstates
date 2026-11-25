import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, Pencil, Trash2, ExternalLink, ShieldAlert, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const compressImageToBase64 = (file, maxWidth = 1000, quality = 0.7) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

const INITIAL_FORM = (email = "") => ({
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
  images:[],
  amenities: "Parking, 24/7 Security, Power Backup",
  agentName: "",
  agentPhone: "",
  agentEmail: email,
});

const convertFileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default function Dashboard() {
  const { user, isSuperAgent } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState(() => INITIAL_FORM(user?.email || ""));

  // Real-time listener: Super Agent sees ALL properties; regular agents see only their own
  useEffect(() => {
    if (!user) return;
    const q = isSuperAgent
      ? query(collection(db, "properties"), orderBy("createdAt", "desc"))
      : query(collection(db, "properties"), where("agentId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setListings(items);
    });
    return () => unsubscribe();
  }, [user, isSuperAgent]);

  // Auto-trigger edit mode if redirected from /property/:id?edit=<id>
  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (editParam && listings.length > 0 && !editingId) {
      const target = listings.find((item) => item.id === editParam && item.agentId === user?.uid);
      if (target) {
        startEditing(target);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, listings, user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 5 - formData.images.length;
    if (remainingSlots <= 0) {
      alert("Maximum 5 images allowed per property.");
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      alert(`Only ${remainingSlots} more image(s) can be added (max 5 total).`);
    }

    try {
      const compressedList = await Promise.all(
        filesToProcess.map((file) => compressImageToBase64(file))
      );
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...compressedList],
      }));
    } catch (err) {
      console.error("Error compressing images:", err);
      alert("Failed to process one or more images.");
    }
    e.target.value = ""; // Reset input so the same file can be re-selected if removed
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const startEditing = (property) => {
    // Guard: only the owner can edit
    const existingImages =
      Array.isArray(property.images) && property.images.length > 0
        ? property.images
        : property.imageUrl
        ? [property.imageUrl]
        : [];
    if (property.agentId !== user.uid) return;
    setEditingId(property.id);
    setImagePreview(property.imageUrl || "");
    setFormData({
      title: property.title || "",
      description: property.description || "",
      price: String(property.price || ""),
      city: property.city || "Jaipur",
      address: property.address || "",
      type: property.type || "Residential",
      category: property.category || "Sale",
      bedrooms: String(property.bedrooms || "3"),
      bathrooms: String(property.bathrooms || "2"),
      area: String(property.area || ""),
      imageUrl: property.imageUrl || "",
      images: existingImages,
      amenities: Array.isArray(property.amenities) ? property.amenities.join(", ") : "",
      agentName: property.agentName || "",
      agentPhone: property.agentPhone || "",
      agentEmail: property.agentEmail || user?.email || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setImagePreview("");
    setFormData(INITIAL_FORM(user?.email || ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      imageUrl: formData.images[0] || "",
      price: Number(formData.price),
      area: Number(formData.area),
      bedrooms: formData.type === "Residential" ? Number(formData.bedrooms) : 0,
      bathrooms: formData.type === "Residential" ? Number(formData.bathrooms) : 0,
      amenities: formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        // Update existing listing
        await updateDoc(doc(db, "properties", editingId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        setEditingId(null);
      } else {
        // Create new listing
        await addDoc(collection(db, "properties"), {
          ...payload,
          agentId: user.uid,
          createdAt: serverTimestamp(),
        });
      }
      setImagePreview("");
      setFormData(INITIAL_FORM(user?.email || ""));
    } catch (err) {
      alert("Error saving property: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const isOwner = item.agentId === user.uid;
    const msg = isOwner
      ? "Are you sure you want to delete your listing?"
      : `Super Agent Action: Delete "${item.title}" posted by ${item.agentName || item.agentEmail}?`;
    if (!window.confirm(msg)) return;

    try {
      await deleteDoc(doc(db, "properties", item.id));
      if (editingId === item.id) cancelEditing();
    } catch (err) {
      alert("Error deleting listing: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agent Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Logged in as {user?.email}</p>
        </div>

        {isSuperAgent && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <ShieldAlert className="w-4 h-4" /> Super Agent Moderation Mode Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Add / Edit Property Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {editingId ? (
                  <>
                    <Pencil className="w-5 h-5 text-amber-500" /> Edit Property
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5 text-blue-600" /> List New Property
                  </>
                )}
              </h2>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" /> Cancel Edit
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Property Title *
              </label>
              <input
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
                >
                  <option value="Jaipur">Jaipur</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Price (₹) *
                </label>
                <input
                  name="price"
                  type="number"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Property Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
                >
                  <option value="Residential">Residential</option>
                  <option value="Plot">Plot</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Listing Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
                >
                  <option value="Sale">Sale</option>
                  <option value="Rent">Rent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Area (SqFt) *
                </label>
                <input
                  name="area"
                  type="number"
                  required
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
                />
              </div>

              {formData.type === "Residential" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Beds
                    </label>
                    <input
                      name="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Baths
                    </label>
                    <input
                      name="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Address / Locality
              </label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
              />
            </div>

            {/* Multi-Image Uploader (Up to 5 Images) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Property Images ({formData.images.length}/5)
                </label>
                {formData.images.length > 0 && (
                  <span className="text-[11px] text-slate-400">First image is the cover photo</span>
                )}
              </div>

              {/* Thumbnail Grid of Uploaded Images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                  {formData.images.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="relative h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group"
                    >
                      <img src={imgSrc} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-slate-900/80 hover:bg-red-600 text-white p-1 rounded-md transition"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add More Dropzone (Hidden once 5 images are added) */}
              {formData.images.length < 5 && (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500 transition">
                  <label className="cursor-pointer block">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Click to select or drag & drop images ({5 - formData.images.length} remaining)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Select multiple files at once • Auto-optimized for fast loading
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amenities (comma separated)
              </label>
              <input
                name="amenities"
                value={formData.amenities}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase">Agent Contact Details</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="agentName"
                  required
                  value={formData.agentName}
                  onChange={handleChange}
                  placeholder="Your Name *"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
                />
                <input
                  name="agentPhone"
                  required
                  value={formData.agentPhone}
                  onChange={handleChange}
                  placeholder="Phone (+91...) *"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2.5 text-white font-semibold rounded-xl text-sm transition ${
                editingId ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting
                ? "Saving..."
                : editingId
                ? "Save Property Changes"
                : "Publish Property Live"}
            </button>
          </form>
        </div>

        {/* Listings Management List */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {isSuperAgent
                ? `All Platform Listings (${listings.length})`
                : `My Active Listings (${listings.length})`}
            </h2>

            {listings.length === 0 ? (
              <p className="text-sm text-slate-500 py-10 text-center">No properties found.</p>
            ) : (
              <div className="space-y-4">
                {listings.map((item) => {
                  const isOwner = item.agentId === user.uid;
                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition ${
                        editingId === item.id
                          ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
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
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                              {item.title}
                            </h4>
                            {isSuperAgent && !isOwner && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                Agent: {item.agentName || item.agentEmail}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.city} • {item.type} ({item.category}) • ₹
                            {Number(item.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          to={`/property/${item.id}`}
                          className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 rounded-lg"
                          title="View Public Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Edit button ONLY appears for the agent who owns the listing */}
                        {isOwner && (
                          <button
                            onClick={() => startEditing(item)}
                            className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 bg-slate-100 dark:bg-slate-800 rounded-lg"
                            title="Edit Listing"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete button appears for owner OR Super Agent */}
                        {(isOwner || isSuperAgent) && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 bg-slate-100 dark:bg-slate-800 rounded-lg"
                            title={isOwner ? "Delete Listing" : "Super Agent: Remove Unverified Listing"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}