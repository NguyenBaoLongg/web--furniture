import React from "react";
import { Hero } from "./Hero";
import { Categories } from "./Categories";
import { NewArrivals } from "./NewArrivals";
import { FeaturedCollection } from "./FeaturedCollection";
import { FeaturesBar } from "./FeaturesBar";
import { Rooms } from "./Rooms";

export const Home = () => {
  return (
    <div className="space-y-0">
      <Hero />
      <Categories />
      <Rooms />
      <NewArrivals />
      <FeaturedCollection />
      <FeaturesBar />
    </div>
  );
};
