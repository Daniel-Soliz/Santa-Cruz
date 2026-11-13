export type Categoria = {id:string; nome:string; ordem:number};
export type Variacao = {id:string; nome:string; acrescimo:number};
export type Opcional = {id:string; nome:string; preco:number};
export type Produto = {
 id:string;categoriaId:string;nome:string;descricao:string;preco:number;foto:string;
 disponivel:boolean;destaque:boolean;exemplo:boolean;variacoes:Variacao[];opcionais:Opcional[];tags:string[];
};
export type LinhaCarrinho = {
 chave:string;produtoId:string;quantidade:number;variacaoId:string;
 opcionaisIds:string[];observacao:string;
};
export type TipoPedido='entrega'|'retirada'|'local';
export type Pagamento='pix'|'cartao'|'dinheiro';
export type Cliente={
 nome:string;telefone:string;cep:string;rua:string;numero:string;complemento:string;
 bairro:string;cidade:string;uf:string;referencia:string;
};
export type PedidoCheckout={
 numero:string;cliente:Cliente;tipo:TipoPedido;pagamento:Pagamento;
 trocoPara:string;observacoesGerais:string;linhas:LinhaCarrinho[];foraHorario:boolean;
};
