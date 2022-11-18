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

        while(true) {
            try {
                await readLine("tlisp> ", rl, func);
            } catch (e) {
                console.log("kello")
            }
            console.log("hi\n")
        }
}

