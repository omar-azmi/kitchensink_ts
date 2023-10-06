import { InvertibleMap, TopologicalAsyncScheduler } from "../src/collections.ts"

const edges = new InvertibleMap<string, string>()
edges.add("A", "D", "H")
edges.add("B", "E")
edges.add("C", "F", "E")
edges.add("D", "E", "G")
edges.add("E", "G")
edges.add("F", "E", "I")
edges.add("G", "H")

const scheduler = new TopologicalAsyncScheduler(edges)
scheduler.fire("A", "C", "B")
scheduler.resolve("A", "B")
edges.radd("J", "A", "B", "E", "H") // ISSUE: dependencies/dependants added during a firing cycle AND their some of their dependencies have already been resolved, will lead to forever unresolved newly added depenant
