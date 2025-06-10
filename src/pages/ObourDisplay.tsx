import { LOCATIONS } from "@/lib/mqtt";
import GarageDisplay from "../components/GarageDisplay";

export default function ObourDisplay() {
  return <GarageDisplay TOPICS={LOCATIONS.OBOUR.topics} />;
}
