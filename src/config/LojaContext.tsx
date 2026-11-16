import {createContext,useContext,type ReactNode} from 'react';
import {loja} from './loja';
export type ConfigLoja=typeof loja;
const Context=createContext<ConfigLoja>(loja);
export const useLoja=()=>useContext(Context);
export function LojaProvider({valor,children}:{valor:ConfigLoja;children:ReactNode}){
 return <Context.Provider value={valor}>{children}</Context.Provider>;
}
