import {randomBytes,scryptSync} from 'node:crypto';
// Password on stdin only. Output is a salted hash for ADMIN_PASSWORD_HASH.
let input='';for await(const part of process.stdin)input+=part;
const password=input.trim();if(!password)throw new Error('Password is required');
const salt=randomBytes(16).toString('hex');console.log(salt+':'+scryptSync(password,salt,64).toString('hex'));
