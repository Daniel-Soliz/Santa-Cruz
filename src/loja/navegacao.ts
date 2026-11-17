export const paginasLoja = {
 inicio: 'Início',
 destaques: 'Destaques da casa',
 cardapio: 'Cardápio',
 entrega: 'Entrega e retirada',
 contato: 'Contato e localização',
 sobre: 'Sobre a casa',
 suporte: 'Suporte'
} as const;

export type PaginaLoja = keyof typeof paginasLoja;

export function lerNavegacao(hash: string): { pagina: PaginaLoja; ancora?: string } {
 const trecho = hash.slice(1);
 if (Object.hasOwn(paginasLoja, trecho)) return { pagina: trecho as PaginaLoja };
 if (trecho.startsWith('categoria-')) return { pagina: 'cardapio', ancora: trecho };
 if (trecho === 'localizacao') return { pagina: 'contato' };
 if (trecho === 'como-funciona' || trecho === 'consultar-entrega') return { pagina: 'entrega', ancora: trecho };
 if (trecho === 'avaliacoes' || trecho === 'espaco') return { pagina: 'sobre', ancora: trecho };
 return { pagina: 'inicio' };
}
