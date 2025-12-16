import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  stats = [
    {
      title: 'Vendas Hoje',
      value: 'R$ 8.450',
      trend: '↑ 12% vs ontem',
      trendClass: 'text-green-600'
    },
    {
      title: 'Produtos Vendidos',
      value: '234',
      trend: '↑ 8% vs ontem',
      trendClass: 'text-green-600'
    },
    {
      title: 'Ticket Médio',
      value: 'R$ 45,20',
      trend: '↓ 3% vs ontem',
      trendClass: 'text-red-600'
    },
    {
      title: 'Clientes',
      value: '187',
      trend: '↑ 15% vs ontem',
      trendClass: 'text-green-600'
    }
  ];
}
