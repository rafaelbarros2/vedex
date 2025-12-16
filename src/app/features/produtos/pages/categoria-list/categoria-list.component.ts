import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Categoria, CategoriaFiltros } from '../../../../shared/models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './categoria-list.component.html',
  styleUrl: './categoria-list.component.css'
})
export class CategoriaListComponent implements OnInit {
  categorias = signal<Categoria[]>([]);
  categoriasSelecionadas = signal<Categoria[]>([]);

  // Filtros
  filtros = signal<CategoriaFiltros>({
    busca: '',
    status: 'todos'
  });

  statusOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ativo', value: 'ativo' },
    { label: 'Inativo', value: 'inativo' }
  ];

  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.carregarCategorias();
  }

  carregarCategorias() {
    this.categoriaService.listarTodasAPI().subscribe({
      next: (categorias) => {
        const categoriasFiltradas = this.aplicarFiltrosLocais(categorias);
        this.categorias.set(categoriasFiltradas);
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as categorias. Verifique se o backend está rodando.'
        });
        this.categorias.set([]);
      }
    });
  }

  aplicarFiltrosLocais(categorias: Categoria[]): Categoria[] {
    let categoriasFiltradas = categorias;
    const filtros = this.filtros();

    // Filtro de busca
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      categoriasFiltradas = categoriasFiltradas.filter(c =>
        c.nome.toLowerCase().includes(busca) ||
        c.descricao?.toLowerCase().includes(busca)
      );
    }

    // Filtro de status
    if (filtros.status && filtros.status !== 'todos') {
      categoriasFiltradas = categoriasFiltradas.filter(c =>
        c.ativo === (filtros.status === 'ativo')
      );
    }

    return categoriasFiltradas;
  }

  aplicarFiltros() {
    this.carregarCategorias();
  }

  limparFiltros() {
    this.filtros.set({
      busca: '',
      status: 'todos'
    });
    this.carregarCategorias();
  }

  novaCategoria() {
    this.router.navigate(['/categorias/novo']);
  }

  editarCategoria(id: number) {
    this.router.navigate(['/categorias', id]);
  }

  verCategoria(id: number) {
    this.router.navigate(['/categorias', id]);
  }

  excluirCategoria(categoria: Categoria, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja realmente excluir a categoria "${categoria.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.categoriaService.excluirAPI(categoria.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria excluída com sucesso'
            });
            this.carregarCategorias();
          },
          error: (error) => {
            console.error('Erro ao excluir categoria:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: error.error?.message || 'Erro ao excluir categoria'
            });
          }
        });
      }
    });
  }
}
