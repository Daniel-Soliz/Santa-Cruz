import {useEffect,useState,type FormEvent} from 'react';
import {ArrowUpRight,Save} from 'lucide-react';
import {lerConteudo,validarConteudo,type ConteudoLoja} from '../config/conteudoLoja';
import {EditorFoto} from './EditorFoto';
import {erroLegivel,supabase,type ConfiguracaoAdmin} from './backend';

type CampoTexto={ [K in keyof ConteudoLoja]:ConteudoLoja[K] extends string?K:never }[keyof ConteudoLoja];
type CampoImagem='logo'|'heroFoto'|'fachada'|'salao';

export function EditorVitrine({config,atualizar}:{config:ConfiguracaoAdmin;atualizar:()=>Promise<void>}){
 const origem=JSON.stringify(config.conteudo??{});
 const [dados,setDados]=useState(()=>lerConteudo(config.conteudo));
 const [erro,setErro]=useState(''),[mensagem,setMensagem]=useState(''),[salvando,setSalvando]=useState(false);
 useEffect(()=>{setDados(lerConteudo(JSON.parse(origem)));},[origem]);
 const alterar=<K extends keyof ConteudoLoja>(campo:K,valor:ConteudoLoja[K])=>{
  setDados(v=>({...v,[campo]:valor}));setMensagem('');
 };
 const texto=(campo:CampoTexto,rotulo:string,linhas=0)=>(
  <label>{rotulo}{linhas?
   <textarea rows={linhas} maxLength={1000} value={dados[campo]} onChange={e=>alterar(campo,e.target.value)}/>:
   <input maxLength={1000} value={dados[campo]} onChange={e=>alterar(campo,e.target.value)}/>}</label>
 );
 const foto=(campo:CampoImagem,rotulo:string)=>(
  <div className="adm-form">
   <EditorFoto titulo={rotulo} produtoId={`vitrine-${campo}`} foto={dados[campo]} nome={rotulo}
    onSalvar={url=>{alterar(campo,url);if(campo==='heroFoto')alterar('heroImagemIlustrativa',false);}}/>
   {texto(campo,`Link da imagem · ${rotulo}`)}
  </div>
 );
 async function salvar(evento:FormEvent){
  evento.preventDefault();setErro('');setMensagem('');
  const falha=validarConteudo(dados);if(falha){setErro(falha);return;}
  setSalvando(true);
  try{
   const {data,error}=await supabase!.from('sc_configuracao').update({conteudo:lerConteudo(dados),atualizado_em:new Date().toISOString()})
    .eq('id','principal').select('id').single();
   if(error||!data)throw error||new Error('Não foi possível gravar a página inicial.');
   setMensagem('Página inicial publicada. Abra a loja para conferir.');await atualizar();
  }catch(e){setErro(erroLegivel(e));}
  finally{setSalvando(false);}
 }
 return <section className="adm-conteudo">
  <div className="adm-secao-topo"><div><h2>Página inicial</h2><p>Edite o que o cliente vê na abertura, no endereço e nas demais seções da vitrine.</p></div>
   <a className="adm-link" href={import.meta.env.BASE_URL} target="_blank" rel="noopener noreferrer">Abrir loja <ArrowUpRight size={17}/></a></div>
  {config.conteudo===undefined&&<p className="adm-aviso">A edição da vitrine precisa da atualização do banco GERENCIAR_VITRINE_SANTA_CRUZ.sql.</p>}
  <form className="adm-form" onSubmit={e=>void salvar(e)}>
   <details className="adm-card adm-vitrine" open><summary>Abertura e imagem principal</summary>
    <div className="adm-form">
     <div className="adm-duas-colunas">{texto('nomeCurto','Nome da loja')}{texto('unidade','Unidade no cabeçalho')}</div>
     {texto('etiquetaHero','Texto acima do título')}
     <div className="adm-duas-colunas">{texto('tituloHero','Título principal')}{texto('destaqueHero','Final do título em destaque')}</div>
     {texto('textoHero','Descrição da abertura',2)}{texto('botaoHero','Texto do botão principal')}
     {foto('heroFoto','Imagem principal')}{foto('logo','Logo da loja')}
     <label className="adm-toggle"><input type="checkbox" checked={dados.heroImagemIlustrativa} onChange={e=>alterar('heroImagemIlustrativa',e.target.checked)}/> A imagem principal é ilustrativa</label>
    </div>
   </details>
   <details className="adm-card adm-vitrine"><summary>Localização e contato</summary><div className="adm-form">
    {texto('tituloLocal','Título da localização')}{texto('textoLocal','Texto da localização',2)}
    {texto('endereco','Endereço completo para exibição e mapa')}
    <div className="adm-duas-colunas">{texto('cep','CEP')}{texto('telefone','Telefone exibido')}</div>
    {texto('whatsapp','WhatsApp com 55 e DDD')}{texto('instagram','Link do Instagram')}
    <div className="adm-duas-colunas">{texto('tituloAtendimento','Título de atendimento no rodapé')}{texto('textoSuporte','Texto do link de suporte')}</div>
    {texto('textoRodape','Texto do rodapé',2)}
    <fieldset className="adm-vitrine-horarios"><legend>Horários de atendimento</legend>
     {dados.horarios.map((hora,i)=>{
      function atualizarHora(campo:'aberto'|'abertura'|'fechamento',valor:boolean|string){
       alterar('horarios',dados.horarios.map((item,j)=>j===i?{...item,[campo]:valor}:item));
      }
      return <div className="adm-vitrine-hora" key={hora.dia}>
       <label><input type="checkbox" checked={hora.aberto} onChange={e=>atualizarHora('aberto',e.target.checked)}/> {hora.dia}</label>
       <label>Abertura<input aria-label={`Abertura · ${hora.dia}`} type="time" disabled={!hora.aberto} required value={hora.abertura} onChange={e=>atualizarHora('abertura',e.target.value)}/></label>
       <label>Fechamento<input aria-label={`Fechamento · ${hora.dia}`} type="time" disabled={!hora.aberto} required value={hora.fechamento} onChange={e=>atualizarHora('fechamento',e.target.value)}/></label>
      </div>;
     })}
    </fieldset>
   </div></details>
   <details className="adm-card adm-vitrine"><summary>Cardápio, história e outras seções</summary><div className="adm-form">
    {texto('tituloCardapio','Título do cardápio')}{texto('tituloDestaques','Título dos destaques')}
    {texto('textoDestaques','Descrição dos destaques',2)}
    <label className="adm-toggle"><input type="checkbox" checked={dados.mostrarDestaques} onChange={e=>alterar('mostrarDestaques',e.target.checked)}/> Mostrar destaques</label>
    {texto('tituloInformacoes','Título das informações do pedido')}
    <label className="adm-toggle"><input type="checkbox" checked={dados.mostrarInformacoes} onChange={e=>alterar('mostrarInformacoes',e.target.checked)}/> Mostrar informações do pedido</label>
    {texto('tituloSobre','Título da história')}{texto('sobre','História da loja (vazio oculta a seção)',4)}
    {texto('fraseSobre','Frase do cartão da história')}
    {texto('tituloGaleria','Título da galeria')}{foto('fachada','Foto da fachada')}{foto('salao','Foto do salão')}
    {texto('tituloComoPedir','Título de como pedir')}{texto('textoComoPedir','Descrição de como pedir',2)}
    {texto('passoCardapioTitulo','Passo 1 · título')}{texto('passoCardapioTexto','Passo 1 · descrição',2)}
    {texto('passoSacolaTitulo','Passo 2 · título')}{texto('passoSacolaTexto','Passo 2 · descrição',2)}
    {texto('passoConfirmacaoTitulo','Passo 3 · título')}{texto('passoConfirmacaoTexto','Passo 3 · descrição',2)}
    <label className="adm-toggle"><input type="checkbox" checked={dados.mostrarComoPedir} onChange={e=>alterar('mostrarComoPedir',e.target.checked)}/> Mostrar como pedir</label>
    {texto('tituloAvaliacoes','Título das avaliações')}{texto('avaliacoesGoogleUrl','Link de avaliações no Google')}
    <label className="adm-toggle"><input type="checkbox" checked={dados.mostrarAvaliacoes} onChange={e=>alterar('mostrarAvaliacoes',e.target.checked)}/> Mostrar avaliações</label>
    <fieldset className="adm-vitrine-horarios"><legend>Avaliações da loja</legend>
     {dados.avaliacoes.map((item,i)=>{
      function editarAvaliacao(patch:Partial<typeof item>){
       alterar('avaliacoes',dados.avaliacoes.map((a,j)=>i===j?{...a,...patch}:a));
      }
      return <div className="adm-card adm-form" key={item.id}>
       <div className="adm-duas-colunas">
        <label>Nome exibido<input maxLength={120} value={item.nome} onChange={e=>editarAvaliacao({nome:e.target.value})}/></label>
        <label>Nota<select value={item.nota} onChange={e=>editarAvaliacao({nota:Number(e.target.value)})}>
         {[5,4,3,2,1].map(n=><option key={n} value={n}>{n}</option>)}
        </select></label>
       </div>
       <label>Depoimento<textarea rows={2} maxLength={500} value={item.texto} onChange={e=>editarAvaliacao({texto:e.target.value})}/></label>
       <label className="adm-toggle"><input type="checkbox" checked={item.exemplo} onChange={e=>editarAvaliacao({exemplo:e.target.checked})}/> Depoimento ilustrativo</label>
       <button type="button" className="adm-btn adm-btn--secundario" onClick={()=>alterar('avaliacoes',dados.avaliacoes.filter((_,j)=>i!==j))}>Remover avaliação</button>
      </div>;
     })}
     <button type="button" className="adm-btn adm-btn--secundario" disabled={dados.avaliacoes.length>=12} onClick={()=>alterar('avaliacoes',[...dados.avaliacoes,{id:crypto.randomUUID(),nome:'',texto:'',nota:5,exemplo:false}])}>Adicionar avaliação</button>
    </fieldset>
   </div></details>
   {erro&&<p className="adm-erro" role="alert">{erro}</p>}{mensagem&&<p className="adm-info" role="status">{mensagem}</p>}
   <button className="adm-btn" disabled={salvando||config.conteudo===undefined}><Save size={18}/>{salvando?'Publicando…':'Salvar e publicar página inicial'}</button>
  </form>
 </section>;
}
