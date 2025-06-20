import { InboundRailcar } from "./inbound-railcar";

export interface InspectionQueue {
    new: InboundRailcar[];
    modified: InboundRailcar[];
}
