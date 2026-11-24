export default function Logo({ className = "w-8 h-8" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="#2563EB" />
      <path
        d="M11 28V16.5L20 10L29 16.5V28H23.5V21.5H16.5V28H11Z"
        fill="white"
      />
      <path d="M18 15.5H22V18.5H18V15.5Z" fill="#2563EB" />
    </svg>
  );
}