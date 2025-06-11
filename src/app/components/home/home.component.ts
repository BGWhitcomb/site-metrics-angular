import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { HomeService } from './home.service';
import { InboundRailcar } from '../railcar-inspection/models/inbound-railcar';
import { BadOrderedRailcar } from '../railcar-inspection/models/bad-ordered-railcar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  showCharts = false;
  inspections: InboundRailcar[] = [];
  badOrders: BadOrderedRailcar[] = [];
  loading = false;
  errorMessage = '';


  // add real data here 
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public barChartData: ChartData<'bar'> = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        data: [],
        label: 'Inspections',
        backgroundColor: 'rgba(40, 167, 69, 0.5)',
        borderColor: 'rgb(40, 167, 69)'
      },
      {
        data: [],
        label: 'Repairs',
        backgroundColor: 'rgba(13, 110, 253, 0.5)',
        borderColor: 'rgb(13, 110, 253)'
      },
      {
        data: [],
        label: 'Bad Orders',
        backgroundColor: 'rgba(220, 53, 69, 0.5)',
        borderColor: 'rgb(220, 53, 69)'
      }
    ]
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  pieChartData: { labels: string[]; datasets: { data: number[]; backgroundColor: string[]; borderColor: string[]; }[]; } = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: []
    }]
  };
  constructor(private homeService: HomeService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.clearMessages();

    this.homeService.getAllInspections().subscribe({
      next: (data) => {
        this.inspections = data;
        const months = this.getLastMonths(5);
        const inspectionCounts = this.getMonthlyCounts(data, 'inspectedDate');
        const repairCounts = this.getMonthlyCounts(data, 'repaired');
        const badOrderCounts = this.getMonthlyCounts(data, 'badOrdered');

        // Update bar chart
        this.barChartData = {
          labels: months.map(m => {
            const [year, month] = m.split('-');
            return `${year}-${month}`;
          }),
          datasets: [
            {
              data: inspectionCounts,
              label: 'Inspections',
              backgroundColor: 'rgba(40, 167, 69, 0.5)',
              borderColor: 'rgb(40, 167, 69)'
            },
            {
              data: repairCounts,
              label: 'Repairs',
              backgroundColor: 'rgba(13, 110, 253, 0.5)',
              borderColor: 'rgb(13, 110, 253)'
            },
            {
              data: badOrderCounts,
              label: 'Bad Orders',
              backgroundColor: 'rgba(220, 53, 69, 0.5)',
              borderColor: 'rgb(220, 53, 69)'
            }
          ]
        };

        // Pie chart for current month
        const currentMonth = months[months.length - 1];
        const inspectionsThisMonth = inspectionCounts[inspectionCounts.length - 1];
        const repairsThisMonth = repairCounts[repairCounts.length - 1];
        const badOrdersThisMonth = badOrderCounts[badOrderCounts.length - 1];

        this.pieChartData = {
          labels: ['Inspections', 'Repairs', 'Bad Orders'],
          datasets: [{
            data: [inspectionsThisMonth, repairsThisMonth, badOrdersThisMonth],
            backgroundColor: [
              'rgba(40, 167, 69, 0.8)',
              'rgba(13, 110, 253, 0.8)',
              'rgba(220, 53, 69, 0.8)'
            ],
            borderColor: [
              'rgb(40, 167, 69)',
              'rgb(13, 110, 253)',
              'rgb(220, 53, 69)'
            ]
          }]
        };

        this.showCharts = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading inspections:', error);
        this.errorMessage = 'Failed to load dashboard data';
        this.loading = false;
        this.showCharts = false;
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage = '';
  }

  retryLoadData(): void {
    this.clearMessages();
    this.loadDashboardData();
  }

  private getMonthlyCounts(items: InboundRailcar[], field: 'inspectedDate' | 'repaired' | 'badOrdered'): number[] {
    // Get the last 5 months (including current)
    const months = this.getLastMonths(5);
    const counts = months.map(month => {
      return items.filter(item => {
        const date = new Date(item.inspectedDate);
        const itemMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (field === 'inspectedDate') {
          return itemMonth === month;
        } else if (field === 'repaired') {
          return itemMonth === month && item.isRepaired;
        } else if (field === 'badOrdered') {
          return itemMonth === month && item.badOrdered;
        }
        return false;
      }).length;
    });
    return counts;
  }

  private getLastMonths(count: number): string[] {
    const months: string[] = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`);
    }
    return months;
  }
}