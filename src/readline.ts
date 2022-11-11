import * as readline2 from 'node:readline';
import { stdin, stdout } from 'process';

const rl = readline2.createInterface({
    input: stdin,
    output: stdout
});

export async function readLine(str:string, func:(a:string) => string) {
    return new Promise(resolve => {
        rl.question(str, (answer) => {
            console.log(func(answer))
            resolve(str);
        });
    });
}

export async function start(func:(a:string) => string) {
    try{
        while(true) {
            await readLine("tlisp> ",func);
        }
    }finally {
        rl.close();
    }
}

