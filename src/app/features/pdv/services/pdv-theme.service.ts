import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdvThemeService {
  private tema = signal<'claro' | 'escuro'>('claro');

  constructor() {
    // Carrega o tema salvo do localStorage
    const temaSalvo = localStorage.getItem('pdv-tema') as 'claro' | 'escuro' | null;
    if (temaSalvo) {
      this.tema.set(temaSalvo);
      this.aplicarTema(temaSalvo);
    } else {
      // Garante que inicia no tema claro
      this.aplicarTema('claro');
    }
  }

  getTema() {
    return this.tema();
  }

  setTema(tema: 'claro' | 'escuro') {
    this.tema.set(tema);
    localStorage.setItem('pdv-tema', tema);
    this.aplicarTema(tema);
  }

  isDarkMode() {
    return this.tema() === 'escuro';
  }

  private aplicarTema(tema: 'claro' | 'escuro') {
    const htmlElement = document.documentElement;
    if (tema === 'escuro') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }
}
