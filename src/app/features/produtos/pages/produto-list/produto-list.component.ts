import { Component, signal, computed, OnInit } from '@angular/core';
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
import { Produto, ProdutoFiltros } from '../../../../shared/models/produto.model';
import { ProdutoService } from '../../services/produto.service';

@Component({
  selector: 'app-produto-list',
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
  templateUrl: './produto-list.component.html',
  styleUrl: './produto-list.component.css'
})
export class ProdutoListComponent implements OnInit {
  produtos = signal<Produto[]>([]);
  produtosSelecionados = signal<Produto[]>([]);

  // Filtros
  filtros = signal<ProdutoFiltros>({
    busca: '',
    categoria: undefined,
    status: 'todos',
    estoque: 'todos'
  });

  categorias = signal<any[]>([]);

  statusOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ativo', value: 'ativo' },
    { label: 'Inativo', value: 'inativo' }
  ];

  estoqueOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Em Estoque', value: 'em-estoque' },
    { label: 'Estoque Baixo', value: 'estoque-baixo' },
    { label: 'Sem Estoque', value: 'sem-estoque' }
  ];

  constructor(
    private produtoService: ProdutoService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.carregarProdutos();
    this.carregarCategorias();
  }

  carregarProdutos() {
    // Carrega produtos da API
    this.produtoService.listarTodosAPI().subscribe({
      next: (produtos) => {
        const produtosFiltrados = this.aplicarFiltrosLocais(produtos);
        this.produtos.set(produtosFiltrados);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os produtos. Verifique se o backend está rodando.'
        });
        this.produtos.set([]);
      }
    });
  }

  aplicarFiltrosLocais(produtos: Produto[]): Produto[] {
    let produtosFiltrados = produtos;
    const filtros = this.filtros();

    // Filtro de busca
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      produtosFiltrados = produtosFiltrados.filter(p =>
        p.nome.toLowerCase().includes(busca) ||
        p.codigoInterno.toLowerCase().includes(busca) ||
        p.codigoBarras?.toLowerCase().includes(busca)
      );
    }

    // Filtro de categoria
    if (filtros.categoria) {
      produtosFiltrados = produtosFiltrados.filter(p => p.categoria === filtros.categoria);
    }

    // Filtro de status
    if (filtros.status && filtros.status !== 'todos') {
      produtosFiltrados = produtosFiltrados.filter(p => p.ativo === (filtros.status === 'ativo'));
    }

    // Filtro de estoque
    if (filtros.estoque && filtros.estoque !== 'todos') {
      produtosFiltrados = produtosFiltrados.filter(p => {
        switch (filtros.estoque) {
          case 'em-estoque':
            return p.estoque > p.estoqueMinimo;
          case 'estoque-baixo':
            return p.estoque > 0 && p.estoque <= p.estoqueMinimo;
          case 'sem-estoque':
            return p.estoque === 0;
          default:
            return true;
        }
      });
    }

    return produtosFiltrados;
  }

  carregarCategorias() {
    const cats = this.produtoService.getCategorias();
    this.categorias.set([
      { label: 'Todas', value: undefined },
      ...cats.map(c => ({ label: c.nome, value: c.nome }))
    ]);
  }

  aplicarFiltros() {
    this.carregarProdutos();
  }

  limparFiltros() {
    this.filtros.set({
      busca: '',
      categoria: undefined,
      status: 'todos',
      estoque: 'todos'
    });
    this.carregarProdutos();
  }

  novoProduto() {
    this.router.navigate(['/produtos/novo']);
  }

  editarProduto(id: number) {
    this.router.navigate(['/produtos', id]);
  }

  verProduto(id: number) {
    this.router.navigate(['/produtos', id]);
  }

  excluirProduto(produto: Produto, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Deseja realmente excluir o produto "${produto.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        // Usa API para excluir
        this.produtoService.excluirAPI(produto.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto excluído com sucesso'
            });
            this.carregarProdutos();
          },
          error: (error) => {
            console.error('Erro ao excluir produto:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir produto'
            });
          }
        });
      }
    });
  }

  getEstoqueStatus(produto: Produto): 'success' | 'warning' | 'danger' {
    if (produto.estoque === 0) return 'danger';
    if (produto.estoque <= produto.estoqueMinimo) return 'warning';
    return 'success';
  }

  getEstoqueIcon(produto: Produto): string {
    if (produto.estoque === 0) return '🔴';
    if (produto.estoque <= produto.estoqueMinimo) return '⚠️';
    return '✅';
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
}
