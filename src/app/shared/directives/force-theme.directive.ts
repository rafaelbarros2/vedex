import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appForceTheme]',
  standalone: true
})
export class ForceThemeDirective implements OnInit {

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.forceTheme();
  }

  private forceTheme(): void {
    // Remove qualquer classe de tema escuro
    this.renderer.removeClass(this.el.nativeElement, 'p-theme-dark');

    // Adiciona classe de tema light
    this.renderer.addClass(this.el.nativeElement, 'p-theme-light');

    // Força color-scheme
    this.renderer.setStyle(this.el.nativeElement, 'color-scheme', 'light');

    // Se for um componente PrimeNG, força atributos específicos
    if (this.el.nativeElement.classList.contains('p-component')) {
      this.renderer.removeAttribute(this.el.nativeElement, 'data-theme');
      this.renderer.setAttribute(this.el.nativeElement, 'data-theme', 'light');
    }
  }
}