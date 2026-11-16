import assert from 'node:assert/strict';
import {test} from 'node:test';
import {fotosDoProduto,sugerirBebidas} from '../src/loja/vitrine';
import type {Produto} from '../src/loja/types';

test('a galeria preserva a capa antiga e limita as fotos distintas a três',()=>{
 assert.deepEqual(fotosDoProduto({foto:'capa.webp'}),['capa.webp']);
 assert.deepEqual(fotosDoProduto({foto:'capa.webp',fotos:['capa.webp','2.webp','3.webp','4.webp']}),['capa.webp','2.webp','3.webp']);
});
test('a sacola oferece bebidas disponíveis somente enquanto não tem bebida',()=>{
 const produto=(id:string,categoriaId:string,disponivel=true):Produto=>({
  id,categoriaId,disponivel,nome:id,descricao:'',preco:10,foto:'',destaque:false,
  exemplo:false,tags:[],variacoes:[],opcionais:[]
 });
 const produtos=[produto('prato','pratos'),produto('agua','bar'),produto('suco','bar',false)];
 const categorias=[{id:'bar',nome:'Bebidas e sucos',ordem:1}];
 assert.deepEqual(sugerirBebidas([],produtos,categorias),[]);
 assert.deepEqual(sugerirBebidas([{produtoId:'prato'}],produtos,categorias).map(p=>p.id),['agua']);
 assert.deepEqual(sugerirBebidas([{produtoId:'prato'},{produtoId:'agua'}],produtos,categorias),[]);
});
