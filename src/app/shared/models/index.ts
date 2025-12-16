// Central barrel file for all models

// Produto models
export * from './produto.model';

// Venda models
export * from './venda.model';
export * from './venda-historico.model';
export * from './carrinho.model';

// Usuario models (features version is more complete)
export * from '../../features/usuarios/models/usuario.model';

// Estoque models
export * from '../../features/estoque/models/estoque.model';
export * from '../../features/estoque/models/movimentacao.model';

// Caixa models
export * from '../../features/caixa/models/caixa.model';

// Notas Fiscais models
export * from '../../features/notas-fiscais/models/nota-fiscal.model';
