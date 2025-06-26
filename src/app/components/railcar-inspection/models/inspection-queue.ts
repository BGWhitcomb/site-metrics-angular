import { BadOrderedRailcar, InboundRailcar } from "./inspections";

export interface InspectionQueue {
    new: InboundRailcar[];
    modified: InboundRailcar[];
}

// will track edited bad orders?
export interface BadOrderQueue {
    new: BadOrderedRailcar[];
    modified: BadOrderedRailcar[];
}
