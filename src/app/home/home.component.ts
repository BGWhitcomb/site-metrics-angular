import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  showCharts = false;

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
        data: [65, 59, 80, 81, 56],
        label: 'Inspections',

        backgroundColor: 'rgba(40, 167, 69, 0.5)',
        borderColor: 'rgb(40, 167, 69)'
      },
      {
        data: [28, 48, 40, 19, 25],
        label: 'Repairs',
        backgroundColor: 'rgba(13, 110, 253, 0.5)',
        borderColor: 'rgb(13, 110, 253)'

      },
      {
        data: [3, 1, 6, 8, 2],
        label: 'Bad Orders',
        backgroundColor: 'rgba(220, 53, 69, 0.5)',
        borderColor: 'rgb(220, 53, 69)'
      }
    ]
  };
  // Add pie chart configuration
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

  public pieChartData: ChartData<'pie'> = {
    labels: ['Inspections', 'Repairs', 'Bad Orders'],
    datasets: [{
      data: [56, 25, 2],
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
  

  constructor() { }

  ngOnInit(): void { }
}