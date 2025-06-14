export interface InboundRailcar {
    inboundId?: number;
    carMark: string;
    carNumber: string | number;
    isRepaired: boolean;
    repairDescription?: string;
    isEmpty: boolean;
    inspectedDate: string;
    badOrdered: boolean; // Creates badOrderedRailcar property if true
    badOrderedRailcar?: {
        badOrderId?: number;
        carMark: string;
        carNumber: string | number;
        badOrderDate: string;
        badOrderDescription: string;
        isActive: boolean; // the bad order that is active on the list for repair
        repairedDate?: string; // When not null, isActive becomes false
    };
}
