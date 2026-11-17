import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { paginasLoja, type PaginaLoja } from '../navegacao';

type Props = {
 paginas: PaginaLoja[];
 atual: PaginaLoja | null;
 voltarAVitrine: () => void;
};

export function NavegacaoLoja({ paginas, atual, voltarAVitrine }: Props) {
 const [aberto, setAberto] = useState(false);
 const menu = useRef<HTMLDivElement>(null);
 const botao = useRef<HTMLButtonElement>(null);

 useEffect(() => {
  if (!aberto) return;
  const fecharFora = (evento: PointerEvent) => {
   if (!menu.current?.contains(evento.target as Node)) setAberto(false);
  };
  const fecharComEscape = (evento: KeyboardEvent) => {
   if (evento.key !== 'Escape') return;
   setAberto(false);
   botao.current?.focus();
  };
  const fecharAoNavegar = () => setAberto(false);
  document.addEventListener('pointerdown', fecharFora);
  document.addEventListener('keydown', fecharComEscape);
  window.addEventListener('hashchange', fecharAoNavegar);
  return () => {
   document.removeEventListener('pointerdown', fecharFora);
   document.removeEventListener('keydown', fecharComEscape);
   window.removeEventListener('hashchange', fecharAoNavegar);
  };
 }, [aberto]);

 return <div className="menu-loja" ref={menu} onBlur={evento => {
  if (!evento.currentTarget.contains(evento.relatedTarget)) setAberto(false);
 }}>
  <button ref={botao} type="button" className="menu-loja__botao" aria-controls="menu-loja-links"
   aria-expanded={aberto} aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} onClick={() => setAberto(valor => !valor)}>
   {aberto ? <X size={22} aria-hidden="true"/> : <Menu size={22} aria-hidden="true"/>}
  </button>
  <nav id="menu-loja-links" className="menu-loja__painel" aria-label="Navegação principal" hidden={!aberto}>
   {paginas.map(pagina => <a key={pagina} href={`#${pagina}`} aria-current={atual === pagina ? 'page' : undefined} onClick={evento => {
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    setAberto(false);
    if (window.location.hash === `#${pagina}`) {
     evento.preventDefault();
     voltarAVitrine();
    }
   }}>{paginasLoja[pagina]}</a>)}
  </nav>
 </div>;
}
