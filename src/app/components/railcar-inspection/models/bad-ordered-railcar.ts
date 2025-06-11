export interface BadOrderedRailcar {
    orderDate: string | number | Date;
    status: any;
    reason: any;
    location: string;
    badOrderId?: number;
    carMark: string;
    carNumber: number;
    badOrderDate: string;
    badOrderDescription: string;
    isActive: boolean;
    repairedDate?: string;
}

