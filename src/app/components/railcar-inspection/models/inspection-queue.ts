import { BadOrderedRailcar, InboundRailcar } from "./inspections";

export interface InspectionQueue {
    new: InboundRailcar[];
    modified: InboundRailcar[];
}

export interface BadOrderQueue {
    new: BadOrderedRailcar[];
    modified: BadOrderedRailcar[];
}
