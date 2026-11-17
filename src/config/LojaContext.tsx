import {createContext,useContext,type ReactNode} from 'react';
import {loja} from './loja';
import {aplicarConteudo} from './conteudoLoja';
export type ConfigLoja=ReturnType<typeof aplicarConteudo>;
const Context=createContext<ConfigLoja>(aplicarConteudo(loja,null));
export const useLoja=()=>useContext(Context);
export function LojaProvider({valor,children}:{valor:ConfigLoja;children:ReactNode}){
 return <Context.Provider value={valor}>{children}</Context.Provider>;
}
