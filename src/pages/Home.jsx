import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import PropertyCard from "../components/PropertyCard";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";

const CITIES = ["All", "Jaipur", "Mumbai", "Bangalore", "Delhi", "Pune"];
const TYPES = ["All", "Residential", "Plot", "Commercial"];
const CATEGORIES = ["All", "Sale", "Rent"];

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProperties(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching properties:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const processedProperties = properties
  .filter((item) => {
    // 1. Keyword Search (Title, City, or Address)
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch =
      !queryLower ||
      item.title?.toLowerCase().includes(queryLower) ||
      item.city?.toLowerCase().includes(queryLower) ||
      item.address?.toLowerCase().includes(queryLower);

    // 2. Dropdown Filters
    const matchesCity = selectedCity === "All" || item.city === selectedCity;
    const matchesType = selectedType === "All" || item.type === selectedType;
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;

    // 3. Price Range Filter
    const itemPrice = Number(item.price) || 0;
    const matchesMinPrice = !minPrice || itemPrice >= Number(minPrice);
    const matchesMaxPrice = !maxPrice || itemPrice <= Number(maxPrice);

    // 4. Bedroom Filter (Applies only if Residential or a specific count is chosen)
    const matchesBeds =
      minBedrooms === "All" ||
      (item.type === "Residential" && Number(item.bedrooms) >= Number(minBedrooms));

    return (
      matchesSearch &&
      matchesCity &&
      matchesType &&
      matchesCategory &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesBeds
    );
  })
  .sort((a, b) => {
    if (sortBy === "price-asc") {
      return (Number(a.price) || 0) - (Number(b.price) || 0);
    }
    if (sortBy === "price-desc") {
      return (Number(b.price) || 0) - (Number(a.price) || 0);
    }
    if (sortBy === "area-desc") {
      return (Number(b.area) || 0) - (Number(a.area) || 0);
    }
    // Default: "newest" (preserves Firestore createdAt desc order)
    return 0;
  });

const resetFilters = () => {
  setSearchQuery("");
  setSelectedCity("All");
  setSelectedType("All");
  setSelectedCategory("All");
  setMinPrice("");
  setMaxPrice("");
  setMinBedrooms("All");
  setSortBy("newest");
};

  return (
    <div>
      {/* Hero & Search Section */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Find Your Next Home, Plot, or Commercial Space
          </h1>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Browse verified real-time listings across India’s top growing cities directly from certified agents.
          </p>

          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-2xl shadow-xl text-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Search title, locality, landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2.5 bg-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Cities" : c}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2.5 bg-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "Property Type" : t}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 bg-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "Buy / Rent" : `For ${cat}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* City Quick Links */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Explore Cities:
          </span>
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCity === city
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-blue-400"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Advanced Filters & Sort Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-4 h-4" /> Filters:
            </span>

            {/* Min Price */}
            <input
              type="number"
              placeholder="Min Price (₹)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-36 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Max Price */}
            <input
              type="number"
              placeholder="Max Price (₹)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-36 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Bedrooms (Only active when Type is All or Residential) */}
            <select
              value={minBedrooms}
              disabled={selectedType === "Plot" || selectedType === "Commercial"}
              onChange={(e) => setMinBedrooms(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
            >
              <option value="All">Any BHK</option>
              <option value="1">1+ BHK</option>
              <option value="2">2+ BHK</option>
              <option value="3">3+ BHK</option>
              <option value="4">4+ BHK</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 px-2 py-1.5 transition"
            >
              Clear All
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-semibold text-slate-500">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-desc">Largest Area (SqFt)</option>
            </select>
          </div>
        </div>

        {/* Listings Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            Available Properties ({processedProperties.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-slate-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : processedProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-lg font-medium">No properties match your filters.</p>
            <button
              onClick={resetFilters}
              className="mt-4 text-blue-600 font-semibold text-sm hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}