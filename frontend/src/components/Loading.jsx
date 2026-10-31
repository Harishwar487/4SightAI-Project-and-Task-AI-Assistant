
import { LoaderCircle } from "lucide-react";

export default function Loading({ message = "Loading, please wait..." }) {
  return (
    <div className="loading-container">
      <LoaderCircle className="loading-spinner" size={32} />
      <p>{message}</p>
    </div>
  );
}
