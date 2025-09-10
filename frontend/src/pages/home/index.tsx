import { homeViewAtom } from "@main";
import { useAtom } from "jotai";
import { useSetTitle } from "@lib/hooks";
import { lazy } from "react";

const Dashboard = lazy(() => import("./dashboard"));
const AllResources = lazy(() => import("./all_resources"));
const Tree = lazy(() => import("./tree"));
const Overview = lazy(() => import("./overview"));

export default function Home() {
  useSetTitle();
  const [view] = useAtom(homeViewAtom);
  switch (view) {
    case "Dashboard":
      return <Dashboard />;
    case "Resources":
      return <AllResources />;
    case "Tree":
      return <Tree />;
    case "Overview":
      return <Overview />;
  }
}
