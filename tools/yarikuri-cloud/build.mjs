import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {dirname,basename,resolve} from 'node:path';
const url=process.env.YARIKURI_PUBLIC_SUPABASE_URL;
const key=process.env.YARIKURI_PUBLIC_SUPABASE_KEY;
if(!url||!key)throw new Error('Set YARIKURI_PUBLIC_SUPABASE_URL and YARIKURI_PUBLIC_SUPABASE_KEY to the existing project public configuration.');
if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)||!key.startsWith('sb_publishable_'))throw new Error('Use the verified Supabase project URL and publishable key, never a secret/service-role key.');
const sourceDir=dirname(fileURLToPath(import.meta.url));
// In the repository this package lives at tools/yarikuri-cloud, not at its root.
const siteDir=basename(sourceDir)==='yarikuri-cloud'&&basename(dirname(sourceDir))==='tools'?'../../site':'site';
const outfile=process.env.YARIKURI_OUTPUT_FILE?resolve(process.env.YARIKURI_OUTPUT_FILE):resolve(sourceDir,siteDir,'cloud.js');
await build({absWorkingDir:sourceDir,entryPoints:['cloud-entry.mjs'],bundle:true,format:'iife',platform:'browser',target:'es2020',minify:true,outfile,define:{'process.env.YARIKURI_PUBLIC_SUPABASE_URL':JSON.stringify(url),'process.env.YARIKURI_PUBLIC_SUPABASE_KEY':JSON.stringify(key)}});
