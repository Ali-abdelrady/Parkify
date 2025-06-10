import React from "react";
import GarageDisplay from "../components/GarageDisplay";
import { LOCATIONS } from "@/lib/mqtt";

export default function BanhaDisplay() {
  return <GarageDisplay TOPICS={LOCATIONS.BANHA.topics} />;
}
