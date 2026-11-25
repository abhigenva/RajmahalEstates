import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, Maximize, ArrowUpRight, Images } from "lucide-react";

export default function PropertyCard({ property }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };
  const coverImage =
    property.images?.[0] ||
    property.imageUrl ||
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";

  const photoCount = Array.isArray(property.images) ? property.images.length : property.imageUrl ? 1 : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">
      <div className="relative h-52 overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={coverImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />

        {photoCount > 1 && (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900/80 text-white backdrop-blur-sm flex items-center gap-1">
            <Images className="w-3.5 h-3.5" /> {photoCount}
          </span>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900/80 dark:bg-blue-600 text-white dark:text-slate-900 backdrop-blur-sm">
            {property.type}
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-600 text-white dark:text-slate-900">
            For {property.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {formatPrice(property.price)}
              {property.category === "Rent" && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/mo</span>
              )}
            </h3>
          </div>

          <h4 className="font-semibold text-slate-800 dark:text-white line-clamp-1 mb-1">{property.title}</h4>

          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{property.city}</span>
          </p>
        </div>

        <div>
          <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 mb-4">
            {property.type === "Residential" && (
              <>
                <span className="flex items-center gap-1">
                  <BedDouble className="w-4 h-4 text-slate-400" /> {property.bedrooms || 0} Beds
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-slate-400" /> {property.bathrooms || 0} Baths
                </span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Maximize className="w-4 h-4 text-slate-400" /> {property.area} sq.ft
            </span>
          </div>

          <Link
            to={`/property/${property.id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white dark:text-slate-900 text-sm font-medium rounded-lg transition"
          >
            View Details <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}