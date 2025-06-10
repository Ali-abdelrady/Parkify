import { Button } from "@/components/ui/button";
import { CarFront } from "lucide-react";
import { Link } from "react-router-dom";

export default function ScreensSelector() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="container mx-auto flex flex-col items-center gap-5">
        <Button asChild>
          <Link to={"/obour"}>Enter Obour Screen</Link>
        </Button>
        <Button asChild>
          <Link to={"/banha"} className="">
            Enter Banha Screen
          </Link>
        </Button>
      </div>
    </div>
  );
}
