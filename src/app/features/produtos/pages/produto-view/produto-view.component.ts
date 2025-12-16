import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Produto } from '../../../../shared/models/produto.model';
import { ProdutoService } from '../../services/produto.service';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-produto-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TabViewModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputTextarea,
    DropdownModule,
    CheckboxModule,
    FileUploadModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './produto-view.component.html',
  styleUrl: './produto-view.component.css'
})
export class ProdutoViewComponent implements OnInit {
  form!: FormGroup;
  produtoId: number | null = null;
  isEditMode = false;

  categorias = signal<any[]>([]);
  subcategorias = signal<any[]>([]);
  fornecedores = signal<any[]>([]);

  unidadesMedida = [
    { label: 'Unidade (UN)', value: 'UN' },
    { label: 'Quilograma (KG)', value: 'KG' },
    { label: 'Litro (LT)', value: 'LT' },
    { label: 'Caixa (CX)', value: 'CX' },
    { label: 'Pacote (PCT)', value: 'PCT' }
  ];

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.inicializarForm();
    this.carregarDados();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.produtoId = +id;
      this.isEditMode = true;
      this.carregarProduto(this.produtoId);
    } else {
      this.form.patchValue({ codigoInterno: this.produtoService.gerarCodigoInterno() });
    }
  }

  inicializarForm() {
    this.form = this.fb.group({
      // Informações Básicas
      nome: ['', Validators.required],
      codigoInterno: ['', Validators.required],
      codigoBarras: [''],
      categoria: ['', Validators.required],
      subcategoria: [''],
      unidadeMedida: ['UN', Validators.required],
      descricao: [''],
      marca: [''],
      modelo: [''],

      // Preços
      precoCusto: [0, [Validators.required, Validators.min(0)]],
      precoVenda: [0, [Validators.required, Validators.min(0)]],
      descontoMaximo: [0],
      permiteDesconto: [true],

      // Estoque
      estoque: [0, Validators.required],
      estoqueMinimo: [0, Validators.required],
      estoqueMaximo: [0],
      localizacaoEstoque: [''],
      controlarEstoque: [true],
      permiteEstoqueNegativo: [false],

      // Fiscal
      ncm: [''],
      cest: [''],
      cfop: [''],
      origemMercadoria: [''],
      cst: [''],
      aliquotaIcms: [0],
      aliquotaPis: [0],
      aliquotaCofins: [0],

      // Fornecedor
      fornecedorId: [null],
      codigoFornecedor: [''],
      tempoReposicao: [0],

      // Dimensões
      pesoBruto: [0],
      pesoLiquido: [0],
      altura: [0],
      largura: [0],
      profundidade: [0],

      // Status
      ativo: [true],
      destaque: [false],
      novidade: [false],
      promocao: [false]
    });

    // Watch categoria changes
    this.form.get('categoria')?.valueChanges.subscribe(categoria => {
      if (categoria) {
        const subs = this.produtoService.getSubcategorias(categoria);
        this.subcategorias.set(subs.map(s => ({ label: s, value: s })));
      }
    });
  }

  carregarDados() {
    // Carrega categorias da API
    this.categoriaService.listarAtivasAPI().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias.map(c => ({ label: c.nome, value: c.nome })));
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        // Fallback para dados mockados
        const cats = this.produtoService.getCategorias();
        this.categorias.set(cats.map(c => ({ label: c.nome, value: c.nome })));
      }
    });

    const forn = this.produtoService.getFornecedores();
    this.fornecedores.set(forn.map(f => ({ label: f.nome, value: f.id })));
  }

  carregarProduto(id: number) {
    // Carrega produto da API
    this.produtoService.buscarPorIdAPI(id).subscribe({
      next: (produto) => {
        if (produto) {
          this.form.patchValue(produto);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Produto não encontrado'
          });
          this.router.navigate(['/produtos']);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar produto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar produto'
        });
        this.router.navigate(['/produtos']);
      }
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    const produto = this.form.value;

    if (this.isEditMode && this.produtoId) {
      // Atualizar via API
      this.produtoService.atualizarAPI(this.produtoId, produto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto atualizado com sucesso'
          });
          setTimeout(() => {
            this.router.navigate(['/produtos']);
          }, 1500);
        },
        error: (error) => {
          console.error('Erro ao atualizar produto:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Erro ao atualizar produto'
          });
        }
      });
    } else {
      // Criar via API
      this.produtoService.criarAPI(produto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto criado com sucesso'
          });
          setTimeout(() => {
            this.router.navigate(['/produtos']);
          }, 1500);
        },
        error: (error) => {
          console.error('Erro ao criar produto:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Erro ao criar produto'
          });
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/produtos']);
  }

  get margemLucro(): number {
    const custo = this.form.get('precoCusto')?.value || 0;
    const venda = this.form.get('precoVenda')?.value || 0;
    return this.produtoService.calcularMargemLucro(custo, venda);
  }

  get markup(): number {
    const custo = this.form.get('precoCusto')?.value || 0;
    const venda = this.form.get('precoVenda')?.value || 0;
    return this.produtoService.calcularMarkup(custo, venda);
  }
}
