import React from "react";
import { Hero } from "./Hero";
import { Categories } from "./Categories";
import { NewArrivals } from "./NewArrivals";
import { FeaturedCollection } from "./FeaturedCollection";
import { FeaturesBar } from "./FeaturesBar";

export const Home = () => {
  return (
    <div className="space-y-0">
      <Hero />
      <Categories />
      <NewArrivals />
      <FeaturedCollection />
      <FeaturesBar />
    </div>
  );
};
