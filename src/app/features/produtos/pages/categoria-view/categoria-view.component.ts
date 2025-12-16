import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-categoria-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    CheckboxModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './categoria-view.component.html',
  styleUrl: './categoria-view.component.css'
})
export class CategoriaViewComponent implements OnInit {
  form!: FormGroup;
  categoriaId: number | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.inicializarForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.categoriaId = +id;
      this.isEditMode = true;
      this.carregarCategoria(this.categoriaId);
    }
  }

  inicializarForm() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      descricao: ['', Validators.maxLength(500)],
      ativo: [true]
    });
  }

  carregarCategoria(id: number) {
    this.categoriaService.buscarPorIdAPI(id).subscribe({
      next: (categoria) => {
        this.form.patchValue(categoria);
      },
      error: (error) => {
        console.error('Erro ao carregar categoria:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar categoria'
        });
        this.router.navigate(['/categorias']);
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
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const categoria = this.form.value;

    if (this.isEditMode && this.categoriaId) {
      // Atualizar via API
      this.categoriaService.atualizarAPI(this.categoriaId, categoria).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Categoria atualizada com sucesso'
          });
          setTimeout(() => {
            this.router.navigate(['/categorias']);
          }, 1500);
        },
        error: (error) => {
          console.error('Erro ao atualizar categoria:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Erro ao atualizar categoria'
          });
        }
      });
    } else {
      // Criar via API
      this.categoriaService.criarAPI(categoria).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Categoria criada com sucesso'
          });
          setTimeout(() => {
            this.router.navigate(['/categorias']);
          }, 1500);
        },
        error: (error) => {
          console.error('Erro ao criar categoria:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Erro ao criar categoria'
          });
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/categorias']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Campo obrigatório';
      if (field.errors['maxlength']) return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }
}
