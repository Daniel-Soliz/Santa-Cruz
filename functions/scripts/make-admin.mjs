import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
const email=process.argv[2];
if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
 console.error('Uso: npm run make-admin -- email@restaurante.com.br');
 process.exit(1);
}
initializeApp({credential:applicationDefault()});
const user=await getAuth().getUserByEmail(email);
if (user.disabled || user.providerData.every(p=>p.providerId!=='password')) {
 throw new Error('A conta deve estar ativa e ter login com e-mail/senha habilitado.');
}
await getAuth().setCustomUserClaims(user.uid,{admin:true});
console.log('Permissão concedida à conta:',email,'. Faça logout/login para atualizar as permissões.');
