import {createInterface,Interface} from 'node:readline';
import { stdin, stdout } from 'process';

export async function readLine(str:string, rl:Interface, func:(a:string) => string) {
    return new Promise(resolve => {
        rl.question(str, (answer) => {
            console.log(func(answer))
            resolve(str);
        });
    });
}

export async function startREPL(func:(a:string) => string) {
    const rl = createInterface({
        input: stdin,
        output: stdout
    });
    try{
        while(true) {
            await readLine("tlisp> ",rl,func);
        }
    }finally {
        rl.close();
    }
}

