import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Share2,
  Check,
  Phone,
  Mail,
  ArrowLeft,
  Building,
  CheckCircle2,
} from "lucide-react";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docRef = doc(db, "properties", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error loading property:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property in ${property.city}: ${property.title}`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if user cancels or fails
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Property Not Found</h2>
        <p className="text-slate-500 mb-6">This listing may have been removed or sold.</p>
        <Link to="/" className="text-blue-600 font-semibold hover:underline">
          ← Back to all listings
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(property.price);

  const whatsappLink = `https://wa.me/${property.agentPhone?.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi ${property.agentName}, I am interested in "${property.title}" listed on EstateFlow (${window.location.href}).`
  )}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Share Property</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Image */}
      <div className="rounded-2xl overflow-hidden bg-slate-200 h-[320px] sm:h-[460px] mb-8 shadow-sm">
        <img
          src={
            property.imageUrl ||
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
          }
          alt={property.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                For {property.category}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                {property.type}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{property.title}</h1>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 shrink-0">
                {formattedPrice}
                {property.category === "Rent" && <span className="text-sm font-normal">/mo</span>}
              </p>
            </div>

            <p className="text-slate-500 flex items-center gap-1.5 text-sm mb-6">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              {property.address ? `${property.address}, ` : ""}
              {property.city}
            </p>

            {/* Key Specs */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 mb-6">
              {property.type === "Residential" ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <BedDouble className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-400">Bedrooms</p>
                      <p className="font-bold text-slate-800">{property.bedrooms || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Bath className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-400">Bathrooms</p>
                      <p className="font-bold text-slate-800">{property.bathrooms || "N/A"}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2.5 col-span-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-400">Zoning / Usage</p>
                    <p className="font-bold text-slate-800">{property.type} Property</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <Maximize className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-400">Total Area</p>
                  <p className="font-bold text-slate-800">{property.area} sq.ft</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <h3 className="text-lg font-bold text-slate-900 mb-2">About This Property</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-6">
              {property.description}
            </p>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Amenities & Highlights</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {property.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Agent Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 sticky top-24 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Listing Agent
            </p>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-lg">
                {property.agentName?.charAt(0) || "A"}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{property.agentName}</h4>
                <p className="text-xs text-slate-500">Verified EstateFlow Partner</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              {property.agentPhone && (
                <a
                  href={`tel:${property.agentPhone}`}
                  className="flex items-center gap-2.5 text-slate-700 hover:text-blue-600"
                >
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{property.agentPhone}</span>
                </a>
              )}
              {property.agentEmail && (
                <a
                  href={`mailto:${property.agentEmail}`}
                  className="flex items-center gap-2.5 text-slate-700 hover:text-blue-600"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{property.agentEmail}</span>
                </a>
              )}
            </div>

            <div className="space-y-2.5">
              {property.agentPhone && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition"
                >
                  Chat on WhatsApp
                </a>
              )}
              <a
                href={`mailto:${property.agentEmail}?subject=Inquiry: ${property.title}`}
                className="w-full block text-center py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition"
              >
                Send Email Inquiry
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}