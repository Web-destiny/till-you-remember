import {mkdirSync,cpSync,readdirSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),out=path.join(root,'release'),repo=path.join(out,'github-pages');
mkdirSync(repo,{recursive:true});
const files=['dist','.github','package.json','server.mjs','README.md','HOSTING.md','ASSETS.md','ASSETS-V2.md','qa-v2.mjs','qa-companion.mjs','prepare-release.mjs'];
for(const file of files)cpSync(path.join(root,file),path.join(repo,file),{recursive:true,force:true});
const quote=s=>"'"+s.replaceAll("'","''")+"'";
function zip(destination,entries,cwd){
 if(process.platform==='win32'){const command=`Compress-Archive -LiteralPath @(${entries.map(e=>quote(path.join(cwd,e))).join(',')}) -DestinationPath ${quote(destination)} -Force`;execFileSync('powershell.exe',['-NoProfile','-Command',command],{stdio:'inherit'});}
 else execFileSync('zip',['-qr',destination,...entries],{cwd,stdio:'inherit'});
}
const repoZip=path.join(out,'till-you-remember-github.zip'),staticZip=path.join(out,'till-you-remember-static.zip');
zip(repoZip,files,repo);zip(staticZip,readdirSync(path.join(root,'dist')),path.join(root,'dist'));
console.log(JSON.stringify({github:repoZip,github_bytes:statSync(repoZip).size,static:staticZip,static_bytes:statSync(staticZip).size}));
