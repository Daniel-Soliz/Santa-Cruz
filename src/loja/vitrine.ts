import type {Categoria, LinhaCarrinho, Produto} from './types';

export const LIMITE_FOTOS = 3;

export function fotosDoProduto(dados: {foto?: unknown; fotos?: unknown}): string[] {
 const fotos = Array.isArray(dados.fotos) ? dados.fotos : [];
 return [...new Set([dados.foto, ...fotos]
  .filter((foto): foto is string => typeof foto === 'string')
  .map(foto => foto.trim()).filter(Boolean))].slice(0, LIMITE_FOTOS);
}

export function sugerirBebidas(linhas: Pick<LinhaCarrinho, 'produtoId'>[], produtos: Produto[], categorias: Categoria[]): Produto[] {
 const categoriasDeBebidas = new Set(categorias
  .filter(categoria => /\b(bebidas?|sucos?|refrigerantes?)\b/i.test(`${categoria.id} ${categoria.nome}`))
  .map(categoria => categoria.id));
 const bebidas = produtos.filter(produto => categoriasDeBebidas.has(produto.categoriaId));
 if (!linhas.length || linhas.some(linha => bebidas.some(bebida => bebida.id === linha.produtoId))) return [];
 return bebidas.filter(bebida => bebida.disponivel).slice(0, 3);
}
